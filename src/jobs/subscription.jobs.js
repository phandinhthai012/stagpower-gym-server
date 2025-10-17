import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import { autoUnsuspend } from '../services/subscription.service.js';

export function expireSubscriptionJobs() {

    const schedule = '0 0 * * *'; // 00:00 hàng ngày
    const timezone = 'Asia/Ho_Chi_Minh';

    // Chạy mỗi ngày: cập nhật các subscription đã hết hạn thành Expired
    cron.schedule(schedule, async () => {
        try {
            const now = new Date();
            
            // 1. Expire các subscription Active đã hết hạn
            const expiredResult = await Subscription.updateMany(
                { status: 'Active', endDate: { $lte: now } },
                { $set: { status: 'Expired' } }
            );
            if (expiredResult.modifiedCount > 0) {
                console.log(`[cron] Expired subscriptions updated: ${expiredResult.modifiedCount}`);
            }
            
            // 2. Kích hoạt các subscription NotStarted đến thời gian bắt đầu
            const activatedResult = await Subscription.updateMany(
                { status: 'NotStarted', startDate: { $lte: now } },
                { $set: { status: 'Active' } }
            );
            if (activatedResult.modifiedCount > 0) {
                console.log(`[cron] Activated subscriptions updated: ${activatedResult.modifiedCount}`);
            }
            
        } catch (err) {
            console.error('[cron] Error updating subscriptions:', err);
        }
    }, { timezone: timezone });
}


export function informSubscriptionIscomingToExpire() {
    const schedule = '0 7 * * *'; // 07:00 hàng ngày
    const timezone = 'Asia/Ho_Chi_Minh';

}


export function autoUnsuspendSubscription() {
    const schedule = '0 0 * * *'; // 00:00 hàng ngày
    const timezone = 'Asia/Ho_Chi_Minh';
    let successCount = 0;
    let errorCount = 0;
    cron.schedule(schedule, async () => {
        const today = new Date();
        const subscriptions = await Subscription.find({
            status: 'Suspended',
            suspensionEndDate: { $lte: today }
        });

        for (const subscription of subscriptions) {
            const result = await autoUnsuspend(subscription._id);
            if (result) {
                successCount++;
            } else {
                errorCount++;
            }
        }
    }, { timezone: timezone });
}