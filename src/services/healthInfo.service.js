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
    const newHealthInfo = await HealthInfo.create({ memberId, height, weight, gender, age, bodyFatPercent, medicalHistory, allergies, goal, experience, fitnessLevel, preferredTime, weeklySessions });
    
    return newHealthInfo;
}

export const getHealthInfoById = async (id) => {
    const healthInfo = await HealthInfo.findById(id);
    if (!healthInfo) {
        const err = new Error("Health info not found");
        err.statusCode = 404;
        err.code = "HEALTH_INFO_NOT_FOUND";
        throw err;
    }
    return healthInfo;
}

export const getHealthInfoByMemberId = async (memberId) => {
    const healthInfo = await HealthInfo.findOne({ memberId });
    if (!healthInfo) {
        const err = new Error("Health info not found");
        err.statusCode = 404;
        err.code = "HEALTH_INFO_NOT_FOUND";
        throw err;
    }
    return healthInfo;
}

export const updateHealthInfoById = async (id, healthInfo) => {
    if (healthInfo.height || healthInfo.weight) {
        const existing = await HealthInfo.findById(id);
        const height = healthInfo.height || existing?.height;
        const weight = healthInfo.weight || existing?.weight;

        if (height && weight) {
            healthInfo.bmi = Math.round((weight / ((height / 100) ** 2)) * 100) / 100;
        }
    }

    const updated = await HealthInfo.findByIdAndUpdate( 
        id,
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
