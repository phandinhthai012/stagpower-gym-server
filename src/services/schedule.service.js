import Schedule from "../models/Schedule";
import User from "../models/User";
import Subscription from "../models/Subscription";
import { paginate } from "../utils/pagination";
import { withTransaction, findByIdWithSession, saveWithSession } from "../utils/transactionHelper";
export const createSchedule = async (scheduleData) => {
    const {
        memberId,
        trainerId,
        subscriptionId,
        branchId,
        dateTime,
        durationMinutes,
        notes,
        assignedExercises,
        status
    } = scheduleData;


    // ===== 1. VALIDATE MEMBER =====
    const member = await User.findById(memberId);
    if (!member || member.role !== 'member') {
        const error = new Error("Invalid member");
        error.statusCode = 400;
        error.code = "INVALID_MEMBER";
        throw error;
    }
    // ===== 2. VALIDATE TRAINER =====
    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
        const error = new Error("Invalid trainer");
        error.statusCode = 400;
        error.code = "INVALID_TRAINER";
        throw error;
    }
    // ===== 3. TỰ ĐỘNG CHỌN GÓI PT (NẾU CHƯA CÓ subscriptionId) =====
    let selectedSubscriptionId = subscriptionId;
    if (!selectedSubscriptionId) {
        // Frontend không truyền subscriptionId → TỰ ĐỘNG CHỌN
        const availableSubscriptions = await Subscription.find({
            memberId: memberId,
            type: { $in: ['PT', 'Combo'] },
            status: 'Active', // ✅ CHỈ LẤY ACTIVE
            ptsessionsRemaining: { $gt: 0 }
        })
            .sort({
                endDate: 1,                    // Sắp hết hạn trước
                ptsessionsRemaining: 1         // Ít buổi trước
            })
            .limit(1);

        const autoSelectedSubscription = availableSubscriptions[0];

        if (!autoSelectedSubscription) {
            const error = new Error(
                "No active PT subscription with available sessions found. " +
                "Please purchase a PT package first."
            );
            error.statusCode = 400;
            error.code = "NO_PT_SESSIONS_REMAINING";
            throw error;
        }

        selectedSubscriptionId = autoSelectedSubscription._id;

        console.log(`✅ Auto-selected subscription for member ${memberId}:`, {
            subscriptionId: selectedSubscriptionId,
            sessionsRemaining: autoSelectedSubscription.ptsessionsRemaining,
            endDate: autoSelectedSubscription.endDate
        });
    } else {
        // ===== 4. VALIDATE SUBSCRIPTION (NẾU CÓ) =====
        const subscription = await Subscription.findOne({
            _id: selectedSubscriptionId,
            memberId: memberId,
            type: { $in: ['PT', 'Combo'] },
            status: 'Active',
            ptsessionsRemaining: { $gt: 0 }
        });

        if (!subscription) {
            const error = new Error(
                "Invalid subscription or no PT sessions remaining"
            );
            error.statusCode = 400;
            error.code = "INVALID_SUBSCRIPTION";
            throw error;
        }
    }
    const requestDate = new Date(dateTime);
    if (requestDate < new Date()) {
        const error = new Error("Schedule date time cannot be in the past");
        error.statusCode = 400;
        error.code = "INVALID_DATETIME";
        throw error;
    }

    // ===== 6. VALIDATE DURATION =====
    if (durationMinutes < 30 || durationMinutes > 150) {
        const error = new Error("Duration must be between 30 and 150 minutes");
        error.statusCode = 400;
        error.code = "INVALID_DURATION";
        throw error;
    }
    // ===== 7. CHECK TRAINER AVAILABILITY =====
    const BUFFER_TIME_MINUTES = 15;
    const startTime = new Date(requestDate.getTime());
    const endTime = new Date(requestDate.getTime() + durationMinutes * 60000);
    const endTimeWithBuffer = new Date(endTime.getTime() + BUFFER_TIME_MINUTES * 60000); // ✅ Thêm 15 phút
    const conflictingSchedule = await Schedule.findOne({
        trainerId,
        status: { $in: ['Pending', 'Confirmed'] },
        dateTime: {
            $gte: new Date(startTime.getTime() - 180 * 60000), // 3 giờ trước
            //  $lte: new Date(endTime.getTime() + 180 * 60000)     // 3 giờ sau
            $lte: new Date(endTimeWithBuffer.getTime() + 180 * 60000) // 3 giờ sau +15 phút nghỉ
        }
    });

    if (conflictingSchedule) {
        // Kiểm tra chi tiết xem có thực sự conflict không
        const conflictEnd = new Date(
            new Date(conflictingSchedule.dateTime).getTime() +
            conflictingSchedule.durationMinutes * 60000 +
            BUFFER_TIME_MINUTES * 60000
        );

        // Nếu schedule mới bắt đầu trước khi schedule cũ kết thúc
        // VÀ schedule mới kết thúc sau khi schedule cũ bắt đầu
        if (startTime < conflictEnd && endTimeWithBuffer > new Date(conflictingSchedule.dateTime)) {
            const error = new Error("Trainer is not available at this time");
            error.statusCode = 400;
            error.code = "TRAINER_NOT_AVAILABLE";
            throw error;
        }
    }
    // check xem member có pt hay combo có pt sessions remaining không
    // check xem trainer có time free không
    const schedule = await Schedule.create({
        memberId,
        trainerId,
        subscriptionId: selectedSubscriptionId,
        branchId,
        dateTime: requestDate,
        durationMinutes,
        notes,
        assignedExercises: assignedExercises || [],
        status: status || 'Pending'
    });
    return schedule;
};

