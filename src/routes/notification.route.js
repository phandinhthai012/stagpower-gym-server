import express from "express";
import {
    createNotificationController,
    getAllNotificationsController,
    getUserNotificationsController,
    getNotificationByIdController,
    markNotificationAsReadController,
    markNotificationAsUnreadController,
    deleteNotificationByIdController,
    getAllNotificationsWithPaginationController,
    getUserNotificationsWithPaginationController
} from "../controllers/notification.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// Create notification
router.post("/", createNotificationController);

// Get all notifications
router.get("/", getAllNotificationsController);

// Get notifications with pagination
router.get("/paginated", getAllNotificationsWithPaginationController);

// Get user notifications
router.get("/user/:userId", getUserNotificationsController);

// Get user notifications with pagination
router.get("/user/:userId/paginated", getUserNotificationsWithPaginationController);

// Get notification by ID
router.get("/:id", getNotificationByIdController);

// Mark notification as read
router.patch("/:id/read", markNotificationAsReadController);

// Mark notification as unread
router.patch("/:id/unread", markNotificationAsUnreadController);

// Delete notification
router.delete("/:id", deleteNotificationByIdController);

export default router;

