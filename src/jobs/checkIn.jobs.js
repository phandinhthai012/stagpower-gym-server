// import cron from 'node-cron';
// import CheckIn from '../models/CheckIn';
// import socketService from '../services/socket.service';
// import { checkOutCheckIn } from '../services/checkIn.service';
// // tự động check out checkIn sau 4 giờ nếu checkIn chưa được check out
// // export function checkInJobs() {
// //     cron.schedule('0 0 * * *', async () => {
// //         try {
// //             const checkIns = await CheckIn.find({ status: 'Active', checkOutTime: { $exists: false } });
// //             for (const checkIn of checkIns) {
// //                 const checkOutTime = new Date(checkIn.checkInTime.getTime() + 4 * 60 * 60 * 1000);
// //                 if (checkOutTime < new Date()) {
// //                     await CheckIn.findByIdAndUpdate(checkIn._id, { status: 'Expired' });
// //                 }
// //             }
// //             // socketService.emitToRoom('admin-room', 'checkIn_checked_out', checkIns);
// //             // socketService.emitToRoom('trainer-room', 'checkIn_checked_out', checkIns);
// //         } catch (error) {
// //             console.error(error);
// //         }
// //     });
// // }



// export function autoCheckoutStaleCheckins() {
//     // Chạy vào đầu mỗi giờ (ví dụ: 1:00, 2:00, 3:00, ...)
//     const schedule = '0 * * * *'; // mỗi giờ một lần
//     const timezone = 'Asia/Ho_Chi_Minh';

//     cron.schedule(schedule, async () => {
//         console.log('[cron] Running job: Auto-checkout stale check-ins...');
        
//         try {
//             // Đặt ngưỡng thời gian, ví dụ: 12 giờ
//             const STALE_THRESHOLD_HOURS = 12;
//             const thresholdTime = new Date();
//             thresholdTime.setHours(thresholdTime.getHours() - STALE_THRESHOLD_HOURS);

//             // Tìm tất cả các lượt check-in vẫn "Active" và đã bắt đầu từ hơn 12 tiếng trước
//             const staleCheckins = await CheckIn.find({
//                 status: 'Active',
//                 checkInTime: { $lte: thresholdTime }
//             });

//             if (staleCheckins.length === 0) {
//                 console.log('[cron] No stale check-ins found.');
//                 return;
//             }

//             console.log(`[cron] Found ${staleCheckins.length} stale check-ins to process.`);

//             // Lặp qua và thực hiện checkout cho từng lượt
//             for (const checkin of staleCheckins) {
//                 try {
//                     // Sử dụng lại service checkOutCheckIn đã có
//                     await checkOutCheckIn(checkin._id);
//                     console.log(`[cron] Successfully auto-checked-out check-in ID: ${checkin._id}`);
//                 } catch (error) {
//                     console.error(`[cron] Failed to auto-checkout check-in ID: ${checkin._id}`, error.message);
//                     // Cân nhắc cập nhật ghi chú để admin biết đây là lỗi
//                     checkin.notes = `Auto-checkout failed: ${error.message}`;
//                     checkin.status = 'Cancelled'; // Hoặc một trạng thái lỗi khác
//                     await checkin.save();
//                 }
//             }
//         } catch (err) {
//             console.error('[cron] Error running auto-checkout job:', err);
//         }
//     }, { timezone });
// }