import HealthInfo from "../models/HealthInfo";
import xlsx from 'xlsx';
import { readExcelFile } from '../utils/parsers/fileParser';
import { mapColumnNames, validateHealthData } from '../utils/parsers/healthFileParser';

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
        const error = new Error("Health info not found");
        error.statusCode = 404;
        error.code = "HEALTH_INFO_NOT_FOUND";
        throw error;
    }
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


// const parseAndSaveHealthData = async (fileBuffer, userId) => {
//     const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const jsonData = xlsx.utils.sheet_to_json(worksheet);

//     if (jsonData.length === 0) {
//       throw new Error('File không có dữ liệu.');
//     }

//     const healthDataToSave = [];

//     for (const (index, row) of jsonData.entries()) {
//       // 1. VALIDATE: Kiểm tra các trường bắt buộc
//       if (!row.date || !row.weight || !row.height) {
//         throw new Error(`Lỗi ở Dòng ${index + 2}: Thiếu dữ liệu 'date', 'weight' hoặc 'height'.`);
//       }
//       // (Thêm nhiều bước validate khác...)

//       // 2. Format dữ liệu
//       healthDataToSave.push({
//         user: userId,
//         date: new Date(row.date), // Cần xử lý date cẩn thận
//         weight: parseFloat(row.weight),
//         height: parseFloat(row.height),
//         bmi: parseFloat(row.bmi),
//         bodyFat: parseFloat(row.bodyFat),
//         // ... các trường khác từ model HealthInfo
//       });
//     }

//     // 3. Lưu vào DB
//     const result = await HealthInfo.insertMany(healthDataToSave);
//     return result;
// }


