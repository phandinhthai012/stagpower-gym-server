import AISuggestion from "../models/AISuggestion";
import HealthInfo from "../models/HealthInfo";
import User from "../models/User";
import { 
    createChatbotConsultationPrompt,
    createCompleteWorkoutSuggestionPrompt,
    createWorkoutOnlySuggestionPrompt,
    createNutritionOnlySuggestionPrompt
} from "../config/prompts/prompt";
import aiClient from "../config/ai";


// Lấy HealthInfo mới nhất của member
const getLatestHealthInfo = async (memberId) => {
    const healthInfo = await HealthInfo.findOne({ memberId })
        .sort({createdAt: -1 })
        .limit(1);
    
    if (!healthInfo) {
        const error = new Error("HealthInfo not found");
        error.statusCode = 404;
        error.code = "HEALTHINFO_NOT_FOUND";
        throw error;
    }
    return healthInfo;
}

export const createAISuggestion = async (aiSuggestionData) => {
    const aiSuggestion = await AISuggestion.create(aiSuggestionData);
    return aiSuggestion;
}

export const getAISuggestionById = async (id) => {
    const aiSuggestion = await AISuggestion.findById(id);
    if (!aiSuggestion) {
        const error = new Error("AISuggestion not found");
        error.statusCode = 404;
        error.code = "AISUGGESTION_NOT_FOUND";
        throw error;
    }
    return aiSuggestion;
}

export const getAISuggestionByMemberId = async (memberId) => {
    const aiSuggestion = await AISuggestion.find({ memberId: memberId });
    if (!aiSuggestion) {
        const error = new Error("AISuggestion not found");
        error.statusCode = 404;
        error.code = "AISUGGESTION_NOT_FOUND";
        throw error;
    }
    return aiSuggestion;
}

export const deleteAISuggestionById = async (id) => {
    const aiSuggestion = await AISuggestion.findByIdAndDelete(id);
    if (!aiSuggestion) {
        const error = new Error("AISuggestion not found");
        error.statusCode = 404;
        error.code = "AISUGGESTION_NOT_FOUND";
        throw error;
    }
    return aiSuggestion;
}

export const chatWithAI = async (data) => {
    const { memberId, message, conversationHistory = [] } = data;
    
    // Lấy thông tin health info
    const healthInfo = await getLatestHealthInfo(memberId);
    if (!healthInfo) {
        const error = new Error("HealthInfo not found");
        error.statusCode = 404;
        error.code = "HEALTHINFO_NOT_FOUND";
        throw error;
    }
    
    // Lấy thông tin user
    const user = await User.findById(memberId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";
        throw error;
    }
    
    // Tạo prompt
    const prompt = createChatbotConsultationPrompt(healthInfo, user, conversationHistory, message);
    
    // Gọi AI
    const aiResponse = await aiClient.generate(prompt);
    
    return {
        answer: aiResponse.answer,
        suggestedActions: aiResponse.suggestedActions,
        safetyWarning: aiResponse.safetyWarning
    };
};

export const generateCompleteWorkoutSuggestion = async (data) => {
    const {memberId, message} = data;
    const healthInfo = await getLatestHealthInfo(memberId);
    if(!healthInfo) {
        const error = new Error("HealthInfo not found");
        error.statusCode = 404;
        error.code = "HEALTHINFO_NOT_FOUND";
        throw error;
    }
    const user = await User.findById(memberId);
    if(!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";
        throw error;
    }
    const prompt = createCompleteWorkoutSuggestionPrompt(healthInfo, user, message);
    const aiSuggestionData = await aiClient.generate(prompt);
    // lưu vào db chỗ này



    return aiSuggestionData;
}

// Generate Workout Only (chỉ bài tập, không có nutrition)
export const generateWorkoutOnlySuggestion = async (data) => {
    const { memberId, message } = data;
    
    const healthInfo = await getLatestHealthInfo(memberId);
    if (!healthInfo) {
        const error = new Error("HealthInfo not found");
        error.statusCode = 404;
        error.code = "HEALTHINFO_NOT_FOUND";
        throw error;
    }
    
    const user = await User.findById(memberId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";
        throw error;
    }
    
    const prompt = createWorkoutOnlySuggestionPrompt(healthInfo, user, message);
    const aiResponse = await aiClient.generate(prompt);
    // const parsedResponse = parseAIResponse(aiResponse);
    
    // Lưu vào database
    // const savedSuggestion = await AISuggestion.create({
    //     memberId,
    //     recommendationDate: parsedResponse.recommendationDate ? new Date(parsedResponse.recommendationDate) : new Date(),
    //     goal: parsedResponse.goal || healthInfo.goal,
    //     exercises: parsedResponse.exercises || [],
    //     workoutDuration: parsedResponse.workoutDuration,
    //     difficultyLevel: parsedResponse.difficultyLevel || 'Beginner',
    //     notes: parsedResponse.notes || '',
    //     message: message || '',
    //     status: 'Pending'
    // });
    
    return aiResponse;
}

export const generateNutritionOnlySuggestion = async (data) => {
    const { memberId, message } = data;
    
    const healthInfo = await getLatestHealthInfo(memberId);
    if (!healthInfo) {
        const error = new Error("HealthInfo not found");
        error.statusCode = 404;
        error.code = "HEALTHINFO_NOT_FOUND";
        throw error;
    }
    
    const user = await User.findById(memberId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";
        throw error;
    }
    
    const prompt = createNutritionOnlySuggestionPrompt(healthInfo, user, message);
    const aiResponse = await aiClient.generate(prompt);
    // const parsedResponse = parseAIResponse(aiResponse);
    
    // Lưu vào database
    // const savedSuggestion = await AISuggestion.create({
    //     memberId,
    //     recommendationDate: new Date(),
    //     goal: parsedResponse.goal || healthInfo.goal,
    //     dietPlan: parsedResponse.dietPlan || {},
    //     message: message || '',
    //     status: 'Pending'
    // });
    
    return aiResponse;
}