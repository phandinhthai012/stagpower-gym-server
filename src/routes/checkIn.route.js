import express from "express";
import {
    createCheckInController,
    getAllCheckInsController,
    getCheckInByIdController,
    updateCheckInByIdController,
    getCheckInByMemberIdController,
    getCheckInByCheckInTimeController,
    checkOutCheckInController,
    getAllCheckInsWithPaginationController,
    generateQRCodeCheckInController,
    processQRCodeCheckInController
} from "../controllers/checkIn.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";


const router = express.Router();

router.post("/", authenticateToken, createCheckInController);

router.get("/", authenticateToken, getAllCheckInsController);

router.get("/:id", authenticateToken, getCheckInByIdController);

router.put("/:id", authenticateToken, authorize(['admin', 'staff']), updateCheckInByIdController);

router.get("/member/:memberId", authenticateToken, getCheckInByMemberIdController);

router.get("/checkInTime/:checkInTime", authenticateToken, getCheckInByCheckInTimeController);

router.put("/:id/checkOut", authenticateToken, checkOutCheckInController);

router.get("/paginated", authenticateToken, getAllCheckInsWithPaginationController);

router.get("/qrCode/:memberId", authenticateToken, generateQRCodeCheckInController);

router.post("/qrCode/checkIn", authenticateToken, processQRCodeCheckInController);

export default router;


// GET /api/checkins/paginated
// GET /api/checkins/member/:memberId/paginated