export const getAllSchedules = async () => {
    const schedules = await Schedule.find()
        .populate('trainerId', 'fullName email phone trainerInfo')
        .populate('memberId', 'fullName email phone memberInfo')
        .populate('branchId', 'name address')
        .populate('subscriptionId', 'type membershipType ptsessionsRemaining');
    return schedules;
};

export const getScheduleById = async (id) => {
    const schedule = await Schedule.findById(id)
        .populate('trainerId', 'fullName email phone trainerInfo')
        .populate('memberId', 'fullName email phone memberInfo')
        .populate('branchId', 'name address')
        .populate('subscriptionId', 'type membershipType ptsessionsRemaining');
    if (!schedule) {
        const error = new Error("Schedule not found");
        error.statusCode = 404;
        error.code = "SCHEDULE_NOT_FOUND";
        throw error;
    }
    return schedule;
};

export const updateScheduleById = async (id, scheduleNewData) => {
    const schedule = await Schedule.findById(id);
    if (!schedule) {
        const error = new Error("Schedule not found");
        error.statusCode = 404;
        error.code = "SCHEDULE_NOT_FOUND";
        throw error;
    }
    const oldStatus = schedule.status;
    const newStatus = scheduleNewData?.status;
    console.log(oldStatus, newStatus);
    const updatedSchedule = await Schedule.findByIdAndUpdate(
        id,
        scheduleNewData,
        { new: true, runValidators: true }
    );
    if (newStatus &&
        (newStatus === 'Completed' || newStatus === 'NoShow') &&
        oldStatus !== 'Completed' && oldStatus !== 'NoShow') {
        console.log("updatePointsSession");
        await updatePointsSession(id);
    }
    return updatedSchedule;
};

export const deleteScheduleById = async (id) => {
    const schedule = await Schedule.findByIdAndDelete(id);
    if (!schedule) {
        const error = new Error("Schedule not found");
        error.statusCode = 404;
        error.code = "SCHEDULE_NOT_FOUND";
        throw error;
    }
    return schedule;
};

//xem lại các function dưới đây xem có ổn hay cần thiết hay không

export const getSchedulesByMember = async (memberId) => {
    const schedules = await Schedule.find({ memberId })
        .populate('trainerId', 'fullName email phone trainerInfo')
        .populate('memberId', 'fullName email phone memberInfo')
        .populate('branchId', 'name address')
        .populate('subscriptionId', 'type membershipType ptsessionsRemaining')
        .sort({ dateTime: 1 });
    return schedules;
};
// export const getUpcomingSchedulesByMember = async (memberId) => {
//     const today = new Date();
//     const schedules = await Schedule.find({
//       memberId,
//       dateTime: { $gte: today },
//       status: { $ne: "Completed" } // loại trừ lịch đã hoàn thành
//     }).sort({ dateTime: 1 });
//     return schedules;
//   };


export const getSchedulesByTrainer = async (trainerId) => {
    const schedules = await Schedule.find({ trainerId })
        .populate('trainerId', 'fullName email phone trainerInfo')
        .populate('memberId', 'fullName email phone memberInfo')
        .populate('branchId', 'name address')
        .populate('subscriptionId', 'type membershipType ptsessionsRemaining')
        .sort({ dateTime: 1 });
    return schedules;
};

// export const getUpcomingSchedulesByTrainer = async (trainerId) => {
//     const today = new Date();
//     const schedules = await Schedule.find({
//       trainerId,
//       dateTime: { $gte: today },
//       status: { $ne: "Completed" }
//     }).sort({ dateTime: 1 });
//     return schedules;
// };


export const updateScheduleStatus = async (id, status) => {
    const schedule = await Schedule.findById(id);
    if (!schedule) {
        const error = new Error("Schedule not found");
        error.statusCode = 404;
        error.code = "SCHEDULE_NOT_FOUND";
        throw error;
    }
    const oldStatus = schedule.status;
    schedule.status = status;
    await schedule.save();
    if ((status === 'Completed' || status === 'NoShow') &&
        oldStatus !== 'Completed' && oldStatus !== 'NoShow') {
        await updatePointsSession(id);
    }
    return schedule;
};

