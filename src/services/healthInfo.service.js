import HealthInfo from "../models/HealthInfo";
import { readHealthFile } from '../utils/parsers/fileParser';
import { validateHealthData } from '../utils/parsers/healthFileParser';

export const createHealthInfo = async (memberId, healthInfo) => {
    // Sử dụng spread operator để lấy tất cả fields từ healthInfo
    // Pre-save hook sẽ tự động tính BMI và healthScore
    const newHealthInfo = await HealthInfo.create({ 
        memberId, 
        ...healthInfo 
    });

    return newHealthInfo;
}

export const getHealthInfoById = async (id) => {
    const healthInfo = await HealthInfo.findById(id);
    if (!healthInfo) {
        const error = new Error("Health info not found");
        error.statusCode = 404;
        error.code = "HEALTH_INFO_NOT_FOUND";
        throw error;
    }
    return healthInfo;
}

export const getHealthInfoByMemberId = async (memberId) => {
    // Lấy HealthInfo mới nhất của member (thay vì chỉ lấy một bản ghi đầu tiên)
    const healthInfo = await HealthInfo.findOne({ memberId })
        .sort({ createdAt: -1 })
        .limit(1);
    if (!healthInfo) {
        const error = new Error("Health info not found");
        error.statusCode = 404;
        error.code = "HEALTH_INFO_NOT_FOUND";
        throw error;
    }
    return healthInfo;
}

export const getLatestHealthInfoByMemberId = async (memberId) => {
    const healthInfo = await HealthInfo.findOne({ memberId })
        .sort({createdAt: -1 })
        .limit(1);
    
    if (!healthInfo) {
        const error = new Error("Health info not found");
        error.statusCode = 404;
        error.code = "HEALTH_INFO_NOT_FOUND";
        throw error;
    }
    return healthInfo;
}

export const getAllHealthInfoByMemberId = async (memberId) => {
    // Lấy tất cả HealthInfo records của member, sắp xếp theo createdAt (mới nhất trước)
    const healthInfoList = await HealthInfo.find({ memberId })
        .sort({ createdAt: -1 });
    
    return healthInfoList; // Trả về array, có thể rỗng
}

export const updateHealthInfoById = async (id, healthInfo) => {
    // Tìm document hiện tại
    const existing = await HealthInfo.findById(id);
    if (!existing) {
        const error = new Error("Health info not found");
        error.statusCode = 404;
        error.code = "HEALTH_INFO_NOT_FOUND";
        throw error;
    }

    // Update từng field để trigger pre-save hook
    Object.keys(healthInfo).forEach(key => {
        if (healthInfo[key] !== undefined) {
            existing[key] = healthInfo[key];
        }
    });

    // Save để trigger pre-save hook (tính BMI và healthScore tự động)
    const updated = await existing.save();
    return updated;
};

export const getAllHealthInfo = async () => {
    const healthInfo = await HealthInfo.find();
    return healthInfo;
}

export const deleteHealthInfoById = async (id) => {
    const deleted = await HealthInfo.findByIdAndDelete(id);
    if (!deleted) {
        const error = new Error("Health info not found");
        error.statusCode = 404;
        error.code = "HEALTH_INFO_NOT_FOUND";
        throw error;
    }
    return deleted;
}

export const parseHealthFile = async (fileBuffer, mimeType) => {
    try {
        // 1. Read PDF file and extract health data
        const jsonData = await readHealthFile(fileBuffer, mimeType);
        const extractedData = jsonData[0]; // Get extracted data (PDF parser returns array with single object)

        // 2. Validate all fields (PDF - goal, experience, fitnessLevel are optional)
        const result = validateHealthData(extractedData, 'pdf');

        return result;
    } catch (error) {
        throw new Error(`Lỗi đọc file: ${error.message}`);
    }
};

// Lấy tất cả HealthInfo của member (lịch sử)
export const getHealthInfoHistoryByMemberId = async (memberId) => {
    const healthInfoList = await HealthInfo.find({ memberId })
        .sort({ createdAt: -1 });
    if (!healthInfoList || healthInfoList.length === 0) {
        const error = new Error("Health info not found");
        error.statusCode = 404;
        error.code = "HEALTH_INFO_NOT_FOUND";
        throw error;
    }
    return healthInfoList;
}

// Upload PDF file and create HealthInfo
export const uploadAndCreateHealthInfo = async (memberId, fileBuffer, mimeType) => {
    try {
        // 1. Parse PDF file
        const parsedResult = await parseHealthFile(fileBuffer, mimeType);
        
        // 2. Check if parsed data is valid
        if (!parsedResult.isValid) {
            const error = new Error(`Dữ liệu không hợp lệ: ${parsedResult.errors.join(', ')}`);
            error.statusCode = 400;
            error.code = "INVALID_HEALTH_DATA";
            error.errors = parsedResult.errors;
            error.warnings = parsedResult.warnings;
            throw error;
        }
        
        // 3. Create HealthInfo with parsed data
        const healthInfo = await createHealthInfo(memberId, parsedResult.data);
        
        return {
            healthInfo,
            warnings: parsedResult.warnings || []
        };
    } catch (error) {
        // Re-throw error if it already has statusCode
        if (error.statusCode) {
            throw error;
        }
        // Otherwise wrap it
        const newError = new Error(`Lỗi upload và tạo HealthInfo: ${error.message}`);
        newError.statusCode = 500;
        newError.code = "UPLOAD_HEALTH_INFO_ERROR";
        throw newError;
    }
};