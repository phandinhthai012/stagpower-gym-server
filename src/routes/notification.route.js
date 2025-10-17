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
router.post("/",authenticateToken,authorize(["admin","staff"]), createNotificationController);

// Get all notifications
router.get("/",authenticateToken, getAllNotificationsController);

// Get notifications with pagination
router.get("/paginated",authenticateToken, getAllNotificationsWithPaginationController);

// Get user notifications
router.get("/user/:userId",authenticateToken, getUserNotificationsController);

// Get user notifications with pagination
router.get("/user/:userId/paginated", getUserNotificationsWithPaginationController);

// Get notification by ID
router.get("/:id",authenticateToken, getNotificationByIdController);

// Mark notification as read
router.patch("/:id/read",authenticateToken, markNotificationAsReadController);

// Mark notification as unread
router.patch("/:id/unread",authenticateToken, markNotificationAsUnreadController);

// Delete notification
router.delete("/:id",authenticateToken,authorize(["admin","staff"]), deleteNotificationByIdController);

export default router;

