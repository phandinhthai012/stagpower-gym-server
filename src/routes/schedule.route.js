import express from "express";
import {
    createScheduleController,
    getAllSchedulesController,
    getScheduleByIdController,
    updateScheduleByIdController,
    deleteScheduleByIdController,
    getSchedulesByMemberController,
    getSchedulesByTrainerController
} from "../controllers/schedule.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";


const router = express.Router();


router.post("/", createScheduleController);

router.get("/", getAllSchedulesController);

router.get("/:id", getScheduleByIdController);

router.put("/:id", updateScheduleByIdController);

router.delete("/:id", deleteScheduleByIdController);

router.get("/member/:memberId", getSchedulesByMemberController);

router.get("/trainer/:trainerId", getSchedulesByTrainerController);


export default router;


// GET /api/schedules/paginated
// GET /api/schedules/member/:memberId/paginated
// GET /api/schedules/trainer/:trainerId/paginated