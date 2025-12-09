import cron from 'node-cron';
import CheckIn from '../models/CheckIn.js';
import Notification from '../models/Notification.js';
import socketService from '../services/socket.service.js';
import { checkOutCheckIn } from '../services/checkIn.service.js';
import { roleRoomMap } from '../utils/socketUtils.js';

export function autoCheckoutStaleCheckins() {
    // Chạy vào đầu mỗi giờ (ví dụ: 1:00, 2:00, 3:00, ...)
    const schedule = '0 * * * *'; // mỗi giờ một lần
    const timezone = 'Asia/Ho_Chi_Minh';

    cron.schedule(schedule, async () => {
        console.log('[cron] Running job: Auto-checkout stale check-ins...');

        try {
            // Đặt ngưỡng thời gian, ví dụ: 8 giờ (vì thời gian tập và thời gian mở của gym)
            const STALE_THRESHOLD_HOURS = 8;
            const thresholdTime = new Date();
            // thời gian hết hạn là 12 giờ trước
            thresholdTime.setHours(thresholdTime.getHours() - STALE_THRESHOLD_HOURS);

            // Tìm tất cả các lượt check-in vẫn "Active" và đã bắt đầu từ hơn 12 tiếng trước
            const staleCheckins = await CheckIn.find({
                status: 'Active',
                checkInTime: { $lte: thresholdTime }
            });

            if (staleCheckins.length === 0) {
                console.log('[cron] No stale check-ins found.');
                return;
            }

            console.log(`[cron] Found ${staleCheckins.length} stale check-ins to process.`);

            // Lặp qua và thực hiện checkout cho từng lượt
            for (const checkin of staleCheckins) {
                try {
                    // Sử dụng lại service checkOutCheckIn đã có
                    const updatedCheckin = await checkOutCheckIn(checkin._id);

                    console.log(`[cron] Successfully auto-checked-out check-in ID: ${checkin._id}`);
                    try {
                        const notification = await Notification.create({
                            userId: checkin.memberId,
                            title: 'Tự động checkout',
                            message: `Bạn đã được tự động checkout sau ${STALE_THRESHOLD_HOURS} giờ check-in.`,
                            type: 'INFO'
                        });
                        // socket đến user và admin
                        socketService.emitToUser(checkin.memberId, 'checkIn_checked_out', notification);
                        socketService.emitToRoom(roleRoomMap.admin, 'checkIn_checked_out', notification);
                        if (checkin.branchId) {
                            socketService.emitToBranch(checkin.branchId, 'checkIn_checked_out', notification);
                        }
                    } catch (notifError) {
                        console.error(`[cron] Failed to create notification for check-in ${checkin._id}:`, notifError.message);
                    }
                } catch (error) {
                    console.error(`[cron] Failed to auto-checkout check-in ID: ${checkin._id}`, error.message);
                    checkin.notes = `Auto-checkout failed: ${error.message}`;
                    checkin.status = 'Cancelled'; // Hoặc một trạng thái lỗi khác
                    await checkin.save();
                }
            }
        } catch (err) {
            console.error('[cron] Error running auto-checkout job:', err);
        }
    }, { timezone });
}