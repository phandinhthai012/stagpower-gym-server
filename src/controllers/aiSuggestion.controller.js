import {
    createAISuggestion,
    getAISuggestionById,
    getAISuggestionByMemberId,
    deleteAISuggestionById,
    chatWithAI,
    generateCompleteWorkoutSuggestion,
    generateNutritionOnlySuggestion,
    generateWorkoutOnlySuggestion
} from "../services/AISuggestion.service";

import response from "../utils/response";

export const createAISuggestionController = async (req, res, next) => {
    try {
        const { memberId, recommendationDate, goal, exercises, difficulty, notes } = req.body;
        const aiSuggestion = await createAISuggestion({
            memberId, 
            recommendationDate, 
            goal,
            exercises, 
            workoutDuration,
            difficultyLevel,
            nutrition,
            notes,
            status
        });
        response(res, {
            statusCode: 201,
            message: "AISuggestion created successfully",
            data: aiSuggestion,
        });
    } catch (error) {
        next(error);
    }

}

export const getAISuggestionByIdController = async (req, res, next) => {
    try {

        const { id } = req.params;
        const aiSuggestion = await getAISuggestionById(id);
        response(res, {
            statusCode: 200,
            message: "AISuggestion fetched successfully",
            data: aiSuggestion,
        });
    } catch (error) {
        next(error);
    }

}

export const getAISuggestionByMemberIdController = async (req, res, next) => {
    try {

        const { memberId } = req.params;
        const aiSuggestion = await getAISuggestionByMemberId(memberId);
        response(res, {
            statusCode: 200,
            message: "AISuggestion fetched successfully",
            data: aiSuggestion,
        });
    } catch (error) {
        next(error);
    }

}

export const deleteAISuggestionByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const aiSuggestion = await deleteAISuggestionById(id);
        response(res, {
            statusCode: 200,
            message: "AISuggestion deleted successfully",
            data: aiSuggestion,
        });
    } catch (error) {
        next(error);
    }

}

export const chatWithAIController = async (req, res, next) => {
    try {
        const { memberId, message, conversationHistory } = req.body;
        
        if (!memberId || !message) {
            return response(res, {
                statusCode: 400,
                message: "memberId and message are required",
            });
        }
        
        const aiResponse = await chatWithAI({ 
            memberId, 
            message, 
            conversationHistory: conversationHistory || [] 
        });
        
        response(res, {
            statusCode: 200,
            message: "Chat response generated successfully",
            data: aiResponse,
        });
    } catch (error) {
        next(error);
    }
}


export const generateCompleteWorkoutSuggestionController = async (req, res, next) => {
    try {
        const { memberId, message } = req.body;
        const completeWorkoutSuggestion = await generateCompleteWorkoutSuggestion({ memberId, message });
        response(res, {
            statusCode: 200,
            message: "CompleteWorkoutSuggestion generated successfully",
            data: completeWorkoutSuggestion,
        });
    } catch (error) {
        next(error);
    }
}

// Generate Workout Only
export const generateWorkoutOnlyController = async (req, res, next) => {
    try {
        const { memberId, message } = req.body; 
        const workoutSuggestion = await generateWorkoutOnlySuggestion({ memberId, message });
        response(res, {
            statusCode: 200,
            message: "Workout suggestion generated successfully",
            data: workoutSuggestion,
        });
    } catch (error) {
        next(error);
    }
}

// Generate Nutrition Only
export const generateNutritionOnlyController = async (req, res, next) => {
    try {
        const { memberId, message } = req.body;
        const nutritionSuggestion = await generateNutritionOnlySuggestion({ memberId, message });
        response(res, {
            statusCode: 200,
            message: "Nutrition suggestion generated successfully",
            data: nutritionSuggestion,
        });
    } catch (error) {
        next(error);
    }
}