import {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateScheduleById,
    deleteScheduleById,
    getSchedulesByMember,
    getSchedulesByTrainer

} from "../services/schedule.service.js";
import response from "../utils/response.js";


export const createScheduleController = async (req, res, next) => {
    try {
        const schedule = await createSchedule(req.body);
        response(res, {
            success: true,
            statusCode: 201,
            message: "Schedule created successfully",
            data: schedule
        });
    } catch (error) {
        next(error);
    }
};


export const getAllSchedulesController = async (req, res, next) => {
    try {
        const schedules = await getAllSchedules();
        response(res, {
            success: true,
            statusCode: 200,
            message: "Schedules fetched successfully",
            data: schedules
        });
    } catch (error) {
        next(error);
    }
};


export const getScheduleByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const schedule = await getScheduleById(id);
        response(res, {
            success: true,
            statusCode: 200,
            message: "Schedule fetched successfully",
            data: schedule
        });
    } catch (error) {
        next(error);
    }
};

export const updateScheduleByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            memberId,
            trainerId,
            subscriptionId,
            branchId,
            dateTime,
            durationMinutes,
            notes,
            assignedExercises
        } = req.body;
        const schedule = await updateScheduleById(id, {
            memberId,
            trainerId,
            subscriptionId,
            branchId,
            dateTime,
            durationMinutes,
            notes,
            assignedExercises
        });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Schedule updated successfully",
            data: schedule
        });
    } catch (error) {
        next(error);
    }
}

export const deleteScheduleByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const schedule = await deleteScheduleById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Schedule deleted successfully",
            data: {
                id: schedule._id,
                message: "Schedule deleted successfully"
            }
        });
    } catch (error) {
        next(error);
    }
}

export const getSchedulesByMemberController = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const schedules = await getSchedulesByMember(memberId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Schedules fetched successfully",
            data: schedules
        });
    } catch (error) {
        next(error);
    }
}

export const getSchedulesByTrainerController = async (req, res, next) => {
    try {
        const { trainerId } = req.params;
        const schedules = await getSchedulesByTrainer(trainerId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Schedules fetched successfully",
            data: schedules
        });
    } catch (error) {
        next(error);
    }
}