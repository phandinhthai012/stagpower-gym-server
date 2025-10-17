import express from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.routes";
import healthInfoRoutes from "./healthInfo.routes";
import packageRoutes from "./package.routes.js";
import subscriptionRoutes from "./subscription.route.js";
import paymentRoutes from "./payment.route.js";
import branchRoutes from "./branch.route.js";
import discountRoutes from "./discount.route.js";
import bookingRequestRoutes from "./bookingrequest.route.js";
import scheduleRoutes from "./schedule.route.js";
import checkInRoutes from "./checkIn.route.js";
import exerciseRoutes from "./exercise.route.js";
import aiSuggestionRoutes from "./aiSuggestion.route.js";
import notificationRoutes from "./notification.route.js";

const router = express.Router();

router.get("/ping", (req, res) => {
    return res.status(200).json({success: true,message: "Server is running",data:new Date().toISOString()});
});


router.use("/auth", authRoutes);

router.use("/user", userRoutes);

router.use("/health-info", healthInfoRoutes);

router.use("/packages", packageRoutes);

router.use("/subscriptions", subscriptionRoutes);

router.use("/payments", paymentRoutes);

router.use("/branches", branchRoutes);

router.use("/discounts", discountRoutes);

router.use("/booking-requests", bookingRequestRoutes);

router.use("/schedules", scheduleRoutes);

router.use("/check-ins", checkInRoutes);

router.use("/exercises", exerciseRoutes);

router.use("/ai-suggestions", aiSuggestionRoutes);

router.use("/notifications", notificationRoutes);//  not test yet

export default router;