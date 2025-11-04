// Remove COLUMN_MAPPING and mapColumnNames - only used for Excel

export const normalizeEnumValue = (value, enumType) => {
    if (!value) return null;
    
    const valueLower = value.toString().toLowerCase().trim();
    
    const mappings = {
        gender: {
            'male': 'male', 'nam': 'male', 'm': 'male',
            'female': 'female', 'nu': 'female', 'nữ': 'female', 'f': 'female'
        },
        experience: {
            'beginner': 'beginner', 'moi bat dau': 'beginner', 'mới bắt đầu': 'beginner',
            'intermediate': 'intermediate', 'trung binh': 'intermediate', 'trung bình': 'intermediate',
            'advanced': 'advanced', 'nang cao': 'advanced', 'nâng cao': 'advanced'
        },
        fitnessLevel: {
            'low': 'low', 'thap': 'low', 'thấp': 'low',
            'medium': 'medium', 'trung binh': 'medium', 'trung bình': 'medium',
            'high': 'high', 'cao': 'high'
        },
        preferredTime: {
            'morning': 'morning', 'sang': 'morning', 'sáng': 'morning',
            'afternoon': 'afternoon', 'chieu': 'afternoon', 'chiều': 'afternoon',
            'evening': 'evening', 'toi': 'evening', 'tối': 'evening'
        },
        weeklySessions: {
            '1-2': '1-2', '1 to 2': '1-2',
            '3-4': '3-4', '3 to 4': '3-4',
            '5+': '5+'
        }
    };
    
    return mappings[enumType]?.[valueLower] || null;
};

export const validateHeight = (value) => {
    const result = { value: null, isValid: true, error: null, warning: null };
    
    if (!value || value.toString().trim() === '') {
        result.isValid = false;
        result.error = 'Thiếu chiều cao (height)';
        return result;
    }
    
    const height = parseFloat(value);
    if (isNaN(height) || height <= 0) {
        result.isValid = false;
        result.error = 'Chiều cao phải là số dương';
        return result;
    }
    
    if (height < 100 || height > 250) {
        result.warning = 'Chiều cao có vẻ không hợp lý (100-250cm)';
    }
    
    result.value = height;
    return result;
};
/**
 * Validate and format weight
 */
export const validateWeight = (value) => {
    const result = { value: null, isValid: true, error: null, warning: null };
    
    if (!value || value.toString().trim() === '') {
        result.isValid = false;
        result.error = 'Thiếu cân nặng (weight)';
        return result;
    }
    
    const weight = parseFloat(value);
    if (isNaN(weight) || weight <= 0) {
        result.isValid = false;
        result.error = 'Cân nặng phải là số dương';
        return result;
    }
    
    if (weight < 30 || weight > 200) {
        result.warning = 'Cân nặng có vẻ không hợp lý (30-200kg)';
    }
    
    result.value = weight;
    return result;
};

/**
 * Validate and format gender
 */
export const validateGender = (value) => {
    const result = { value: null, isValid: true, error: null };
    
    if (!value || value.toString().trim() === '') {
        result.isValid = false;
        result.error = 'Thiếu giới tính (gender)';
        return result;
    }
    
    const normalized = normalizeEnumValue(value, 'gender');
    if (!normalized) {
        result.isValid = false;
        result.error = 'Giới tính không hợp lệ (male/female hoặc nam/nữ)';
        return result;
    }
    
    result.value = normalized;
    return result;
};

/**
 * Validate and format age (optional)
 */
export const validateAge = (value) => {
    const result = { value: null, isValid: true, error: null, warning: null };
    
    if (!value || value.toString().trim() === '') {
        return result; // Optional field
    }
    
    const age = parseInt(value);
    if (isNaN(age) || age <= 0) {
        result.error = 'Tuổi phải là số nguyên dương';
        return result;
    }
    
    if (age < 10 || age > 100) {
        result.warning = 'Tuổi có vẻ không hợp lý (10-100)';
    }
    
    result.value = age;
    return result;
};

/**
 * Validate and format body fat percent (optional)
 */
export const validateBodyFatPercent = (value) => {
    const result = { value: null, isValid: true, error: null };
    
    if (!value || value.toString().trim() === '') {
        return result; // Optional field
    }
    
    const bodyFat = parseFloat(value);
    if (isNaN(bodyFat) || bodyFat < 0 || bodyFat > 100) {
        result.error = 'Tỷ lệ mỡ phải từ 0-100%';
        return result;
    }
    
    result.value = bodyFat;
    return result;
};

/**
 * Validate and format experience
 */
export const validateExperience = (value) => {
    const result = { value: null, isValid: true, error: null };
    
    if (!value || value.toString().trim() === '') {
        result.isValid = false;
        result.error = 'Thiếu kinh nghiệm (experience)';
        return result;
    }
    
    const normalized = normalizeEnumValue(value, 'experience');
    if (!normalized) {
        result.isValid = false;
        result.error = 'Kinh nghiệm không hợp lệ (beginner/intermediate/advanced)';
        return result;
    }
    
    result.value = normalized;
    return result;
};

/**
 * Validate and format fitness level
 */
