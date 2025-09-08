import mongoose from "mongoose";


const healthInfoSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    height: {
        type: Number, // cm
        required: true
    },
    weight: {
        type: Number, // kg
        required: true
    },
    bmi: {
        type: Number,
        min: [10, 'BMI must be at least 10'],
        max: [60, 'BMI cannot exceed 60']
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female']
    },
    age: {
        type: Number,
        // required: true,
        min: [1, 'Age must be at least 1'],
        max: [100, 'Age cannot exceed 100']
    },
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
        required: true,
        enum: ['weightLoss', 'muscleGain', 'health', 'endurance', 'other'],
        lowercase: true
    },
    experience: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced'],
        lowercase: true
    },
    fitnessLevel: {
        type: String,
        required: true,
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
    lastUpdated: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'health_info'
});

// indexes for the healthInfoSchema
healthInfoSchema.index({ memberId: 1 }, { unique: true });
healthInfoSchema.index({ goal: 1 });
healthInfoSchema.index({ experience: 1 });
healthInfoSchema.index({ fitnessLevel: 1 });

// pre-save hook to calculate bmi
healthInfoSchema.pre('save', async function (next) {
    try {
        // Tính BMI
        if (this.height && this.weight) {
            const heightInMeters = this.height / 100;
            this.bmi = Math.round((this.weight / (heightInMeters * heightInMeters)) * 100) / 100;
        }

        // Tính Age từ member (nếu có)
        // if (this.memberId && !this.age) {
        //     const User = mongoose.model('User');
        //     const member = await User.findById(this.memberId);
        //     if (member && member.dateOfBirth) {
        //         const today = new Date();
        //         const birthDate = new Date(member.dateOfBirth);
        //         this.age = today.getFullYear() - birthDate.getFullYear();
        //     }
        // }

        // Cập nhật lastUpdated
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