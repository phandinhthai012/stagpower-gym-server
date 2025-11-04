import mongoose from "mongoose";


const healthInfoSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // ===== Thông tin nhân trắc học =====
    height: {
        type: Number, // cm
        // Not required - can be added later when member comes to gym
    },
    weight: {
        type: Number, // kg
        // Not required - can be added later when member comes to gym
    },
    bmi: {
        type: Number,
        min: [10, 'BMI must be at least 10'],
        max: [60, 'BMI cannot exceed 60']
    },
    bodyFatPercent: {
        type: Number,
        min: [0, 'Body fat percentage must be at least 0'],
        max: [100, 'Body fat percentage cannot exceed 100']
    },
    muscleMass: {
        type: Number, // kg
        min: [0, 'Khối lượng cơ không hợp lệ']
    },
    visceralFatLevel: {
        type: Number, // Cấp độ mỡ nội tạng (ví dụ: 1-20)
        min: [0, 'Mỡ nội tạng không hợp lệ']
    },
    waterPercent: {
        type: Number,
        min: [0],
        max: [100]
    },
    boneMass: { // khối lượng xương
        type: Number
    },
    // ===== Các chỉ số từ InBody =====
    bodyFatMass: {
        type: Number, // kg - Khối lượng mỡ cơ thể
        min: [0, 'Body fat mass must be at least 0']
    },
    basalMetabolicRate: {
        type: Number, // kcal - Tỷ lệ trao đổi chất cơ bản
        min: [0, 'Basal metabolic rate must be at least 0']
    },
    waistHipRatio: {
        type: Number, // Tỷ lệ vòng eo/vòng hông
        min: [0, 'Waist hip ratio must be at least 0'],
        max: [3, 'Waist hip ratio cannot exceed 3']
    },
    inBodyScore: {
        type: Number, // Điểm InBody (0-100)
        min: [0, 'InBody score must be at least 0'],
        max: [100, 'InBody score cannot exceed 100']
    },
    // ===== Segmental Lean Analysis =====
    segmentalLeanAnalysis: {
        leftArm: {
            mass: { type: Number }, // kg
            percent: { type: Number } // %
        },
        rightArm: {
            mass: { type: Number }, // kg
            percent: { type: Number } // %
        },
        leftLeg: {
            mass: { type: Number }, // kg
            percent: { type: Number } // %
        },
        rightLeg: {
            mass: { type: Number }, // kg
            percent: { type: Number } // %
        }
    },
    // ===== Segmental Fat Analysis =====
    segmentalFatAnalysis: {
        leftArm: {
            mass: { type: Number }, // kg
            percent: { type: Number } // %
        },
        rightArm: {
            mass: { type: Number }, // kg
            percent: { type: Number } // %
        },
        trunk: {
            mass: { type: Number }, // kg
            percent: { type: Number } // %
        },
        leftLeg: {
            mass: { type: Number }, // kg
            percent: { type: Number } // %
        },
        rightLeg: {
            mass: { type: Number }, // kg
            percent: { type: Number } // %
        }
    },
    gender: {
        type: String,
        // Not required - can be added later
        enum: ['male', 'female']
    },
    age: {
        type: Number,
        min: [1, 'Age must be at least 1'],
        max: [100, 'Age cannot exceed 100']
    },
    // 
    medicalHistory: {
        type: String,
        maxlength: [1000, 'Medical history cannot exceed 1000 characters'],
        default: 'Không có vấn đề'
    },
    allergies: {
        type: String,
        maxlength: [500, 'Allergies cannot exceed 500 characters'],
        default: 'Không có'
    },
    goal: {
        type: String,
        // Not required - can be added later when trainer assesses member
        // enum: ['weightLoss', 'muscleGain', 'health', 'endurance', 'other'],
    },
    experience: {
        type: String,
        // Not required - can be added later when trainer assesses member
        enum: ['beginner', 'intermediate', 'advanced'],
        lowercase: true
    },
    fitnessLevel: {
        type: String,
        // Not required - can be added later when trainer assesses member
        enum: ['low', 'medium', 'high'],
        lowercase: true
    },
    // thời gian ưu tiên
    preferredTime: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
        lowercase: true
    },
    weeklySessions: {
        type: String,
        enum: ['1-2', '3-4', '5+']
    },
    // ===== Dinh dưỡng & lối sống =====
    dietType: { // loại chế độ dinh dưỡng
        type: String,
        enum: ['balanced', 'high_protein', 'low_carb', 'vegetarian', 'vegan', 'other'],
        default: 'balanced'
    },
    dailyCalories: { // calo mỗi ngày
        type: Number,
        min: [800],
        max: [5000]
    },
    sleepHours: {
        type: Number,
        min: [0],
        max: [24]
    },
    stressLevel: { // mức độ stress
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    alcohol: { // uống rượu
        type: String,
        enum: ['none', 'occasional', 'frequent'],
        default: 'none'
    },
    smoking: { // hút thuốc lá
        type: Boolean,
        default: false
    },
    lastUpdated: {
        type: Date,
        required: true,
        default: Date.now
    },
    // thông tin đánh giá 
    healthScore: {
        type: Number,
        min: [0],
        max: [100]
    },
    healthScoreDescription: {
        type: String,
        maxlength: [1000, 'Health score description cannot exceed 1000 characters'],
    },
    healthStatus: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
        // excellent: 80-100
        // good: 60-79
        // fair: 40-59
        // poor: 20-39
        // critical: 0-19
    },
}, {
    timestamps: true,
    collection: 'health_info'
});

