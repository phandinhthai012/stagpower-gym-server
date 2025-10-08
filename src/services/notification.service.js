import Notification from "../models/Notification.js";
import { paginate } from "../utils/pagination.js";

export const createNotification = async (notificationData) => {
    const {
        userId,
        title,
        message,
        type,
        status,
    } = notificationData;
    const notification = new Notification({
        userId,
        title,
        message,
        type,
        status: status || 'UNREAD',
    });
    await notification.save();
    return notification;
}

export const getAllNotifications = async () => {
    const notifications = await Notification.find();
    return notifications;
}

export const getUserNotifications = async (userId) => {
    const notifications = await Notification.find({ userId: userId }).sort({ createdAt: -1 });
    return notifications;
}

export const getNotificationById = async (id) => {
    const notification = await Notification.findById(id);
    if (!notification) {
        const error = new Error("Notification not found");
        error.statusCode = 404;
        error.code = "NOTIFICATION_NOT_FOUND";
        throw error;
    }
    return notification;
}
export const markNotificationAsRead = async (id) => {
    const notification = await Notification.findByIdAndUpdate(id, { status: 'READ' }, { new: true });
    if (!notification) {
        const error = new Error("Notification not found");
        error.statusCode = 404;
        error.code = "NOTIFICATION_NOT_FOUND";
        throw error;
    }
        return notification;
}
export const markNotificationAsUnread = async (id) => {
    const notification = await Notification.findByIdAndUpdate(id, { status: 'UNREAD' }, { new: true });
    if (!notification) {
        const error = new Error("Notification not found");
        error.statusCode = 404;
        error.code = "NOTIFICATION_NOT_FOUND";
        throw error;
    }
    return notification;
}
export const deleteNotificationById = async (id) => {
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
        const error = new Error("Notification not found");
        error.statusCode = 404;
        error.code = "NOTIFICATION_NOT_FOUND";
        throw error;
    }
    return notification;
}

export const getAllNotificationsWithPagination = async (options) => {
    const notifications = await paginate(Notification, {}, options);
    return notifications;
}

export const getUserNotificationsWithPagination = async (userId, options) => {
    const notifications = await paginate(Notification, { userId: userId }, options);
    return notifications;
}