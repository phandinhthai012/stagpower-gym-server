import AISuggestion from "../models/AISuggestion";
import HealthInfo from "../models/HealthInfo";
import User from "../models/User";
import { 
    createWorkoutSuggestionPrompt, 
    createNutritionSuggestionPrompt,
    createChatbotConsultationPrompt
} from "../config/prompts/prompt";
import aiClient from "../config/ai";

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

// api generate data for ai from aiClient
// services/aiSuggestion.service.js (đã có - cần cải thiện)
// - generateWorkoutSuggestion()
// - generateNutritionSuggestion()
// - generateRecoverySuggestion()
// - analyzeProgress()
// - getPersonalizedPlan()
// - updateAIFeedback()
export const generateAISuggestion = async (data) => {
    const {memberId, message} = data;
    const healthInfo = await HealthInfo.findOne({
        memberId:memberId
    });
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
    const prompt = createWorkoutSuggestionPrompt(healthInfo, user, message);
    const aiSuggestionData = await aiClient.generate(prompt);
    return aiSuggestionData;
}

export const generateNutritionSuggestion = async (data) => {
    const {memberId, message} = data;
    const healthInfo = await HealthInfo.findOne({
        memberId:memberId
    });
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
    const prompt = createNutritionSuggestionPrompt(healthInfo, user, message);
    const aiSuggestionData = await aiClient.generate(prompt);
    return aiSuggestionData;
}

export const chatWithAI = async (data) => {
    const { memberId, message, conversationHistory = [] } = data;
    
    // Lấy thông tin health info
    const healthInfo = await HealthInfo.findOne({ memberId });
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
    
    // Lưu vào database
    // const savedSuggestion = await AISuggestion.create({
    //     memberId,
    //     message,
    //     recommendationDate: new Date(),
    //     goal: healthInfo.goal,
    //     response: {
    //         answer: aiResponse.answer || '',
    //         suggestedActions: aiResponse.suggestedActions || [],
    //         safetyWarning: aiResponse.safetyWarning || ''
    //     },
    //     status: 'Completed'
    // });
    
    return {
        // id: savedSuggestion._id,
        answer: aiResponse.answer,
        suggestedActions: aiResponse.suggestedActions,
        safetyWarning: aiResponse.safetyWarning
    };
};