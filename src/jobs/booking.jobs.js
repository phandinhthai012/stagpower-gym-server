import cron from 'node-cron';
import BookingRequest from '../models/BookingRequest.js';
import Notification from '../models/Notification.js';
import socketService from '../services/socket.service.js';

// Cấu hình thời gian
const TIMEZONE = 'Asia/Ho_Chi_Minh';
const EXPIRE_HOURS_ZZ = 2; // Hủy nếu quá giờ hẹn 2 tiếng mà vẫn Pending

// Helper gửi thông báo (giống bên schedule)
async function emitNotification(userId, title, message) {
    if (!userId) return;
    try {
        const notification = await Notification.create({
            userId,
            type: 'WARNING',
            title,
            message,
        });
        socketService.emitToUser(userId, 'notification', notification);
    } catch (e) {
        console.error('Failed to emit notification', e);
    }
}

export function expireOldBookingRequests() {
    // Chạy mỗi 2 giờ (vào 00:00, 02:00, 04:00, ...)
    const schedule = '0 */2 * * *'; 

    cron.schedule(schedule, async () => {
        const now = new Date();
        // Tính mốc thời gian hết hạn: Hiện tại - 2 giờ
        // Ví dụ: Bây giờ là 10:00, mốc là 08:00.
        // Lịch hẹn lúc 07:30 (nhỏ hơn 08:00) sẽ bị hủy.
        const expiryThreshold = new Date(now.getTime() - EXPIRE_HOURS_ZZ * 60 * 60 * 1000);

        console.log(`[cron] Running booking auto-expire job at ${now.toISOString()}...`);

        try {
            // 1. Tìm các BookingRequest thỏa mãn điều kiện
            const expiredRequests = await BookingRequest.find({
                status: 'Pending',
                requestDateTime: { $lt: expiryThreshold }
            });

            if (expiredRequests.length === 0) {
                // console.log('[cron] No pending booking requests to expire.');
                return;
            }

            console.log(`[cron] Found ${expiredRequests.length} expired booking requests.`);

            // 2. Xử lý từng request (Cập nhật & Gửi thông báo)
            for (const booking of expiredRequests) {
                booking.status = 'Expired';
                booking.notes = (booking.notes ? booking.notes + ". " : "") + "[System] Tự động hết hạn do quá giờ.";
                await booking.save();

                // Gửi thông báo cho Member
                await emitNotification(
                    booking.memberId,
                    'Yêu cầu đặt lịch hết hạn',
                    `Yêu cầu đặt lịch của bạn vào lúc ${new Date(booking.requestDateTime).toLocaleTimeString('vi-VN')} ngày ${new Date(booking.requestDateTime).toLocaleDateString('vi-VN')} đã hết hạn vì HLV không phản hồi.`
                );

                // Gửi thông báo cho Trainer (để họ biết mình bị lỡ)
                await emitNotification(
                    booking.trainerId,
                    'Yêu cầu đặt lịch hết hạn',
                    `Bạn đã bỏ lỡ yêu cầu đặt lịch từ hội viên vào lúc ${new Date(booking.requestDateTime).toLocaleTimeString('vi-VN')}. Yêu cầu đã tự động hủy.`
                );
            }

            console.log(`[cron] Successfully expired ${expiredRequests.length} booking requests.`);

        } catch (err) {
            console.error('[cron] Error expiring booking requests:', err);
        }
    }, { timezone: TIMEZONE });
}