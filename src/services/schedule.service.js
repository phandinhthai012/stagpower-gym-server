import Schedule from "../models/Schedule";
import { paginate } from "../utils/pagination";
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

    const schedule = await Schedule.create({
        memberId,
        trainerId,
        subscriptionId,
        branchId,
        dateTime,
        durationMinutes,
        notes,
        assignedExercises,
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
    const schedule = await Schedule.findByIdAndUpdate(id, scheduleNewData, { new: true, runValidators: true });
    if (!schedule) {
        const error = new Error("Schedule not found");
        error.statusCode = 404;
        error.code = "SCHEDULE_NOT_FOUND";
        throw error;
    }
    return schedule;
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
    const schedule = await Schedule.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
    );

    if (!schedule) {
        const error = new Error("Schedule not found");
        error.statusCode = 404;
        error.code = "SCHEDULE_NOT_FOUND";
        throw error;
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