export const validateFitnessLevel = (value) => {
    const result = { value: null, isValid: true, error: null };
    
    if (!value || value.toString().trim() === '') {
        result.isValid = false;
        result.error = 'Thiếu mức độ thể lực (fitnessLevel)';
        return result;
    }
    
    const normalized = normalizeEnumValue(value, 'fitnessLevel');
    if (!normalized) {
        result.isValid = false;
        result.error = 'Mức độ thể lực không hợp lệ (low/medium/high)';
        return result;
    }
    
    result.value = normalized;
    return result;
};

/**
 * Calculate BMI from height and weight
 */
export const calculateBMI = (height, weight) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return Math.round((weight / (heightInMeters * heightInMeters)) * 100) / 100;
};

/**
 * Validate all health data fields
 * @param {Object} mappedData - The extracted health data from PDF
 */
export const validateHealthData = (mappedData, source = 'pdf') => {
    const errors = [];
    const warnings = [];
    const data = {};
    let isValid = true;

    // PDF files don't require goal, experience, fitnessLevel (all optional)

    // Height
    const heightResult = validateHeight(mappedData.height);
    if (!heightResult.isValid) {
        isValid = false;
        errors.push(heightResult.error);
    } else {
        data.height = heightResult.value;
    }
    if (heightResult.warning) warnings.push(heightResult.warning);

    // Weight
    const weightResult = validateWeight(mappedData.weight);
    if (!weightResult.isValid) {
        isValid = false;
        errors.push(weightResult.error);
    } else {
        data.weight = weightResult.value;
    }
    if (weightResult.warning) warnings.push(weightResult.warning);

    // Gender
    const genderResult = validateGender(mappedData.gender);
    if (!genderResult.isValid) {
        isValid = false;
        errors.push(genderResult.error);
    } else {
        data.gender = genderResult.value;
    }

    // Age (optional)
    const ageResult = validateAge(mappedData.age);
    if (ageResult.value !== null) data.age = ageResult.value;
    if (ageResult.error) errors.push(ageResult.error);
    if (ageResult.warning) warnings.push(ageResult.warning);

    // Body Fat Percent (optional)
    const bodyFatResult = validateBodyFatPercent(mappedData.bodyFatPercent);
    if (bodyFatResult.value !== null) data.bodyFatPercent = bodyFatResult.value;
    if (bodyFatResult.error) errors.push(bodyFatResult.error);

    // Goal (optional for PDF)
    if (mappedData.goal && mappedData.goal.toString().trim() !== '') {
        data.goal = mappedData.goal.toString().trim();
    }

    // Experience (optional for PDF)
    if (mappedData.experience) {
        const experienceResult = validateExperience(mappedData.experience);
        if (experienceResult.isValid && experienceResult.value) {
            data.experience = experienceResult.value;
        } else if (experienceResult.error) {
            warnings.push(experienceResult.error); // Warning instead of error for PDF
        }
    }

    // Fitness Level (optional for PDF)
    if (mappedData.fitnessLevel) {
        const fitnessLevelResult = validateFitnessLevel(mappedData.fitnessLevel);
        if (fitnessLevelResult.isValid && fitnessLevelResult.value) {
            data.fitnessLevel = fitnessLevelResult.value;
        } else if (fitnessLevelResult.error) {
            warnings.push(fitnessLevelResult.error); // Warning instead of error for PDF
        }
    }

    // Preferred Time (optional)
    if (mappedData.preferredTime) {
        const normalized = normalizeEnumValue(mappedData.preferredTime, 'preferredTime');
        if (normalized) data.preferredTime = normalized;
    }

    // Weekly Sessions (optional)
    if (mappedData.weeklySessions) {
        const normalized = normalizeEnumValue(mappedData.weeklySessions, 'weeklySessions');
        if (normalized) data.weeklySessions = normalized;
    }

    // Medical History (optional)
    if (mappedData.medicalHistory) {
        data.medicalHistory = mappedData.medicalHistory.toString().trim();
    }

    // Allergies (optional)
    if (mappedData.allergies) {
        data.allergies = mappedData.allergies.toString().trim();
    }

    // Calculate BMI
    if (data.height && data.weight) {
        data.bmi = calculateBMI(data.height, data.weight);
    }

    // Keep all other fields from mappedData that are not explicitly validated
    // This includes InBody fields and segmental analysis
    const validatedFieldNames = [
        'height', 'weight', 'gender', 'age', 'bodyFatPercent',
        'goal', 'experience', 'fitnessLevel', 'preferredTime',
        'weeklySessions', 'medicalHistory', 'allergies', 'bmi'
    ];

    Object.keys(mappedData).forEach(key => {
        // If field is not in validated list and has a value, keep it
        if (!validatedFieldNames.includes(key) && mappedData[key] !== undefined && mappedData[key] !== null) {
            // For nested objects like segmental analysis, preserve them as-is
            if (typeof mappedData[key] === 'object' && !Array.isArray(mappedData[key])) {
                data[key] = mappedData[key];
            } else if (typeof mappedData[key] === 'number') {
                data[key] = mappedData[key];
            } else if (typeof mappedData[key] === 'string' && mappedData[key].trim() !== '') {
                data[key] = mappedData[key].trim();
            }
        }
    });

    return { data, isValid, errors, warnings };
};