// export const assignExercisesToSchedule = async (id, exerciseIds) => {
//     const assignedExercises = exerciseIds.map(exerciseId => ({ exerciseId }));

//     const schedule = await Schedule.findByIdAndUpdate(
//         id,
//         { assignedExercises },
//         { new: true, runValidators: true }
//     );

//     if (!schedule) {
//         const error = new Error("Schedule not found");
//         error.statusCode = 404;
//         error.code = "SCHEDULE_NOT_FOUND";
//         throw error;
//     }

//     return schedule;
// };


// pagination

export const getAllSchedulesWithPagination = async (options) => {
    const query = {};
    if (options.status) {
        query.status = options.status;
    }
    const schedules = await paginate(Schedule, query, options, {
        populate: [
            { path: 'trainerId', select: 'fullName email phone trainerInfo' },
            { path: 'memberId', select: 'fullName email phone memberInfo' },
            { path: 'branchId', select: 'name address' },
            { path: 'subscriptionId', select: 'type membershipType ptsessionsRemaining' }
        ]
    });
    return schedules;
}

export const getScheduleByMemberWithPagination = async (memberId, options) => {
    const query = { memberId };
    if (options.status) {
        query.status = options.status;
    }
    const schedules = await paginate(Schedule, query, options);
    return schedules;
}

export const getScheduleByTrainerWithPagination = async (trainerId, options) => {
    const query = { trainerId };
    if (options.status) {
        query.status = options.status;
    }
    const schedules = await paginate(Schedule, query, options);
    return schedules;
}

// helper function khi mà schedule update liên quan đến status completed thì sẽ trừ đi 1 ptsessionsRemaining của member và tăng 1 ptsessionsUsed
export const updatePointsSession = async (scheduleId) => {

    const result = await withTransaction(async (session) => {

        const schedule = await findByIdWithSession(Schedule, scheduleId, session);
        if (!schedule) {
            const error = new Error("Schedule not found");
            error.statusCode = 404;
            error.code = "SCHEDULE_NOT_FOUND";
            throw error;
        }
        if (schedule.status !== 'Completed' && schedule.status !== 'NoShow') {
            return schedule; // Không làm gì cả
        }

        let subscription;
        if (schedule.subscriptionId) {
            subscription = await findByIdWithSession(Subscription, schedule.subscriptionId, session);
        } else {
            // ✅ CASE 2: Chưa có subscriptionId → TỰ ĐỘNG CHỌN GÓI THÔNG MINH
            // Ưu tiên: Active > sắp hết hạn > ít buổi còn lại
            const availableSubscriptions = await Subscription.find({
                memberId: schedule.memberId,
                type: { $in: ['PT', 'Combo'] },
                status: { $in: ['Active'] },
                ptsessionsRemaining: { $gt: 0 }
            })
                .sort({
                    endDate: 1,                    // ✅ Sắp hết hạn trước
                    ptsessionsRemaining: 1         // ✅ Ít buổi trước
                })
                .limit(1)
                .session(session);
            subscription = availableSubscriptions[0];
            if (subscription) {
                // Gán subscriptionId vào schedule để lần sau không phải tìm lại
                schedule.subscriptionId = subscription._id;
                await saveWithSession(schedule, session);
            }
        }
        if (!subscription) {
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            error.code = "SUBSCRIPTION_NOT_FOUND";
            throw error;
        }

        //✅ LUÔN LUÔN kiểm tra xem có subscription mới không (TRƯỚC KHI kiểm tra PT sessions)
        const newSubscription = await Subscription.findOne({
            renewedFrom: subscription._id,
            status: { $in: ['Active', 'NotStarted'] }
        }).session(session);

        //  5. KIỂM TRA GÓI GIA HẠN (RENEW LOGIC) =====
        // Nếu gói cũ đã được gia hạn (renew) → gói mới sẽ có renewedFrom = gói cũ
        // Trong trường hợp này, buổi PT đã được chuyển sang gói mới
        // → Phải tự động chuyển sang trừ buổi từ gói mới
        if (newSubscription) {
            subscription = newSubscription;
            // Cập nhật schedule để trỏ đến subscription mới
            schedule.subscriptionId = newSubscription._id;
            await saveWithSession(schedule, session);
        }


        // ✅ Kiểm tra còn PT sessions không
        if (subscription.ptsessionsRemaining <= 0) {
            const error = new Error("No PT sessions remaining");
            error.statusCode = 400;
            error.code = "NO_PT_SESSIONS_REMAINING";
            throw error;
        }

        // ✅ Trừ PT sessions
        subscription.ptsessionsRemaining -= 1;
        subscription.ptsessionsUsed += 1;
        await saveWithSession(subscription, session);

        return {
            schedule,
            subscription,
            message: 'PT session deducted successfully'
        };
    })

    return result;
}
