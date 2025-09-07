import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    description: {
        type: String,
        default: '',
    },
    instructions: {
        type: String,
        required: [true, 'Instructions are required'],
    },
    tips: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'FullBody', 'Flexibility', 'Balance'],
            message: 'Category must be one of the specified options'
        }
        
    },
    difficultyLevel: {
        type: String,
        enum: {
            values: ['Beginner', 'Intermediate', 'Advanced'],
            message: 'Difficulty level must be one of the specified options'
        },
        default: 'Beginner',
    },
    //Mỗi bài tập thường nhắm vào một hoặc nhiều nhóm cơ chính
    targetMuscles: { // ví dụ: ['Pectoralis Major', 'Triceps']
        type: [String], 
        default: [],
    },
    duration: {
        type: Number, // phút (áp dụng cho cardio, yoga,...)
        min: [0, 'Duration cannot be negative'],
        max: [120, 'Duration cannot be greater than 120 minutes'],
        default: null,
    },
    equipment: {
        type: String,
        // enum: {
        //     values: ['Bodyweight', 'Barbell', 'Dumbbell', 'Machine', 'Other'],
        //     message: 'Equipment must be one of the specified options'
        // },
        default: 'Bodyweight'

    },
    sets: {
        type: Number,
        min: [1, 'Sets cannot be less than 1'],
        max: [10, 'Sets cannot be greater than 10'],
        default: 3,
    },
    reps: {
        type: Number,
        min: [1, 'Reps cannot be less than 1'],
        max: [100, 'Reps cannot be greater than 100'],
        default: 10,
    },
    weight: {
        type: Number,// kg
        min: [0, 'Weight cannot be negative'],
        max: [1000, 'Weight cannot be greater than 1000'],
        default: 0,
    },
    restTime: {
        type: Number,// phút
        min: [0, 'Rest time cannot be negative'],
        max: [100, 'Rest time cannot be greater than 100 minutes'],
        default: 5,
    },
    isActive: {
        type: Boolean,
        default: true
    },

}, {
    timestamps: true,
    collection: 'exercises'
});

// Indexes for better performance
exerciseSchema.index({ name: 1 });
exerciseSchema.index({ category: 1 });
exerciseSchema.index({ difficultyLevel: 1 });
exerciseSchema.index({ isActive: 1 });

exerciseSchema.index({ createdAt: -1 });

//static methods
exerciseSchema.statics.findByCategory = function(category) {
    return this.find({ category, isActive: true });
};
exerciseSchema.statics.findByDifficultyLevel = function(difficultyLevel) {
    return this.find({ difficultyLevel, isActive: true });
};
exerciseSchema.statics.findByIsActive = function(isActive) {
    return this.find({ isActive });
};

exerciseSchema.statics.searchExercises = function(searchTerm) {
    return this.find({
        name: { $regex: searchTerm, $options: 'i' },
        isActive: true
    });
};



const Exercise = mongoose.model('Exercise', exerciseSchema);
export default Exercise;