import express from "express";
import {
    createCheckInController,
    getAllCheckInsController,
    getCheckInByIdController,
    updateCheckInByIdController,
    getCheckInByMemberIdController,
    getCheckInByCheckInTimeController,
    checkOutCheckInController
} from "../controllers/checkIn.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";


const router = express.Router();

router.post("/",createCheckInController);

router.get("/",getAllCheckInsController);

router.get("/:id",getCheckInByIdController);

router.put("/:id",updateCheckInByIdController);

router.get("/member/:memberId",getCheckInByMemberIdController);

router.get("/checkInTime/:checkInTime",getCheckInByCheckInTimeController);

router.put("/:id/checkOut",checkOutCheckInController);

export default router;


// GET /api/checkins/paginated
// GET /api/checkins/member/:memberId/paginated