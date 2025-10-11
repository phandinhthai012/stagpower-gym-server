import express from "express";
import {
    createExerciseController,
    getAllExercisesController,
    getExerciseByIdController,
    updateExerciseByIdController,
    deleteExerciseByIdController,
    searchExercisesController,
    getExercisesByLevelController
} from "../controllers/exercise.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";
const router = express.Router();


// api example: /api/exercises/search?q=pushup
router.get("/search", searchExercisesController);

// api example: /api/exercises/level?level=beginner
router.get("/level", getExercisesByLevelController);

router.post("/",authenticateToken, authorize(['admin','staff',"trainer"]), createExerciseController);

router.get("/", getAllExercisesController);

router.get("/:id", getExerciseByIdController);

router.put("/:id",authenticateToken, authorize(['admin','staff',"trainer"]), updateExerciseByIdController);

router.delete("/:id",authenticateToken, authorize(['admin','staff']), deleteExerciseByIdController);



export default router;