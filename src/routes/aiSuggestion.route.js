import express from "express";
import {
    createAISuggestionController,
    getAISuggestionByIdController,
    getAISuggestionByMemberIdController,
    deleteAISuggestionByIdController,
    chatWithAIController,
    generateCompleteWorkoutSuggestionController,
    generateWorkoutOnlyController,
    generateNutritionOnlyController,
    updateAISuggestionController
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


router.get("/member/:memberId", authenticateToken, getAISuggestionByMemberIdController);

router.get("/:id", authenticateToken, getAISuggestionByIdController);

router.put("/:id", authenticateToken, updateAISuggestionController);

router.delete("/:id", authenticateToken, deleteAISuggestionByIdController);

// ===== AI GENERATION ENDPOINTS =====

// Chat with AI
router.post("/chat",authenticateToken, chatWithAIController);

// Generate gợi ý toàn diện (Evaluation + Workout + DietPlan) - PROMPT CHÍNH CHO NGHIÊN CỨU
router.post("/generate/complete",authenticateToken, generateCompleteWorkoutSuggestionController);

// Generate chỉ workout (không có nutrition)
router.post("/generate/workout",authenticateToken, generateWorkoutOnlyController);

// Generate chỉ nutrition (không có workout)
router.post("/generate/nutrition",authenticateToken, generateNutritionOnlyController);

export default router;


// POST /api/ai-suggestions/generate/complete    # Prompt chính - toàn diện cả evaluation, workout và diet plan
// POST /api/ai-suggestions/generate/workout    # Chỉ workout như bài tập
// POST /api/ai-suggestions/generate/nutrition  # Chỉ nutrition 