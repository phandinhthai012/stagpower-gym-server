import mongoose from 'mongoose';
import Rating from "../models/Rating.js";
import User from "../models/User.js";
import Schedule from "../models/Schedule.js";

// Check if member has completed sessions with trainer
const hasCompletedSessionsWithTrainer = async (memberId, trainerId) => {
    const completedSessions = await Schedule.countDocuments({
        memberId,
        trainerId,
        status: 'Completed'
    });
    return completedSessions > 0;
};

// Get trainers that member can rate (has completed sessions with)
export const getRateableTrainers = async (memberId) => {
    // Get distinct trainer IDs from completed schedules
    const trainerIds = await Schedule.distinct('trainerId', {
        memberId,
        status: 'Completed'
    });

    if (trainerIds.length === 0) {
        return [];
    }

    // Get trainer details
    const trainers = await User.find({
        _id: { $in: trainerIds },
        role: 'trainer'
    })
        .select('fullName email photo trainerInfo')
        .lean();

    // Check which trainers already have ratings
    const existingRatings = await Rating.find({
        memberId,
        trainerId: { $in: trainerIds }
    }).select('trainerId').lean();

    const ratedTrainerIds = new Set(existingRatings.map(r => r.trainerId.toString()));

    // Add rating status to each trainer
    const trainersWithRatingStatus = trainers.map(trainer => ({
        ...trainer,
        hasRating: ratedTrainerIds.has(trainer._id.toString())
    }));

    return trainersWithRatingStatus;
};

// Create rating
export const createRating = async (ratingData) => {
    const { memberId, trainerId, rating, comment } = ratingData;

    // Validate member
    const member = await User.findById(memberId);
    if (!member || member.role !== 'member') {
        const error = new Error("Invalid member");
        error.statusCode = 400;
        error.code = "INVALID_MEMBER";
        throw error;
    }

    // Validate trainer
    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
        const error = new Error("Invalid trainer");
        error.statusCode = 400;
        error.code = "INVALID_TRAINER";
        throw error;
    }

    // Check if member has completed sessions with trainer
    const hasCompleted = await hasCompletedSessionsWithTrainer(memberId, trainerId);
    if (!hasCompleted) {
        const error = new Error("You can only rate trainers you have completed training sessions with");
        error.statusCode = 400;
        error.code = "NO_COMPLETED_SESSIONS";
        throw error;
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({ memberId, trainerId });
    if (existingRating) {
        const error = new Error("You have already rated this trainer");
        error.statusCode = 400;
        error.code = "RATING_ALREADY_EXISTS";
        throw error;
    }

    // Create rating
    const newRating = await Rating.create({
        memberId,
        trainerId,
        rating,
        comment: comment || ''
    });

    // Populate trainer info
    await newRating.populate('trainerId', 'fullName email photo trainerInfo');

    return newRating;
};

// Get all ratings by member
export const getRatingsByMember = async (memberId) => {
    const ratings = await Rating.find({ memberId })
        .populate('trainerId', 'fullName email photo trainerInfo')
        .sort({ createdAt: -1 });
    return ratings;
};

// Get rating by ID
export const getRatingById = async (ratingId) => {
    const rating = await Rating.findById(ratingId)
        .populate('trainerId', 'fullName email photo trainerInfo')
        .populate('memberId', 'fullName email photo');
    if (!rating) {
        const error = new Error("Rating not found");
        error.statusCode = 404;
        error.code = "RATING_NOT_FOUND";
        throw error;
    }
    return rating;
};

// Update rating
export const updateRating = async (ratingId, updateData, memberId) => {
    const rating = await Rating.findById(ratingId);
    if (!rating) {
        const error = new Error("Rating not found");
        error.statusCode = 404;
        error.code = "RATING_NOT_FOUND";
        throw error;
    }

    // Check if member owns this rating
    if (rating.memberId.toString() !== memberId) {
        const error = new Error("You can only update your own ratings");
        error.statusCode = 403;
        error.code = "UNAUTHORIZED";
        throw error;
    }

    // Update rating
    const { rating: newRating, comment } = updateData;
    if (newRating !== undefined) {
        rating.rating = newRating;
    }
    if (comment !== undefined) {
        rating.comment = comment;
    }

    await rating.save();
    await rating.populate('trainerId', 'fullName email photo trainerInfo');

    return rating;
};

// Delete rating
export const deleteRating = async (ratingId, memberId) => {
    const rating = await Rating.findById(ratingId);
    if (!rating) {
        const error = new Error("Rating not found");
        error.statusCode = 404;
        error.code = "RATING_NOT_FOUND";
        throw error;
    }

    // Check if member owns this rating
    if (rating.memberId.toString() !== memberId) {
        const error = new Error("You can only delete your own ratings");
        error.statusCode = 403;
        error.code = "UNAUTHORIZED";
        throw error;
    }

    await Rating.findByIdAndDelete(ratingId);
    return { message: "Rating deleted successfully" };
};

// Get all ratings by trainer (for trainer dashboard)
export const getRatingsByTrainer = async (trainerId) => {
    const ratings = await Rating.find({ trainerId })
        .populate('memberId', 'fullName email photo')
        .sort({ createdAt: -1 });
    return ratings;
};

// Get average rating for trainer
export const getTrainerAverageRating = async (trainerId) => {
    const result = await Rating.aggregate([
        { $match: { trainerId: mongoose.Types.ObjectId(trainerId) } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalRatings: { $sum: 1 }
            }
        }
    ]);

    if (result.length === 0) {
        return { averageRating: 0, totalRatings: 0 };
    }

    return {
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        totalRatings: result[0].totalRatings
    };
};

