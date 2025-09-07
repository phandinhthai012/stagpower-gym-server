import mongoose from 'mongoose';


const scheduleSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Member ID is required'],
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Trainer ID is required'],
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: [true, 'Subscription ID is required'],
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        // required: [true, 'Branch ID is required'],
    },
    dateTime: { // ngày giờ buổi tập với trainer
        type: Date,
        required: [true, 'Schedule date is required'],
    },
    durationMinutes: {
        type: Number,
        required: [true, 'Duration minutes is required'],
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['Confirmed', 'Completed', 'Cancelled', 'NoShow'],
        default: 'Confirmed',
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
}, {
    timestamps: true,
    collection: 'schedules'
});



// indexes for better performance
scheduleSchema.index({ dateTime: -1 });
scheduleSchema.index({ memberId: 1, dateTime: -1 });
scheduleSchema.index({ trainerId: 1, dateTime: -1 });

// Static methods
scheduleSchema.statics.findByMember = function (memberId, limit = 10) {
    return this.find({ memberId })
        .populate('trainerId branchId subscriptionId')
        .sort({ dateTime: -1 })
        .limit(limit);
};

scheduleSchema.statics.findByTrainer = function (trainerId, limit = 10) {
    return this.find({ trainerId })
        .populate('memberId branchId subscriptionId')
        .sort({ dateTime: -1 })
        .limit(limit);
    
};
scheduleSchema


const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;