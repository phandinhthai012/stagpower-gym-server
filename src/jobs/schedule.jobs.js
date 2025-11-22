import cron from 'node-cron';
import Schedule from '../models/Schedule.js';
import CheckIn from '../models/CheckIn.js';
import Notification from '../models/Notification.js';
import socketService from '../services/socket.service.js';
import { updatePointsSession } from '../services/schedule.service.js';

const TIMEZONE = 'Asia/Ho_Chi_Minh';
const PENDING_CANCEL_AFTER_HOURS = 2;    // hủy lịch Pending quá hạn 2 giờ
const AUTO_COMPLETE_HOURS = 24;        // hoàn thành lịch sau 24 giờ

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

// Job 1: CHẠY MỖI 1 GIỜ - Cancel các lịch Pending quá hạn
export function autoUpdateSchedules() {
  const schedule = '0 * * * *'; // Chạy mỗi 1 giờ vào đầu giờ (00:00, 01:00, 02:00, ...)

  cron.schedule(schedule, async () => {
    const now = new Date();
    const cancelThreshold = new Date(now.getTime() - PENDING_CANCEL_AFTER_HOURS * 60 * 60 * 1000);

    console.log(`[cron] Running schedule auto-cancel job at ${now.toISOString()}...`);

    try {
      // 1. Tìm các schedule sẽ bị cancel để gửi thông báo
      const schedulesToCancel = await Schedule.find({
        status: 'Pending',
        dateTime: { $lt: cancelThreshold },
      });

      if (schedulesToCancel.length === 0) {
        // console.log('[cron] No pending schedules to cancel.');
        return;
      }

      console.log(`[cron] Found ${schedulesToCancel.length} schedules to cancel.`);

      // 2. Cancel các lịch Pending đã quá hạn > 2 giờ
      const cancelledResult = await Schedule.updateMany(
        {
          status: 'Pending',
          dateTime: { $lt: cancelThreshold },
        },
        {
          $set: {
            status: 'Cancelled',
            notes: 'Hệ thống tự động hủy do quá hạn xác nhận (quá 2 giờ so với giờ tập).'
          }
        }
      );

      if (cancelledResult.modifiedCount > 0) {
        console.log(`[cron] Auto-cancelled ${cancelledResult.modifiedCount} stale pending schedules`);

        // 3. Gửi thông báo cho các member có lịch bị cancel
        for (const schedule of schedulesToCancel) {
          if (schedule.memberId) {
            await emitNotification(
              schedule.memberId,
              'Hủy lịch PT',
              `Lịch PT của bạn vào lúc ${new Date(schedule.dateTime).toLocaleTimeString('vi-VN')} ngày ${new Date(schedule.dateTime).toLocaleDateString('vi-VN')} đã bị hủy do quá hạn xác nhận (quá 2 giờ so với giờ tập).`
            );
          }
        }
      }
    } catch (error) {
      console.error('[cron] Error running schedule auto-update job:', error);
    }
  }, { timezone: TIMEZONE });
}

// job 2: CHẠY HÀNG NGÀY (Lúc 02:00 sáng) ===
export function handleDailyScheduleJobs() {
  const schedule = '0 2 * * *'; // 02:00 AM mỗi ngày

  cron.schedule(schedule, async () => {
    console.log(`[cron-daily] Running daily schedule cleanup...`);
    const now = new Date();
    const completeThreshold = new Date(now.getTime() - AUTO_COMPLETE_HOURS * 60 * 60 * 1000);

    try {
      const schedulesToComplete = await Schedule.find({
        status: 'Confirmed',
        dateTime: { $lt: completeThreshold }
      });

      if (schedulesToComplete.length > 0) {
        console.log(`[cron-daily] Found ${schedulesToComplete.length} schedules to auto-complete.`);

        for (const schedule of schedulesToComplete) {
          try {
            schedule.status = 'Completed';
            schedule.notes = (schedule.notes ? schedule.notes + ". " : "") + "[System] Auto-completed.";
            await schedule.save();

            // Trừ buổi tập
            const result = await updatePointsSession(schedule._id);

            // Gửi thông báo (chỉ cần gửi 1 lần/ngày nên để ở đây hợp lý)
            await emitNotification(
              schedule.memberId,
              'Buổi tập hoàn thành',
              `Hệ thống đã tự động xác nhận hoàn thành buổi tập ngày ${new Date(schedule.dateTime).toLocaleDateString('vi-VN')}.`
            );
          } catch (err) {
            console.error(`[cron-daily] Failed schedule ${schedule._id}:`, err.message);
          }
        }
      } else {
        console.log('[cron-daily] No schedules to complete.');
      }
    } catch (error) {
      console.error('[cron-daily] Error:', error);
    }
  }, { timezone: TIMEZONE });
}