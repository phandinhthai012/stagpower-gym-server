import cron from 'node-cron';
import Discount from '../models/Discount.js';

export function autoChangeDiscountStatus() {
    // Chạy vào 00:00 hằng ngày
    const schedule = '0 0 * * *';
    const timezone = 'Asia/Ho_Chi_Minh';
    cron.schedule(schedule, async () => {
        console.log('[cron] Running job: Auto-change discount status...');
        try {
            const now = new Date();
            
            // 1. Vô hiệu hóa các discount đã hết hạn (endDate < now)
            const expiredResult = await Discount.updateMany(
                {
                    status: 'Active',
                    endDate: { $lt: now }
                },
                {
                    $set: { status: 'Inactive' }
                }
            );
            
            if (expiredResult.modifiedCount > 0) {
                console.log(`[cron] Deactivated ${expiredResult.modifiedCount} expired discount(s).`);
            }

            // 2. (Optional) Vô hiệu hóa các discount đã hết lượt sử dụng
            const exhaustedResult = await Discount.updateMany(
                {
                    status: 'Active',
                    usageLimit: { $ne: null },
                    $expr: { $gte: ['$usageCount', '$usageLimit'] }
                },
                {
                    $set: { status: 'Inactive' }
                }
            );

            if (exhaustedResult.modifiedCount > 0) {
                console.log(`[cron] Deactivated ${exhaustedResult.modifiedCount} exhausted discount(s).`);
            }

            // 3. (Optional) Kích hoạt các discount đã đến ngày bắt đầu nhưng vẫn Inactive
            const activatedResult = await Discount.updateMany(
                {
                    status: 'Inactive',
                    startDate: { $lte: now },
                    endDate: { $gte: now }
                },
                {
                    $set: { status: 'Active' }
                }
            );

            if (activatedResult.modifiedCount > 0) {
                console.log(`[cron] Activated ${activatedResult.modifiedCount} discount(s) that reached start date.`);
            }

            console.log('[cron] Auto-change discount status job completed.');
        }
        catch (error) {
            console.error('[cron] Error auto-change discount status:', error);
        }
    }, {
        scheduled: true,
        timezone: timezone
    });
}