import cron from 'node-cron';
import Schedule from '../models/Schedule.js';
import CheckIn from '../models/CheckIn.js';
import Notification from '../models/Notification.js';
import socketService from '../services/socket.service.js';

const TIMEZONE = 'Asia/Ho_Chi_Minh';
const CONFIRM_THRESHOLD_MINUTES = 60;    // tự động xác nhận trước 1 giờ
const END_GRACE_MINUTES = 30;            // thời gian chờ sau khi kết thúc
const PENDING_CANCEL_DAYS = 7;           // hủy lịch Pending quá hạn 7 ngày

async function emitNotification(userId, title, message) {
  if (!userId) return;
  const notification = await Notification.create({
    userId,
    type: 'INFO',
    title,
    message,
  });
  socketService.emitToUser(userId, 'notification', notification);
}

export function autoUpdateSchedules() {
  const schedule = '0 1 * * *'; // 01:00 hàng ngày

  cron.schedule(schedule, async () => {
    const now = new Date();
    const confirmThreshold = new Date(now.getTime() + CONFIRM_THRESHOLD_MINUTES * 60000);
    const cancelThreshold = new Date(now.getTime() - PENDING_CANCEL_DAYS * 24 * 60 * 60000); // ngày hôm nay trừ đi 7 ngày

    try {
      // 1. Auto-confirm lịch sắp diễn ra
    //   const confirmedResult = await Schedule.updateMany(
    //     {
    //       status: 'Pending',
    //       dateTime: { $gt: now, $lte: confirmThreshold },
    //     },
    //     { $set: { status: 'Confirmed' } }
    //   );
    //   if (confirmedResult.modifiedCount > 0) {
    //     console.log(`[cron] Auto-confirmed ${confirmedResult.modifiedCount} schedules`);
    //   }

      // 2 & 3. Auto-complete / NoShow
    //   const candidates = await Schedule.find({
    //     status: { $in: ['Pending', 'Confirmed'] },
    //     dateTime: { $lte: new Date(now.getTime() - END_GRACE_MINUTES * 60000) },
    //   });

    //   for (const schedule of candidates) {
    //     const endTime = new Date(schedule.dateTime.getTime() + schedule.durationMinutes * 60000);
    //     if (endTime.getTime() + END_GRACE_MINUTES * 60000 > now.getTime()) continue;

    //     // Tìm check-in hoàn thành của member trong khoảng thời gian buổi tập
    //     const checkIn = await CheckIn.findOne({
    //       memberId: schedule.memberId,
    //       status: 'Completed',
    //       checkInTime: { $lte: endTime },
    //       checkOutTime: { $gte: schedule.dateTime },
    //     });

    //     if (checkIn) {
    //       if (schedule.status !== 'Completed') {
    //         schedule.status = 'Completed';
    //         await schedule.save();
    //         await emitNotification(
    //           schedule.memberId,
    //           'Buổi tập đã hoàn thành',
    //           'Buổi tập với huấn luyện viên đã được ghi nhận hoàn thành.'
    //         );
    //         await emitNotification(
    //           schedule.trainerId,
    //           'Buổi tập đã hoàn thành',
    //           'Buổi tập với học viên đã được ghi nhận hoàn thành.'
    //         );
    //       }
    //     } else if (schedule.status !== 'NoShow') {
    //       schedule.status = 'NoShow';
    //       await schedule.save();
    //       await emitNotification(
    //         schedule.memberId,
    //         'Buổi tập bị đánh dấu vắng mặt',
    //         'Buổi tập đã qua nhưng không ghi nhận check-in. Vui lòng liên hệ huấn luyện viên nếu có nhầm lẫn.'
    //       );
    //       await emitNotification(
    //         schedule.trainerId,
    //         'Học viên vắng buổi tập',
    //         'Buổi tập đã qua nhưng không ghi nhận check-in từ học viên.'
    //       );
    //     }
    //   }

      // 4. Cancel các lịch Pending đã quá hạn > 7 ngày
      const cancelledResult = await Schedule.updateMany(
        {
          status: 'Pending',
          dateTime: { $lt: cancelThreshold },
        },
        { $set: { 
            status: 'Cancelled',
            notes: 'Hủy lịch do quá hạn đã quá 7 ngày'
         } }
      );
      if (cancelledResult.modifiedCount > 0) {
        console.log(`[cron] Auto-cancelled ${cancelledResult.modifiedCount} stale pending schedules`);
      }
    } catch (error) {
      console.error('[cron] Error running schedule auto-update job:', error);
    }
  }, { timezone: TIMEZONE });
}