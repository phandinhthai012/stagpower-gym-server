import cron from 'node-cron';
import axios from 'axios';

/**
 * Ping server để giữ server luôn hoạt động (tránh chế độ ngủ trên Render)
 * Chạy mỗi 10 phút
 */
export function keepServerAlive() {
    // Chạy mỗi 10 phút: */10 * * * *
    // Hoặc mỗi 15 phút: */15 * * * *
    const schedule = '*/10 * * * *'; // Mỗi 10 phút
    const timezone = 'Asia/Ho_Chi_Minh';

    cron.schedule(schedule, async () => {
        try {
            const baseURL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
            const pingUrl = `${baseURL}/api/ping`;
            
            console.log(`[cron] Pinging server to keep alive: ${pingUrl}`);
            
            const response = await axios.get(pingUrl, {
                timeout: 5000, // 5 seconds timeout
                headers: {
                    'User-Agent': 'Keep-Alive-Cron-Job'
                }
            });

            if (response.status === 200) {
                console.log(`[cron] ✅ Server ping successful at ${new Date().toISOString()}`);
            } else {
                console.warn(`[cron] ⚠️ Server ping returned status ${response.status}`);
            }
        } catch (error) {
            console.error('[cron] ❌ Error pinging server:', error.message);
            // Không throw error để không làm gián đoạn các job khác
        }
    }, { timezone: timezone });

    console.log('[cron] Keep-alive job scheduled: ping server every 10 minutes');
}