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
        // const error = new Error("HealthInfo not found");
        // error.statusCode = 404;
        // error.code = "HEALTHINFO_NOT_FOUND";
        // throw error;
        return null;
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
        // const error = new Error("HealthInfo not found");
        // error.statusCode = 404;
        // error.code = "HEALTHINFO_NOT_FOUND";
        // throw error;
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
    const savedSuggestion = await AISuggestion.create({
        memberId,
        recommendationDate: new Date(),
        goal: aiSuggestionData.goal,
        evaluation: aiSuggestionData?.evaluation,
        exercises: aiSuggestionData?.exercises,
        workoutDuration: aiSuggestionData?.workoutDuration,
        difficultyLevel: aiSuggestionData?.difficultyLevel,
        nutrition: aiSuggestionData?.nutrition,
        dietPlan: aiSuggestionData?.dietPlan,
        notes: aiSuggestionData.notes,
        status: 'Pending',
        message: message
    });

    return savedSuggestion;
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
    const savedSuggestion = await AISuggestion.create({
        memberId,
        recommendationDate: aiResponse.recommendationDate ? new Date(aiResponse.recommendationDate) : new Date(),
        goal: aiResponse.goal || aiResponse.goal,
        exercises: aiResponse.exercises || [],
        workoutDuration: aiResponse.workoutDuration,
        difficultyLevel: aiResponse.difficultyLevel || 'Beginner',
        notes: aiResponse.notes || '',
        message: message || '',
        status: 'Pending'
    });
    
    return savedSuggestion;
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
    
    // Lưu vào database
    const savedSuggestion = await AISuggestion.create({
        memberId,
        recommendationDate: new Date(),
        goal: aiResponse.goal || healthInfo.goal,
        dietPlan: aiResponse.dietPlan || {},
        message: message || '',
        status: 'Pending'
    });
    
    return savedSuggestion;
}

export const updateAISuggestion = async (id, updateData) => {
    const { trainerId, trainerNotes, status, ...otherData } = updateData;
    
    const aiSuggestion = await AISuggestion.findById(id);
    if (!aiSuggestion) {
        const error = new Error("AISuggestion not found");
        error.statusCode = 404;
        error.code = "AISUGGESTION_NOT_FOUND";
        throw error;
    }
    
    // Update fields
    if (trainerId !== undefined) {
        aiSuggestion.trainerId = trainerId;
    }
    if (trainerNotes !== undefined) {
        aiSuggestion.trainerNotes = trainerNotes || '';
    }
    if (status !== undefined) {
        aiSuggestion.status = status;
    }
    
    // Update other fields (but be careful with nested objects)
    Object.keys(otherData).forEach(key => {
        if (otherData[key] !== undefined && key !== 'exercises' && key !== 'evaluation' && key !== 'dietPlan') {
            try {
                aiSuggestion[key] = otherData[key];
            } catch (err) {
                console.warn(`Could not update field ${key}:`, err);
            }
        }
    });
    
    await aiSuggestion.save();
    return aiSuggestion;
}