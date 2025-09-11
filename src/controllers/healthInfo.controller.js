import response from "../utils/response";

import {
    createHealthInfo,
    getHealthInfoByMemberId,
    updateHealthInfo
} from "../services/healthInfo.service";


const ALLOWED_FIELDS = [
    "height", "weight", "gender", "age", "bodyFatPercent",
    "medicalHistory", "allergies", "goal", "experience",
    "fitnessLevel", "preferredTime", "weeklySessions"
];

// create health info
export const createMemberHealthInfoController = async (req, res, next) => {
    try {
        const memberId = req.params.userId;
        const {
            height,
            weight,
            gender,
            age,
            bodyFatPercent,
            medicalHistory,
            allergies,
            goal,
            experience,
            fitnessLevel,
            preferredTime,
            weeklySessions
        } = req.body;
        const healthInfo = await createHealthInfo(memberId, {
            height,
            weight, gender, age, bodyFatPercent,
            medicalHistory, allergies, goal,
            experience, fitnessLevel, preferredTime, weeklySessions
        });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Health info created successfully",
            data: healthInfo
        });
    } catch (error) {
        return next(error);
    }
}


// membergetme
export const getMemberHealthInfoController = async (req, res, next) => {
    try {
       
    } catch (error) {
        return next(error);
    }
}