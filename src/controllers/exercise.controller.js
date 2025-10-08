import {
    createExercise,
    getAllExercises,
    getExerciseById,
    updateExerciseById,
    deleteExerciseById,
    searchExercises,
    getExercisesByLevel
} from "../services/exercise.service.js";
import response from "../utils/response.js";

export const createExerciseController = async (req, res, next) => {
    try {
        const {
            name,
            description,
            instructions,
            tips,
            category,
            difficultyLevel,
            targetMuscles,
            duration,
            equipment,
            level,
            muscleGroup,
            sets,
            reps,
            weight,
            restTime,
            isActive
        } = req.body;
        const exercise = await createExercise({
            name,
            description,
            instructions,
            tips,
            category,
            difficultyLevel,
            targetMuscles,
            duration,
            equipment,
            level,
            muscleGroup,
            sets,
            reps,
            weight,
            restTime,
            isActive
        });
        return response(res, {
            success: true,
            statusCode: 201,
            message: "Exercise created successfully",
            data: exercise
        });
    } catch (error) {
        next(error);
    }
}

export const getAllExercisesController = async (req, res, next) => {
    try {
        const exercises = await getAllExercises();
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Exercises fetched successfully",
            data: exercises
        });
    } catch (error) {
        next(error);
    }
}

export const getExerciseByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const exercise = await getExerciseById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Exercise fetched successfully",
            data: exercise
        });
    } catch (error) {
        next(error);
    }
}

export const updateExerciseByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            instructions,
            tips,
            category,
            difficultyLevel,
            targetMuscles,
            duration,
            equipment,
            level,
            muscleGroup,
            sets,
            reps,
            weight,
            restTime,
            isActive
        } = req.body;
        const exercise = await updateExerciseById(id, {
            name,
            description,
            instructions,
            tips,
            category,
            difficultyLevel,
            targetMuscles,
            duration,
            equipment,
            level,
            muscleGroup,
            sets,
            reps,
            weight,
            restTime,
            isActive
        });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Exercise updated successfully",
            data: exercise
        });
    } catch (error) {
        next(error);
    }
}

export const deleteExerciseByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const exercise = await deleteExerciseById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Exercise deleted successfully",
            data: {
                id: exercise._id,
                message: "Exercise deleted successfully"
            }
        });
    } catch (error) {
        next(error);
    }
}

export const searchExercisesController = async (req, res, next) => {
    try {
        const { q } = req.query;
        console.log("đasadas",q);
        const exercises = await searchExercises(q);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Exercises fetched successfully",
            data: exercises
        });
    } catch (error) {
        next(error);
    }
}

export const getExercisesByLevelController = async (req, res, next) => {
    try {
        const { level } = req.query;
        const exercises = await getExercisesByLevel(level);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Exercises fetched successfully",
            data: exercises
        });
    } catch (error) {
        next(error);
    }
}