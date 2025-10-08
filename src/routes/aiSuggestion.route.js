import express from "express";
import {
    createAISuggestionController,
    getAISuggestionByIdController,
    getAISuggestionByMemberIdController,
    deleteAISuggestionByIdController,
} from "../controllers/aiSuggestion.controller";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();


router.post("/", authenticateToken, createAISuggestionController);

router.get("/member/:memberId", authenticateToken, getAISuggestionByMemberIdController);

router.get("/:id", authenticateToken, getAISuggestionByIdController);

router.delete("/:id", authenticateToken, deleteAISuggestionByIdController);

export default router;