import express from "express";
import {
    createScheduleController,
    getAllSchedulesController,
    getScheduleByIdController,
    updateScheduleByIdController,
    deleteScheduleByIdController,
    getSchedulesByMemberController,
    getSchedulesByTrainerController,
    getAllSchedulesWithPaginationController,
    getScheduleByMemberWithPaginationController,
    getScheduleByTrainerWithPaginationController
} from "../controllers/schedule.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";


const router = express.Router();


router.get("/paginated", getAllSchedulesWithPaginationController);

router.get("/member/:memberId/paginated", getScheduleByMemberWithPaginationController);

router.get("/trainer/:trainerId/paginated", getScheduleByTrainerWithPaginationController);

router.get("/member/:memberId", authenticateToken, getSchedulesByMemberController);

router.get("/trainer/:trainerId", authenticateToken, getSchedulesByTrainerController);

router.post("/", authenticateToken,createScheduleController);

router.get("/",authenticateToken, authorize(["admin","staff"]), getAllSchedulesController);

router.get("/:id", authenticateToken, getScheduleByIdController);

router.put("/:id",authenticateToken, updateScheduleByIdController);

router.delete("/:id",authenticateToken, authorize(["admin","staff"]), deleteScheduleByIdController);






export default router;

