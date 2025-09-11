import express from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.routes";
import healthInfoRoutes from "./healthInfo.routes";


const router = express.Router();

router.get("/ping", (req, res) => {
    return res.status(200).json({success: true,message: "Server is running",data:new Date().toISOString()});
});


router.use("/auth", authRoutes);

router.use("/user", userRoutes);

router.use("/health-info", healthInfoRoutes);


export default router;