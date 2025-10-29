import response from "../utils/response";

import {
    createHealthInfo,
    getHealthInfoById,
    getHealthInfoByMemberId,
    updateHealthInfoById,
    getAllHealthInfo,
    deleteHealthInfoById,
    parseHealthFile,
    getHealthInfoHistoryByMemberId,
    getLatestHealthInfoByMemberId
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
        // Lấy tất cả các fields từ req.body (bao gồm cả fields mới)
        const healthInfo = await createHealthInfo(memberId, req.body);
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

export const parseHealthDataPreview = async (req, res, next) => {
    if (!req.file) {
        const error = new Error('Vui lòng tải lên một file.');
        error.statusCode = 400;
        return next(error);
    }
    try {
        const fileBuffer = req.file.buffer;
        console.log('📁 File uploaded:', req.file.originalname, req.file.size, 'bytes');
        const parsedData = await parseHealthFile(fileBuffer);
        console.log('📊 Parsed data:', JSON.stringify(parsedData, null, 2));
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Health data parsed successfully",
            data: parsedData
        });
    } catch (error) {
        return next(error);
    }
}

// Lấy tất cả HealthInfo của member (lịch sử)
export const getHealthInfoHistoryByMemberIdController = async (req, res, next) => {
    try {
        const memberId = req.params.memberId;
        const healthInfoList = await getHealthInfoHistoryByMemberId(memberId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Health info history fetched successfully",
            data: healthInfoList
        });
    } catch (error) {
        return next(error);
    }
}

// Lấy HealthInfo mới nhất của member
export const getLatestHealthInfoByMemberIdController = async (req, res, next) => {
    try {
        const memberId = req.params.memberId;
        const healthInfo = await getLatestHealthInfoByMemberId(memberId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Latest health info fetched successfully",
            data: healthInfo
        });
    } catch (error) {
        return next(error);
    }
}