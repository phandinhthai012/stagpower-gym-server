import express from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.routes";
import healthInfoRoutes from "./healthInfo.routes";
import packageRoutes from "./package.routes.js";
import subscriptionRoutes from "./subscription.route.js";
import paymentRoutes from "./payment.route.js";


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


export default router;