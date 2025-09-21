import Exercise from "../models/Exercise.js";

export const createExercise = async (exerciseData) => {
    const exercise = await Exercise.create(exerciseData);
    return exercise;
};

export const getAllExercises = async () => {
    const exercises = await Exercise.find();
    return exercises;
};

export const getExerciseById = async (id) => {
    const exercise = await Exercise.findById(id);
    if (!exercise) {
        const error = new Error("Exercise not found");
        error.statusCode = 404;
        error.code = "EXERCISE_NOT_FOUND";
        throw error;
    }
    return exercise;
};

export const updateExerciseById = async (id, exerciseData) => {
    const exercise = await Exercise.findByIdAndUpdate(id, exerciseData, { new: true, runValidators: true });
    if (!exercise) {
        const error = new Error("Exercise not found");
        error.statusCode = 404;
        error.code = "EXERCISE_NOT_FOUND";
        throw error;
    }
    return exercise;
};

export const deleteExerciseById = async (id) => {
    const exercise = await Exercise.findByIdAndDelete(id);
    if (!exercise) {
        const error = new Error("Exercise not found");
        error.statusCode = 404;
        error.code = "EXERCISE_NOT_FOUND";
        throw error;
    }
    return exercise;
};

export const searchExercises = async (keyword) => {
    const exercises = await Exercise.find({
      $or: [
        { name: new RegExp(keyword, "i") },
        { description: new RegExp(keyword, "i") }
      ]
    });
    return exercises;
};


export const getExercisesByLevel = async (level) => {
    const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
    if (!level || !validLevels.includes(level)) {
        const error = new Error("Invalid difficulty level");
        error.statusCode = 400;
        error.code = "INVALID_DIFFICULTY_LEVEL";
        throw error;
    }
    
    const exercises = await Exercise.find({ difficultyLevel: level, isActive: true });
    return exercises;
};
