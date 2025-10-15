import cron from 'node-cron';
import CheckIn from '../models/CheckIn';
import socketService from '../services/socket.service';
// tự động check out checkIn sau 4 giờ nếu checkIn chưa được check out
export function checkInJobs() {
    cron.schedule('0 0 * * *', async () => {
        try {
            const checkIns = await CheckIn.find({ status: 'Active', checkOutTime: { $exists: false } });
            for (const checkIn of checkIns) {
                const checkOutTime = new Date(checkIn.checkInTime.getTime() + 4 * 60 * 60 * 1000);
                if (checkOutTime < new Date()) {
                    await CheckIn.findByIdAndUpdate(checkIn._id, { status: 'Expired' });
                }
            }
            // socketService.emitToRoom('admin-room', 'checkIn_checked_out', checkIns);
            // socketService.emitToRoom('trainer-room', 'checkIn_checked_out', checkIns);
        } catch (error) {
            console.error(error);
        }
    });
}