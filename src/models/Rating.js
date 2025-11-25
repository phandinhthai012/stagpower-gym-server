import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must be at most 5'],
    },
    comment: {
        type: String,
        maxlength: [1000, 'Comment cannot exceed 1000 characters'],
        trim: true,
    },
}, {
    timestamps: true,
    collection: 'ratings'
});

// Unique constraint: one member can only rate one trainer once
ratingSchema.index({ memberId: 1, trainerId: 1 }, { unique: true });

// Indexes for better performance
ratingSchema.index({ trainerId: 1, createdAt: -1 });
ratingSchema.index({ memberId: 1, createdAt: -1 });

// Static methods
ratingSchema.statics.findByMember = function (memberId) {
    return this.find({ memberId })
        .populate('trainerId', 'fullName email photo trainerInfo')
        .sort({ createdAt: -1 });
};

ratingSchema.statics.findByTrainer = function (trainerId) {
    return this.find({ trainerId })
        .populate('memberId', 'fullName email photo')
        .sort({ createdAt: -1 });
};

ratingSchema.statics.findByMemberAndTrainer = function (memberId, trainerId) {
    return this.findOne({ memberId, trainerId })
        .populate('trainerId', 'fullName email photo trainerInfo')
        .populate('memberId', 'fullName email photo');
};

// Instance methods
ratingSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;

