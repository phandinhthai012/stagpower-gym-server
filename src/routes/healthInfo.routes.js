import express from "express";
import { authenticateToken, authorize } from "../middleware/auth";
// import {
//     getMyHealthInfoController,
//     upsertMyHealthInfoController,
//     getHealthInfoByMemberIdController,
//     updateHealthInfoByMemberIdController
//   } from "../controllers/healthInfo.controller"

const router = express.Router();


// Member tự xem/cập nhật của mình
// router.get("/me", authenticateToken, getMyHealthInfoController);
// router.put("/me", authenticateToken, upsertMyHealthInfoController);

// // Staff/Admin quản trị theo memberId
// router.get("/:memberId", authenticateToken, authorize(["admin","staff"]), getHealthInfoByMemberIdController);
// router.put("/:memberId", authenticateToken, authorize(["admin","staff"]), updateHealthInfoByMemberIdController);

export default router;