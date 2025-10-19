import cron from 'node-cron';
import BookingRequest from '../models/BookingRequest';
import Notification from '../models/Notification';
import socketService from '../services/socket.service';
import { roleRoomMap } from '../utils/socketUtils';
import { startOfDay, subDays } from 'date-fns';

// hết hạn các booking request Pending mà có requestDateTime trong quá khứ cách ngày hết hạn 3 hoặc hơn ngày
export function expireOldBookingRequests() {
    const schedule = '0 1 * * *'; // 01:00 hàng ngày
    const timezone = 'Asia/Ho_Chi_Minh';

    cron.schedule(schedule, async () => {
        try {
            const now = startOfDay(new Date());

            // Xác định ngày giới hạn: bất kỳ yêu cầu nào CÓ TRƯỚC ngày này sẽ bị hết hạn
            // subDays(today, 3) nghĩa là lấy ngày hôm nay trừ đi 3 ngày.
            // ví dụ ngày hôm nay là 18/10/2025 thì expiryThresholdDate sẽ là 15/10/2025
            // thì các booking request Pending mà có requestDateTime trước 15/10/2025 sẽ bị hết hạn
            const expiryThresholdDate = subDays(now, 3);
            

            // lấy các booking request Pending mà có requestDateTime trước 15/10/2025
            const bookingsToExpire = await BookingRequest.find({
                status: 'Pending',
                requestDateTime: { $lt: expiryThresholdDate }
            });

            if (bookingsToExpire.length === 0) {
                console.log('[cron] No old booking requests found to expire.');
                return;
            }

            // Expire các booking request Pending đã quá giờ
            const result = await BookingRequest.updateMany(
                { 
                    status: 'Pending', 
                    requestDateTime: { 
                        $lt: expiryThresholdDate // $lt = less than (nhỏ hơn)
                    } 
                },
                { $set: { status: 'Expired' } }
            );
            

            if (result.modifiedCount > 0) {
                console.log(`[cron] Expired ${result.modifiedCount} old booking requests`);
            }
        } catch (err) {
            console.error('[cron] Error expiring booking requests:', err);
        }
    }, { timezone });
}