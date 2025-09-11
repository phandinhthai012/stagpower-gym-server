import HealthInfo from "../models/HealthInfo";


export const createHealthInfo = async (memberId, healthInfo) => {
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
    } = healthInfo;
    const healthInfo = await HealthInfo.create({ memberId, height, weight, gender, age, bodyFatPercent, medicalHistory, allergies, goal, experience, fitnessLevel, preferredTime, weeklySessions });
    return healthInfo;
}

export const getHealthInfoByMemberId = async (memberId) => {
    const healthInfo = await HealthInfo.findOne({ memberId });
    return healthInfo;
}

export const updateHealthInfo = async (memberId, healthInfo) => {
    const updated = await HealthInfo.findOneAndUpdate(
        { memberId },
        { $set: healthInfo },
        { new: true, runValidators: true }
    );  
    if (!updated) {
        const err = new Error("Health info not found");
        err.statusCode = 404;
        err.code = "HEALTH_INFO_NOT_FOUND";
        throw err;
    }
    return updated;
};