export const parseHealthFile = async (fileBuffer) => {
    // try {
    //     const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    //     const sheetName = workbook.SheetNames[0];
    //     const worksheet = workbook.Sheets[sheetName];
    //     const jsonData = xlsx.utils.sheet_to_json(worksheet, {
    //         raw: false,
    //         defval: '',
    //     });

    //     if (jsonData.length === 0) {
    //         throw new Error('File không có dữ liệu.');
    //     }
    //     const row = jsonData[0];
    //     let isValid = true;
    //     const errors = [];
    //     const warnings = [];
    //     const validatedData = [];
    //     // Mapping columns
    //     const mapping = {
    //         'height': ['height', 'chieu cao', 'chiều cao', 'chiều cao (cm)'],
    //         'weight': ['weight', 'can nang', 'cân nặng', 'cân nặng (kg)'],
    //         'gender': ['gender', 'gioi tinh', 'giới tính', 'sex'],
    //         'age': ['age', 'tuoi', 'tuổi', 'age (years)'],
    //         'bodyFatPercent': ['bodyfat', 'body fat', 'ty le mo', 'tỷ lệ mỡ', 'body fat %'],
    //         'medicalHistory': ['medical history', 'tien su benh', 'tiền sử bệnh', 'medical'],
    //         'allergies': ['allergies', 'di ung', 'dị ứng', 'allergy'],
    //         'goal': ['goal', 'muc tieu', 'mục tiêu', 'objective'],
    //         'experience': ['experience', 'kinh nghiem', 'kinh nghiệm', 'exp'],
    //         'fitnessLevel': ['fitness level', 'muc do the luc', 'mức độ thể lực', 'level'],
    //         'preferredTime': ['preferred time', 'thoi gian uu tien', 'thời gian ưu tiên', 'time'],
    //         'weeklySessions': ['weekly sessions', 'buoi tap trong tuan', 'buổi tập trong tuần', 'sessions']
    //     };
    //     const mappedData = {};
    //     Object.keys(mapping).forEach(key => {
    //         for (const columnName of mapping[key]) {
    //             const foundKey = Object.keys(row).find(k =>
    //                 k.toLowerCase().trim() === columnName.toLowerCase().trim()
    //             );
    //             if (foundKey) {
    //                 mappedData[key] = row[foundKey];
    //                 break;
    //             }
    //         }
    //     });
    //     // VALIDATE các trường bắt buộc
    //     // 1. Height
    //     if (!mappedData.height || mappedData.height.toString().trim() === '') {
    //         isValid = false;
    //         errors.push('Thiếu chiều cao (height)');
    //     } else {
    //         const height = parseFloat(mappedData.height);
    //         if (isNaN(height) || height <= 0) {
    //             isValid = false;
    //             errors.push('Chiều cao phải là số dương');
    //         } else if (height < 100 || height > 250) {
    //             warnings.push('Chiều cao có vẻ không hợp lý (100-250cm)');
    //         } else {
    //             mappedData.height = height;
    //         }
    //     }

    //     // 2. Weight
    //     if (!mappedData.weight || mappedData.weight.toString().trim() === '') {
    //         isValid = false;
    //         errors.push('Thiếu cân nặng (weight)');
    //     } else {
    //         const weight = parseFloat(mappedData.weight);
    //         if (isNaN(weight) || weight <= 0) {
    //             isValid = false;
    //             errors.push('Cân nặng phải là số dương');
    //         } else if (weight < 30 || weight > 200) {
    //             warnings.push('Cân nặng có vẻ không hợp lý (30-200kg)');
    //         } else {
    //             mappedData.weight = weight;
    //         }
    //     }

    //     // 3. Gender
    //     if (!mappedData.gender || mappedData.gender.toString().trim() === '') {
    //         isValid = false;
    //         errors.push('Thiếu giới tính (gender)');
    //     } else {
    //         const genderLower = mappedData.gender.toString().toLowerCase().trim();
    //         if (genderLower === 'male' || genderLower === 'nam' || genderLower === 'm') {
    //             mappedData.gender = 'male';
    //         } else if (genderLower === 'female' || genderLower === 'nu' || genderLower === 'nữ' || genderLower === 'f') {
    //             mappedData.gender = 'female';
    //         } else {
    //             isValid = false;
    //             errors.push('Giới tính không hợp lệ (male/female hoặc nam/nữ)');
    //         }
    //     }

    //     // 4. Age (optional)
    //     if (mappedData.age && mappedData.age.toString().trim() !== '') {
    //         const age = parseInt(mappedData.age);
    //         if (isNaN(age) || age <= 0) {
    //             errors.push('Tuổi phải là số nguyên dương');
    //         } else if (age < 10 || age > 100) {
    //             warnings.push('Tuổi có vẻ không hợp lý (10-100)');
    //         } else {
    //             mappedData.age = age;
    //         }
    //     }

    //     // 5. Body Fat Percent (optional)
    //     if (mappedData.bodyFatPercent && mappedData.bodyFatPercent.toString().trim() !== '') {
    //         const bodyFat = parseFloat(mappedData.bodyFatPercent);
    //         if (isNaN(bodyFat) || bodyFat < 0 || bodyFat > 100) {
    //             errors.push('Tỷ lệ mỡ phải từ 0-100%');
    //         } else {
    //             mappedData.bodyFatPercent = bodyFat;
    //         }
    //     }

    //     // 6. Goal (required)
    //     if (!mappedData.goal || mappedData.goal.toString().trim() === '') {
    //         isValid = false;
    //         errors.push('Thiếu mục tiêu (goal)');
    //     } else {
    //         mappedData.goal = mappedData.goal.toString().trim();
    //     }

    //     // 7. Experience (required)
    //     if (!mappedData.experience || mappedData.experience.toString().trim() === '') {
    //         isValid = false;
    //         errors.push('Thiếu kinh nghiệm (experience)');
    //     } else {
    //         const expLower = mappedData.experience.toString().toLowerCase().trim();
    //         if (expLower === 'beginner' || expLower === 'moi bat dau' || expLower === 'mới bắt đầu') {
    //             mappedData.experience = 'beginner';
    //         } else if (expLower === 'intermediate' || expLower === 'trung binh' || expLower === 'trung bình') {
    //             mappedData.experience = 'intermediate';
    //         } else if (expLower === 'advanced' || expLower === 'nang cao' || expLower === 'nâng cao') {
    //             mappedData.experience = 'advanced';
    //         } else {
    //             isValid = false;
    //             errors.push('Kinh nghiệm không hợp lệ (beginner/intermediate/advanced)');
    //         }
    //     }

    //     // 8. Fitness Level (required)
    //     if (!mappedData.fitnessLevel || mappedData.fitnessLevel.toString().trim() === '') {
    //         isValid = false;
    //         errors.push('Thiếu mức độ thể lực (fitnessLevel)');
    //     } else {
    //         const levelLower = mappedData.fitnessLevel.toString().toLowerCase().trim();
    //         if (levelLower === 'low' || levelLower === 'thap' || levelLower === 'thấp') {
    //             mappedData.fitnessLevel = 'low';
    //         } else if (levelLower === 'medium' || levelLower === 'trung binh' || levelLower === 'trung bình') {
    //             mappedData.fitnessLevel = 'medium';
    //         } else if (levelLower === 'high' || levelLower === 'cao') {
    //             mappedData.fitnessLevel = 'high';
    //         } else {
    //             isValid = false;
    //             errors.push('Mức độ thể lực không hợp lệ (low/medium/high)');
    //         }
    //     }

    //     // 9. Preferred Time (optional)
    //     if (mappedData.preferredTime && mappedData.preferredTime.toString().trim() !== '') {
    //         const timeLower = mappedData.preferredTime.toString().toLowerCase().trim();
    //         if (timeLower === 'morning' || timeLower === 'sang' || timeLower === 'sáng') {
    //             mappedData.preferredTime = 'morning';
    //         } else if (timeLower === 'afternoon' || timeLower === 'chieu' || timeLower === 'chiều') {
    //             mappedData.preferredTime = 'afternoon';
    //         } else if (timeLower === 'evening' || timeLower === 'toi' || timeLower === 'tối') {
    //             mappedData.preferredTime = 'evening';
    //         }
    //     }

    //     // 10. Weekly Sessions (optional)
    //     if (mappedData.weeklySessions && mappedData.weeklySessions.toString().trim() !== '') {
    //         const sessions = mappedData.weeklySessions.toString().trim();
    //         if (sessions === '1-2' || sessions === '1 to 2') {
    //             mappedData.weeklySessions = '1-2';
    //         } else if (sessions === '3-4' || sessions === '3 to 4') {
    //             mappedData.weeklySessions = '3-4';
    //         } else if (sessions === '5+' || sessions === '5+') {
    //             mappedData.weeklySessions = '5+';
    //         }
    //     }

    //     // 11. Medical History (optional)
    //     if (mappedData.medicalHistory) {
    //         mappedData.medicalHistory = mappedData.medicalHistory.toString().trim();
    //     }

    //     // 12. Allergies (optional)
    //     if (mappedData.allergies) {
    //         mappedData.allergies = mappedData.allergies.toString().trim();
    //     }

    //     // Tính BMI
    //     if (mappedData.height && mappedData.weight) {
    //         const heightInMeters = mappedData.height / 100;
    //         mappedData.bmi = Math.round((mappedData.weight / (heightInMeters * heightInMeters)) * 100) / 100;
    //     }

    //     // Return single object (not array)
    //     return {
    //         data: mappedData,
    //         isValid: isValid,
    //         errors: errors,
    //         warnings: warnings
    //     };
    // } catch (error) {
    //     throw new Error(`Lỗi đọc file: ${error.message}`);
    // }
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
