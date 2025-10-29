import express from "express";
import {
    createAISuggestionController,
    getAISuggestionByIdController,
    getAISuggestionByMemberIdController,
    deleteAISuggestionByIdController,
    generateAISuggestionController,
    generateNutritionSuggestionController,
    chatWithAIController
} from "../controllers/aiSuggestion.controller";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.get("/test",(req,res,next)=>{
    res.status(200).json({
        statusCode: 200,
        message: "AISuggestion generated successfully",
    });
});

router.post("/", authenticateToken, createAISuggestionController);

// Thêm route mới:
router.post("/chat", authenticateToken, chatWithAIController);

router.get("/member/:memberId", authenticateToken, getAISuggestionByMemberIdController);

router.get("/:id", authenticateToken, getAISuggestionByIdController);

router.delete("/:id", authenticateToken, deleteAISuggestionByIdController);

router.post("/suggestion/generate", generateAISuggestionController);

router.post("/suggestion/nutrition", generateNutritionSuggestionController);

export default router;