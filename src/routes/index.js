import express from "express";
import authRoutes from "./auth.route";


const router = express.Router();

router.get("/ping", (req, res) => {
    return res.status(200).json({message: "Server is running"});
});


router.use("/auth", authRoutes);


export default router;