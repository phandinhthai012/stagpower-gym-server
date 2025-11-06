// chức năng liên quan đến AI suggestion chưa cần implement, 
// làm sau khi các chức năng chính đã hoàn thành

import mongoose from 'mongoose';


const aiSuggestionSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Member ID is required'],
    },
    recommendationDate: {
        type: Date,
        required: [true, 'Recommendation date is required'],
    },
    // mục tiêu của member: tăng 
    goal: {
        type: String,
        required: [true, 'Goal is required'],
    },
    // === 1. Đánh giá sức khỏe (do AI tạo ra) ===
    evaluation: {
        healthScore: {
            type: Number,
            min: [0, 'Health score must be between 0-100'],
            max: [100, 'Health score must be between 0-100']
        },
        healthStatus: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor', 'critical']
        },
        healthScoreDescription: { // Phân tích chi tiết của AI
            type: String,
            maxlength: [2000, 'Description cannot exceed 2000 characters']
        }
    },
    exercises: [{
        _id: false,
        name: {
            type: String,
            required: [true, 'Exercise name is required'],
        },
        // số lần lặp lại
        sets: {
            type: Number,
            min: [1, 'Sets cannot be less than 1'],
            max: [20, 'Sets cannot be greater than 20'],
        },
        // số lập lại động tác trong mỗi set
        reps: {
            type: Number,
            min: [1, 'Reps must be at least 1'],
            max: [100, 'Reps cannot exceed 100']
        },
        restTime: {
            type: Number,
            min: [0, 'Rest time cannot be negative'],
            max: [1000, 'Rest time cannot be greater than 1000'],
        },
        instructions: {
            type: String,
            default: '',
        },

    }],
    workoutDuration: {
        type: Number,
        default: null
    },
    difficultyLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner',
    },
    nutrition: {
        type: String,
        default: '',
    },
    // Gợi ý dinh dưỡng: chỉ calo và thời gian ăn
    dietPlan: {
        // Tổng calo khuyến nghị mỗi ngày
        dailyCalories: {
            type: Number,
            min: [800],
            max: [8000]
        },
        // Macro nutrients (grams) - hữu ích cho nghiên cứu
        macros: {
            protein: Number,    // grams
            carbs: Number,      // grams
            fat: Number         // grams
        },
        // Thời gian ăn và gợi ý calo cho mỗi bữa
        mealTimes: [{
            _id: false,
            time: {
                type: String,  // "7:00 AM", "12:00 PM", "6:00 PM"
            },
            mealName: {
                type: String,  // "Bữa sáng", "Bữa trưa", "Bữa tối"
            },
            suggestedCalories: {
                type: Number,  // Gợi ý calo cho bữa này
                min: [0]
            }
        }],
        // Ghi chú dinh dưỡng (lưu ý, tips...)
        notes: {
            type: String,
            default: ''
        }
    },
    notes: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['Pending', 'Accepted', 'Completed', 'Cancelled', 'Archived'],
        default: 'Pending',
    },
    message: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
    collection: 'aiSuggestions'
});

// Indexes for better query performance
aiSuggestionSchema.index({ memberId: 1, recommendationDate: -1 });
aiSuggestionSchema.index({ status: 1 });
aiSuggestionSchema.index({ 'evaluation.healthScore': 1 });

const AISuggestion = mongoose.model('AISuggestion', aiSuggestionSchema);
export default AISuggestion;