// indexes for the healthInfoSchema
healthInfoSchema.index({ memberId: 1, createdAt: -1 }); 
healthInfoSchema.index({ goal: 1 });
healthInfoSchema.index({ experience: 1 });
healthInfoSchema.index({ fitnessLevel: 1 });
healthInfoSchema.index({ healthScore: 1 });
healthInfoSchema.index({ healthStatus: 1 });

// pre-save hook: tính BMI và health score
healthInfoSchema.pre('save', async function (next) {
    try {
        // --- 1. Tính BMI ---
        if (this.height && this.weight) {
            const heightInMeters = this.height / 100;
            this.bmi = Math.round((this.weight / (heightInMeters * heightInMeters)) * 100) / 100;
        }

        // --- 2. Tính điểm sức khỏe tổng (chỉ tính khi có BMI) ---
        if (this.bmi !== undefined && this.bmi !== null) {
            let score = 100;

            // BMI lý tưởng 18.5 - 24.9
            if (this.bmi < 18.5 || this.bmi > 29.9) score -= 15;
            else if (this.bmi >= 25 && this.bmi <= 29.9) score -= 8;

            // Body fat lý tưởng: 10–25% nam, 18–30% nữ
            if (this.bodyFatPercent !== undefined && this.bodyFatPercent !== null && this.gender) {
                const idealFatRange = this.gender === 'male' ? [10, 25] : [18, 30];
                if (this.bodyFatPercent < idealFatRange[0] || this.bodyFatPercent > idealFatRange[1])
                    score -= 10;
            }

            // Muscle mass (nếu có)
            if (this.muscleMass && this.weight) {
                const muscleRatio = this.muscleMass / this.weight;
                if (muscleRatio < 0.25) score -= 5;
            }

            // Ngủ đủ 7–9 tiếng
            if (this.sleepHours !== undefined && this.sleepHours !== null) {
                if (this.sleepHours < 6) score -= 10;
                else if (this.sleepHours < 7 || this.sleepHours > 9) score -= 5;
            }

            // Stress
            if (this.stressLevel === 'high') score -= 10;
            else if (this.stressLevel === 'medium') score -= 5;

            // Rượu & thuốc lá
            if (this.alcohol === 'frequent') score -= 10;
            else if (this.alcohol === 'occasional') score -= 5;

            if (this.smoking === true) score -= 15;

            // Đảm bảo score nằm trong [0, 100]
            score = Math.max(0, Math.min(score, 100));

            this.healthScore = Math.round(score);

            // --- 3. Xếp loại ---
            if (this.healthScore >= 80) this.healthStatus = 'excellent';
            else if (this.healthScore >= 60) this.healthStatus = 'good';
            else if (this.healthScore >= 40) this.healthStatus = 'fair';
            else if (this.healthScore >= 20) this.healthStatus = 'poor';
            else this.healthStatus = 'critical';

            // --- 4. Sinh mô tả ---
            const descriptions = {
                excellent: 'Tình trạng sức khỏe rất tốt, duy trì chế độ luyện tập và ăn uống hiện tại.',
                good: 'Sức khỏe ổn định, nên tập trung cải thiện thể lực và cân bằng dinh dưỡng.',
                fair: 'Sức khỏe ở mức trung bình, cần chú ý chế độ ăn uống và luyện tập thường xuyên.',
                poor: 'Sức khỏe yếu, nên được huấn luyện viên hỗ trợ để lập kế hoạch phục hồi.',
                critical: 'Cảnh báo sức khỏe nghiêm trọng, cần được tư vấn y tế trước khi luyện tập.'
            };
            this.healthScoreDescription = descriptions[this.healthStatus] || '';
        }
        // --- 5. Cập nhật thời gian ---
        this.lastUpdated = new Date();

        next();
    } catch (error) {
        next(error);
    }
});
// method of instance
healthInfoSchema.methods.calculateBmi = function () {
    const heightInMeters = this.height / 100;
    this.bmi = Math.round((this.weight / (heightInMeters * heightInMeters)) * 100) / 100;
    return this.bmi;
}




// Static methods
healthInfoSchema.statics.findByGoal = function (goal) {
    return this.find({ goal: goal.toLowerCase() });
};

healthInfoSchema.statics.findByFitnessLevel = function (level) {
    return this.find({ fitnessLevel: level.toLowerCase() });
};


const HealthInfo = mongoose.model('HealthInfo', healthInfoSchema);

export default HealthInfo;