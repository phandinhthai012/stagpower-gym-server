import cron from 'node-cron';
import Subscription from '../models/Subscription.js';

export function initSubscriptionJobs() {
  
    const schedule = '0 0 * * *'; // 00:00 hàng ngày
    const timezone = 'Asia/Ho_Chi_Minh';

    // Chạy mỗi giờ: cập nhật các subscription đã hết hạn thành Expired
    cron.schedule(schedule, async () => {
        try {
            const now = new Date();
            const result = await Subscription.updateMany(
                { status: 'Active', endDate: { $lte: now } },
                { $set: { status: 'Expired' } }
            );
            if (result.modifiedCount > 0) {
                console.log(`[cron] Expired subscriptions updated: ${result.modifiedCount}`);
            }
        } catch (err) {
            console.error('[cron] Error expiring subscriptions:', err);
        }
    }, { timezone: timezone });
}


export function informSubscriptionIscomingToExpire() {
    const schedule = '0 7 * * *'; // 07:00 hàng ngày
    const timezone = 'Asia/Ho_Chi_Minh';

}