import express from "express";
import {
    createRatingController,
    getRatingsByMemberController,
    getRatingByIdController,
    updateRatingController,
    deleteRatingController,
    getRatingsByTrainerController,
    getTrainerAverageRatingController,
    getRateableTrainersController
} from "../controllers/rating.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// Member routes (require authentication)
router.get("/member/my-ratings", authenticateToken, getRatingsByMemberController);
router.get("/member/rateable-trainers", authenticateToken, getRateableTrainersController);
router.post("/", authenticateToken, createRatingController);
router.get("/:id", authenticateToken, getRatingByIdController);
router.put("/:id", authenticateToken, updateRatingController);
router.delete("/:id", authenticateToken, deleteRatingController);

// Trainer routes (public or authenticated)
router.get("/trainer/:trainerId", getRatingsByTrainerController);
router.get("/trainer/:trainerId/average", getTrainerAverageRatingController);

export default router;

