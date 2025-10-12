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
    exercises: [{
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
            max: [100, 'Rest time cannot be greater than 100'],
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
    notes: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
}, {
    timestamps: true,
    collection: 'aiSuggestions'
});


const AISuggestion = mongoose.model('AISuggestion', aiSuggestionSchema);
export default AISuggestion;