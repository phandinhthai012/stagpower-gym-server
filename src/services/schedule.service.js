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
        assignedExercises
    } = scheduleData;

    const schedule = await Schedule.create({
        memberId,
        trainerId,
        subscriptionId,
        branchId,
        dateTime,
        durationMinutes,
        notes,
        assignedExercises,
        status: 'Confirmed'
    });

    return schedule;
};

export const getAllSchedules = async () => {
    const schedules = await Schedule.find();
    return schedules;
};

export const getScheduleById = async (id) => {
    const schedule = await Schedule.findById(id);
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
    const oldStatus = schedule?.status;
    const newStatus = scheduleNewData?.status;
    const updatedSchedule = await Schedule.findByIdAndUpdate(
        id,
        scheduleNewData,
        { new: true, runValidators: true }
    );
    if (newStatus &&
        (newStatus === 'Completed' || newStatus === 'NoShow') &&
        oldStatus !== 'Completed' && oldStatus !== 'NoShow') {
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
    const schedules = await Schedule.findByMember(memberId);
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
    const schedules = await Schedule.findByTrainer(trainerId);
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
    const schedules = await paginate(Schedule, query, options);
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
        const subscription = await findByIdWithSession(Subscription, schedule.subscriptionId, session);
        if (!subscription) {
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            error.code = "SUBSCRIPTION_NOT_FOUND";
            throw error;
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
