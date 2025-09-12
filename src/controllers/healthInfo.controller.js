import response from "../utils/response";

import {
    createHealthInfo,
    getHealthInfoById,
    getHealthInfoByMemberId,
    updateHealthInfoById,
    getAllHealthInfo,
    deleteHealthInfoById
} from "../services/healthInfo.service";


const ALLOWED_FIELDS = [
    "height", "weight", "gender", "age", "bodyFatPercent",
    "medicalHistory", "allergies", "goal", "experience",
    "fitnessLevel", "preferredTime", "weeklySessions"
];

// create health info
export const createHealthInfoController = async (req, res, next) => {
    try {
        const memberId = req.params.memberId;
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
            statusCode: 201,
            message: "Health info created successfully",
            data: healthInfo
        });
    } catch (error) {
        return next(error);
    }
}

export const getHealthInfoByIdController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const healthInfo = await getHealthInfoById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Health info fetched successfully",
            data: healthInfo
        });
    } catch (error) {
        return next(error);
    }
}



// membergetme
export const getHealthInfoByMemberIdController = async (req, res, next) => {
    try {
        const memberId = req.params.memberId;
        const healthInfo = await getHealthInfoByMemberId(memberId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Health info fetched successfully",
            data: healthInfo
        });
    } catch (error) {
        return next(error);
    }
}


export const getMyHealthInfoController = async (req, res, next) => {
    try {
        const memberId = req.user._id;
        const healthInfo = await getHealthInfoByMemberId(memberId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Health info fetched successfully",
            data: healthInfo
        });
    } catch (error) {
        return next(error);
    }
}

export const updateHealthInfoByIdController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const healthInfo = await updateHealthInfoById(id, req.body);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Health info updated successfully",
            data: healthInfo
        });
    } catch (error) {
        return next(error);
    }
}

export const getAllHealthInfoController = async (req, res, next) => {
    try {
        const healthInfos = await getAllHealthInfo();
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Health info fetched successfully",
            data: healthInfos
        });
    } catch (error) {
        return next(error);
    }
}

export const deleteHealthInfoByIdController = async (req, res, next) => {
    try {
        const id = req.params.id;
        await deleteHealthInfoById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Health info deleted successfully",
            data: { message: "Health info deleted successfully" }
        });
    } catch (error) {
        return next(error);
    }
}