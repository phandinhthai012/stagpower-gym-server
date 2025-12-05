import {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateScheduleById,
    deleteScheduleById,
    getSchedulesByMember,
    getSchedulesByTrainer,
    getAllSchedulesWithPagination,
    getScheduleByMemberWithPagination,
    getScheduleByTrainerWithPagination


} from "../services/schedule.service.js";
import response from "../utils/response.js";
import socketService from "../services/socket.service.js";
import { roleRoomMap } from "../utils/socketUtils.js";
import { createNotification } from "../services/notification.service.js";

export const createScheduleController = async (req, res, next) => {
    try {
        const schedule = await createSchedule(req.body);

        // Fetch member and trainer info for better notifications
        const User = require('../models/User.js').default;
        const member = await User.findById(schedule.memberId).select('fullName');
        const trainer = await User.findById(schedule.trainerId).select('fullName');

        const scheduleDate = new Date(schedule.dateTime);
        const formattedDate = scheduleDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        await createNotification({
            userId: schedule.memberId,
            title: "Lịch tập mới đã được tạo",
            message: `Lịch tập với HLV ${trainer?.fullName || 'N/A'} vào ${formattedDate} đã được tạo thành công.`,
            type: "INFO"
        });
        socketService.emitToUser(schedule.memberId, "schedule_created", schedule);
        await createNotification({
            userId: schedule.trainerId,
            title: "Lịch dạy mới đã được tạo",
            message: `Lịch dạy với hội viên ${member?.fullName || 'N/A'} vào ${formattedDate} đã được tạo.`,
            type: "INFO"
        });
        socketService.emitToUser(schedule.trainerId, "schedule_created", schedule);
        socketService.emitToRoom(roleRoomMap.admin, "schedule_created", schedule);
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
            status,
            notes,
            assignedExercises
        } = req.body;

        // Get old schedule info BEFORE updating to detect changes
        const oldSchedule = await getScheduleById(id);
        // Handle both populated (object with _id) and non-populated (ObjectId) trainerId
        const oldTrainerId = oldSchedule.trainerId?._id || oldSchedule.trainerId;
        const isChangingTrainer = trainerId && oldTrainerId && 
            String(trainerId) !== String(oldTrainerId);

        const schedule = await updateScheduleById(id, {
            memberId,
            trainerId,
            subscriptionId,
            branchId,
            dateTime,
            durationMinutes,
            status,
            notes,
            assignedExercises
        }, req.user);

        // Fetch member and trainer info for better notifications
        const User = require('../models/User.js').default;
        const member = await User.findById(schedule.memberId).select('fullName email');
        const newTrainer = await User.findById(schedule.trainerId).select('fullName email');
        const oldTrainer = isChangingTrainer ? await User.findById(oldTrainerId).select('fullName email') : null;

        const scheduleDate = new Date(schedule.dateTime);
        const formattedDate = scheduleDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = scheduleDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Check if it's a direct schedule (no member)
        const isDirectSchedule = schedule.notes?.includes('[LỊCH TRỰC]') || 
            schedule.memberId.toString() === schedule.trainerId.toString();

        // 🔔 TẠO NOTIFICATION CHO MEMBER (chỉ cho lịch PT, không phải lịch trực)
        if (!isDirectSchedule) {
            let memberNotificationTitle = "Lịch tập đã được cập nhật";
            let memberNotificationMessage = "";

            if (isChangingTrainer) {
                // Thông báo rõ ràng khi đổi PT
                memberNotificationTitle = "PT của bạn đã được thay đổi";
                memberNotificationMessage = `Lịch tập của bạn vào lúc ${formattedTime} ngày ${formattedDate} đã được đổi từ HLV ${oldTrainer?.fullName || 'N/A'} sang HLV ${newTrainer?.fullName || 'N/A'}. Vui lòng kiểm tra lại thông tin.`;
            } else {
                // Thông báo khi cập nhật khác
                memberNotificationMessage = `Lịch tập với HLV ${newTrainer?.fullName || 'N/A'} vào lúc ${formattedTime} ngày ${formattedDate} đã được cập nhật. Vui lòng kiểm tra lại thông tin.`;
            }

            await createNotification({
                userId: schedule.memberId,
                title: memberNotificationTitle,
                message: memberNotificationMessage,
                type: "INFO"
            });
        }

        // 🔔 TẠO NOTIFICATION CHO TRAINER MỚI
        if (isChangingTrainer) {
            // Thông báo cho PT mới
            await createNotification({
                userId: schedule.trainerId,
                title: "Lịch dạy mới đã được giao",
                message: `Bạn đã được phân công dạy hội viên ${member?.fullName || 'N/A'} vào lúc ${formattedTime} ngày ${formattedDate}. Lịch này được chuyển từ HLV ${oldTrainer?.fullName || 'N/A'}.`,
                type: "INFO"
            });

            // Thông báo cho PT cũ (nếu có và không phải là lịch trực)
            if (!isDirectSchedule && oldTrainerId && oldTrainerId.toString() !== schedule.trainerId.toString()) {
                await createNotification({
                    userId: oldTrainerId,
                    title: "Lịch dạy đã được chuyển",
                    message: `Lịch dạy với hội viên ${member?.fullName || 'N/A'} vào lúc ${formattedTime} ngày ${formattedDate} đã được chuyển sang HLV ${newTrainer?.fullName || 'N/A'}.`,
                    type: "WARNING"
                });
            }
        } else {
            // Thông báo khi cập nhật khác (không đổi PT)
            await createNotification({
                userId: schedule.trainerId,
                title: "Lịch dạy đã được cập nhật",
                message: `Lịch dạy với hội viên ${member?.fullName || 'N/A'} vào lúc ${formattedTime} ngày ${formattedDate} đã được cập nhật.`,
                type: "INFO"
            });
        }

        // 📡 SOCKET EMIT CHO MEMBER
        if (!isDirectSchedule) {
            socketService.emitToUser(schedule.memberId, "schedule_updated", schedule);
        }

        // 📡 SOCKET EMIT CHO TRAINER MỚI
        socketService.emitToUser(schedule.trainerId, "schedule_updated", schedule);

        // 📡 SOCKET EMIT CHO TRAINER CŨ (nếu đổi PT)
        if (isChangingTrainer && oldTrainerId && oldTrainerId.toString() !== schedule.trainerId.toString()) {
            socketService.emitToUser(oldTrainerId, "schedule_updated", schedule);
        }

        // 📡 SOCKET EMIT CHO ADMIN
        socketService.emitToRoom(roleRoomMap.admin, "schedule_updated", schedule);

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

        // Fetch member and trainer info for better notifications
        const User = require('../models/User.js').default;
        const member = await User.findById(schedule.memberId).select('fullName');
        const trainer = await User.findById(schedule.trainerId).select('fullName');

        const scheduleDate = new Date(schedule.dateTime);
        const formattedDate = scheduleDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        await createNotification({
            userId: schedule.memberId,
            title: "Lịch tập đã bị hủy",
            message: `Lịch tập với HLV ${trainer?.fullName || 'N/A'} vào ${formattedDate} đã bị hủy.`,
            type: "WARNING"
        });
        await createNotification({
            userId: schedule.trainerId,
            title: "Lịch dạy đã bị hủy",
            message: `Lịch dạy với hội viên ${member?.fullName || 'N/A'} vào ${formattedDate} đã bị hủy.`,
            type: "WARNING"
        });

        socketService.emitToUser(schedule.memberId, "schedule_deleted", schedule);
        socketService.emitToUser(schedule.trainerId, "schedule_deleted", schedule);
        socketService.emitToRoom(roleRoomMap.admin, "schedule_deleted", schedule);
        
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


export const getAllSchedulesWithPaginationController = async (req, res, next) => {
    try {
        const { page, limit, sort, search, status } = req.query;
        const schedules = await getAllSchedulesWithPagination({ page, limit, sort, search });
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

export const getScheduleByMemberWithPaginationController = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const { page, limit, sort, search, status } = req.query;
        const schedules = await getScheduleByMemberWithPagination(memberId, { page, limit, sort, search, status });
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

export const getScheduleByTrainerWithPaginationController = async (req, res, next) => {
    try {
        const { trainerId } = req.params;
        const { page, limit, sort, search, status } = req.query;
        const schedules = await getScheduleByTrainerWithPagination(trainerId, { page, limit, sort, search, status });
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