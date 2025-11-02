import HealthInfo from "../models/HealthInfo";
import xlsx from 'xlsx';
import { readExcelFile } from '../utils/parsers/fileParser';
import { mapColumnNames, validateHealthData } from '../utils/parsers/healthFileParser';

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
    const healthInfo = await HealthInfo.findOne({ memberId });
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

export const parseHealthFile = async (fileBuffer) => {
    try {
        // 1. Read Excel file
        const jsonData = readExcelFile(fileBuffer);
        const row = jsonData[0]; // Get first row (single member)

        // 2. Map column names
        const mappedData = mapColumnNames(row);

        // 3. Validate all fields
        const result = validateHealthData(mappedData);

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