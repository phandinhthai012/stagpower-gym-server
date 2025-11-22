import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import Notification from '../models/Notification.js';
import { autoUnsuspend } from '../services/subscription.service.js';
import socketService from '../services/socket.service.js';

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
    const schedule = '0 8 * * *'; // 08:00 hàng ngày
    const timezone = 'Asia/Ho_Chi_Minh';
    cron.schedule(schedule, async () => {
        console.log('[cron] Inform subscription is coming to expire');
        try {
            // const today = new Date();
            // const warningDates = [
            //     format(addDays(today, 7), 'yyyy-MM-dd'),
            //     format(addDays(today, 3), 'yyyy-MM-dd'),
            //     format(addDays(today, 1), 'yyyy-MM-dd')
            // ];
            // // tìm các subscription sắp hết hạn trong 7, 3, 1 ngày tới
            // const expiringSubscriptions = await Subscription.find({
            //     status: 'Active',
            //     $expr: {
            //         $in: [
            //             { $dateToString: { format: "%Y-%m-%d", date: "$endDate" } },
            //             warningDates
            //         ]
            //     }
            // }).populate('memberId').populate('packageId');
            // if (expiringSubscriptions.length === 0) {
            //     console.log('[cron] No subscriptions are expiring on the warning dates.');
            //     return;
            // }
            // for (const sub of expiringSubscriptions) {
            //     const user = sub.memberId;
            //     const pkg = sub.packageId;
            //     if (!user || !pkg) continue;
            //     const daysRemaining = Math.ceil((new Date(sub.endDate) - today) / (1000 * 60 * 60 * 24));
            //     const message = `Gói tập "${pkg.name}" của bạn sẽ hết hạn trong ${daysRemaining} ngày tới. Vui lòng gia hạn để không bị gián đoạn.`;
            //     const notification = await Notification.create({
            //         userId: user._id,
            //         type: 'WARNING',
            //         title: 'Gói tập sắp hết hạn!',
            //         message: message,
            //     });
            //     socketService.emitToUser(user._id, 'subscription_expiring_soon', notification);
            //     // gửi mail triển khai sau 
            // }

            //Tìm tất cả các gói sẽ hết hạn trong 7 ngày tới
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const warningDays = [7, 1]; // có thể mở rộng thêm cảnh báo 
            for (const days of warningDays) {

                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() + days)

                const nextDate = new Date(targetDate);
                nextDate.setDate(nextDate.getDate() + 1);

                const subscriptions = await Subscription.find({
                    status: 'Active',
                    endDate: {
                        $gte: targetDate,
                        $lt: nextDate
                    }
                }).populate('memberId').populate('packageId');
                if (subscriptions.length === 0) {
                    console.log('[cron] No subscriptions are expiring in 7 days.');
                    continue;
                }
                for (const sub of subscriptions) {
                    const user = sub.memberId;
                    const pkg = sub.packageId;
                    if (!user || !pkg) {
                        console.log(`[cron] Skipped subscription ${sub._id} - missing user or package`);
                        continue;
                    }
                    const message = `Gói tập "${pkg.name}" của bạn sẽ hết hạn trong ${days} ngày tới. Vui lòng gia hạn để không bị gián đoạn.`;
                    // tạo notification 
                    try {
                        const notification = await Notification.create({
                            userId: user._id,
                            type: 'WARNING',
                            title: 'Gói tập sắp hết hạn!',
                            message: message,
                        });
                        // socket 
                        socketService.emitToUser(user._id, 'subscription_expiring_soon', notification);
                    } catch (notifError) {
                        console.error(`[cron] Failed to create notification for subscription ${sub._id}:`, notifError.message);
                    }

                    // gửi mail triển khai sau 
                }
            }
        } catch (err) {
            console.error('[cron] Error informing subscription is coming to expire:', err);
        }

    }, { timezone: timezone });
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
            try {
                const result = await autoUnsuspend(subscription._id);
                if (result) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (err) {
                console.error(`[cron] Error unsuspending subscription ${subscription._id}:`, err);
                errorCount++;
            }
        }
        console.log(`[cron] Auto unsuspend subscription completed. Success: ${successCount}, Error: ${errorCount}`);
    }, { timezone: timezone });
}