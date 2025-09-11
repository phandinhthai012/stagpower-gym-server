import { body, validationResult } from 'express-validator';

// Middleware xử lý validation errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 400;
        error.code = 'VALIDATION_ERROR';
        error.details = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value
        }));
        return next(error);
    }
    next();
};

// Validation rules cho register
export const validateRegister = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),

    // password: ít nhất 6 kí tự , bao gồm ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số, có thể có kí tự đặc biệt
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/)
    // .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number, and can have special characters'),

    body('phone')
        .matches(/^(0|\+84|84)[0-9]{9}$/)
        .withMessage('Please enter a valid Vietnamese phone number'),

    body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),

    body('role')
        .optional()
        .isIn(['member', 'admin', 'trainer', 'staff'])
        .withMessage('Invalid role'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Invalid gender'),

    handleValidationErrors
];

// Validation rules cho login
export const validateLogin = [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

// Password change validation rules
export const validateChangePassword = [
    body('oldPassword')
        .notEmpty()
        .withMessage('Old password is required'),

    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),
    // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/)
    // .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number, and can have special characters'),
    handleValidationErrors
];

// Profile update validation rules for health profile, user profile


// Validation rules cho health profile

export const validateHealthProfileCreate = [
    body('height')
        .notEmpty().withMessage('Height is required')
        .isFloat({ gt: 0, lt: 300 }).withMessage('Height must be between 0 and 300 cm'),

    body('weight')
        .notEmpty().withMessage('Weight is required')
        .isFloat({ gt: 0, lt: 500 }).withMessage('Weight must be between 0 and 500 kg'),

    body('age')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Age must be between 1 and 100'),

    body('bodyFatPercent')
        .optional()
        .isFloat({ min: 0, max: 100 }).withMessage('Body fat percent must be between 0 and 100'),

    body('gender')
        .notEmpty().withMessage('Gender is required')
        .trim().toLowerCase()
        .isIn(['male', 'female']).withMessage('Gender must be male or female'),

    body('goal')
        .notEmpty().withMessage('Goal is required')
        .trim().toLowerCase(),

    body('experience')
        .notEmpty().withMessage('Experience is required')
        .trim().toLowerCase()
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Experience must be beginner, intermediate, or advanced'),

    body('fitnessLevel')
        .notEmpty().withMessage('Fitness level is required')
        .trim().toLowerCase()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Fitness level must be low, medium, or high'),

    body('preferredTime')
        .optional()
        .trim().toLowerCase()
        .isIn(['morning', 'afternoon', 'evening'])
        .withMessage('Preferred time must be morning, afternoon, or evening'),

    body('weeklySessions')
        .optional()
        .isIn(['1-2', '3-4', '5+']).withMessage('Weekly sessions must be one of: 1-2, 3-4, 5+'),

    body('medicalHistory')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Medical history must not exceed 1000 characters'),

    body('allergies')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Allergies must not exceed 1000 characters'),

    handleValidationErrors
];

export const validateHealthProfileUpdate = [
    body('height')
        .optional()
        .isFloat({ gt: 0, lt: 300 }).withMessage('Height must be between 0 and 300 cm'),

    body('weight')
        .optional()
        .isFloat({ gt: 0, lt: 500 }).withMessage('Weight must be between 0 and 500 kg'),

    body('age')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Age must be between 1 and 100'),

    body('bodyFatPercent')
        .optional()
        .isFloat({ min: 0, max: 100 }).withMessage('Body fat percent must be between 0 and 100'),

    body('gender')
        .optional()
        .trim().toLowerCase()
        .isIn(['male', 'female']).withMessage('Gender must be male or female'),

    body('goal')
        .optional()
        .trim().toLowerCase(),

    body('experience')
        .optional()
        .trim().toLowerCase()
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Experience must be beginner, intermediate, or advanced'),

    body('fitnessLevel')
        .optional()
        .trim().toLowerCase()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Fitness level must be low, medium, or high'),

    body('preferredTime')
        .optional()
        .trim().toLowerCase()
        .isIn(['morning', 'afternoon', 'evening'])
        .withMessage('Preferred time must be morning, afternoon, or evening'),

    body('weeklySessions')
        .optional()
        .isIn(['1-2', '3-4', '5+'])
        .withMessage('Weekly sessions must be one of: 1-2, 3-4, 5+'),

    body('medicalHistory')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Medical history must not exceed 1000 characters'),

    body('allergies')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Allergies must not exceed 1000 characters'),

    handleValidationErrors
];