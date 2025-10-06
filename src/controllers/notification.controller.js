import {
    createNotification,
    getAllNotifications,
    getUserNotifications,
    getNotificationById,
    markNotificationAsRead,
    markNotificationAsUnread,
    deleteNotificationById,
    getAllNotificationsWithPagination,
    getUserNotificationsWithPagination
} from "../services/notification.service.js";

import response from "../utils/response";

export const createNotificationController = async (req, res, next) => {
    try {
        const { userId, title, message, type, status } = req.body;
        const notification = await createNotification({ userId, title, message, type, status });
        return response(res, {
            success: true,
            statusCode: 201,
            message: "Notification created successfully",
            data: notification
        });
    } catch (error) {
        next(error);
    }
}
export const getAllNotificationsController = async (req, res, next) => {
    try {
        const notifications = await getAllNotifications();
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Notifications fetched successfully",
            data: notifications
        });
    } catch (error) {
        next(error);
    }
}
export const getUserNotificationsController = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const notifications = await getUserNotifications(userId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "User notifications fetched successfully",
            data: notifications
        });
    } catch (error) {
        next(error);
    }
}

export const getNotificationByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await getNotificationById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Notification fetched successfully",
            data: notification
        });
    } catch (error) {
        next(error);
    }
}

export const markNotificationAsReadController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await markNotificationAsRead(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Notification marked as read successfully",
            data: notification
        });
    } catch (error) {
        next(error);
    }
}

export const markNotificationAsUnreadController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await markNotificationAsUnread(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Notification marked as unread successfully",
            data: notification
        });
    } catch (error) {
        next(error);
    }
}

export const deleteNotificationByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await deleteNotificationById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Notification deleted successfully",
            data: notification
        });
    } catch (error) {
        next(error);
    }
}

export const getAllNotificationsWithPaginationController = async (req, res, next) => {
    try {
        const { page, limit, sort, order } = req.query;
        const notifications = await getAllNotificationsWithPagination({ page, limit, sort, order });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Notifications fetched successfully",
            data: notifications
        });
    } catch (error) {
        next(error);
    }
}

export const getUserNotificationsWithPaginationController = async (req, res, next) => {
    try {
        const { userId, page, limit, sort, order } = req.query;
        const notifications = await getUserNotificationsWithPagination(userId, { page, limit, sort, order });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "User notifications fetched successfully",
            data: notifications
        });
    } catch (error) {
        next(error);
    }
}