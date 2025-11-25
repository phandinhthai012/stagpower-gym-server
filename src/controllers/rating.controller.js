import {
    createRating,
    getRatingsByMember,
    getRatingById,
    updateRating,
    deleteRating,
    getRatingsByTrainer,
    getTrainerAverageRating,
    getRateableTrainers,
    getTopRatings
} from "../services/rating.service.js";
import response from "../utils/response.js";

export const createRatingController = async (req, res, next) => {
    try {
        const memberId = req.user._id.toString(); // Get from authenticated user
        const { trainerId, rating, comment } = req.body;

        const newRating = await createRating({
            memberId,
            trainerId,
            rating,
            comment
        });

        response(res, {
            success: true,
            statusCode: 201,
            message: "Rating created successfully",
            data: newRating
        });
    } catch (error) {
        next(error);
    }
};

export const getRatingsByMemberController = async (req, res, next) => {
    try {
        const memberId = req.user._id.toString(); // Get from authenticated user
        const ratings = await getRatingsByMember(memberId);

        response(res, {
            success: true,
            statusCode: 200,
            message: "Ratings fetched successfully",
            data: ratings
        });
    } catch (error) {
        next(error);
    }
};

export const getRatingByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rating = await getRatingById(id);

        response(res, {
            success: true,
            statusCode: 200,
            message: "Rating fetched successfully",
            data: rating
        });
    } catch (error) {
        next(error);
    }
};

export const updateRatingController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const memberId = req.user._id.toString(); // Get from authenticated user
        const { rating, comment } = req.body;

        const updatedRating = await updateRating(id, { rating, comment }, memberId);

        response(res, {
            success: true,
            statusCode: 200,
            message: "Rating updated successfully",
            data: updatedRating
        });
    } catch (error) {
        next(error);
    }
};

export const deleteRatingController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const memberId = req.user._id.toString(); // Get from authenticated user

        await deleteRating(id, memberId);

        response(res, {
            success: true,
            statusCode: 200,
            message: "Rating deleted successfully",
            data: null
        });
    } catch (error) {
        next(error);
    }
};

export const getRatingsByTrainerController = async (req, res, next) => {
    try {
        const { trainerId } = req.params;
        const ratings = await getRatingsByTrainer(trainerId);

        response(res, {
            success: true,
            statusCode: 200,
            message: "Ratings fetched successfully",
            data: ratings
        });
    } catch (error) {
        next(error);
    }
};

export const getTrainerAverageRatingController = async (req, res, next) => {
    try {
        const { trainerId } = req.params;
        const result = await getTrainerAverageRating(trainerId);

        response(res, {
            success: true,
            statusCode: 200,
            message: "Average rating fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getRateableTrainersController = async (req, res, next) => {
    try {
        const memberId = req.user._id.toString(); // Get from authenticated user
        const trainers = await getRateableTrainers(memberId);

        response(res, {
            success: true,
            statusCode: 200,
            message: "Rateable trainers fetched successfully",
            data: trainers
        });
    } catch (error) {
        next(error);
    }
};

export const getTopRatingsController = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const ratings = await getTopRatings(limit);

        response(res, {
            success: true,
            statusCode: 200,
            message: "Top ratings fetched successfully",
            data: ratings
        });
    } catch (error) {
        next(error);
    }
};

