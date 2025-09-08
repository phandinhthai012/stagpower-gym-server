import express from "express";
import authRoutes from "./auth.route";


const router = express.Router();

router.get("/ping", (req, res) => {
    return res.status(200).json({success: true,message: "Server is running",data:new Date().toISOString()});
});


router.use("/auth", authRoutes);


export default router;