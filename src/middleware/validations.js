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
        .trim()
        .isIn(['male', 'female']).withMessage('Gender must be male or female'),

    body('goal')
        .notEmpty().withMessage('Goal is required')
        .trim(),

    body('experience')
        .notEmpty().withMessage('Experience is required')
        .trim()
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Experience must be beginner, intermediate, or advanced'),

    body('fitnessLevel')
        .notEmpty().withMessage('Fitness level is required')
        .trim()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Fitness level must be low, medium, or high'),

    body('preferredTime')
        .optional()
        .trim()
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
        .trim()
        .isIn(['male', 'female']).withMessage('Gender must be male or female'),

    body('goal')
        .optional()
        .trim(),

    body('experience')
        .optional()
        .trim()
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Experience must be beginner, intermediate, or advanced'),

    body('fitnessLevel')
        .optional()
        .trim()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Fitness level must be low, medium, or high'),

    body('preferredTime')
        .optional()
        .trim()
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

// Validation rules cho package
export const validatePackageCreate = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .trim()
        .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),
    
    body('type')
        .notEmpty().withMessage('Type is required')
        .trim(),
    
    body('packageCategory')
        .notEmpty().withMessage('Package category is required')
        .trim(),
    
    body('durationMonths')
        .notEmpty().withMessage('Duration months is required')
        .isInt({ min: 1}).withMessage('Duration months must be at least 1 month'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ gte: 0 }).withMessage('Price must be greater than 0'),
    body('ptSessions')
        .optional()
        .isInt({ min: 0 }).withMessage('PT sessions must be at least 0'),
    body('ptSessionDuration')
        .optional()
        .isInt({ min: 30, max: 150 }).withMessage('PT session duration must be between 30 and 150 minutes'),
    handleValidationErrors
]

export const validatePackageUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),
    body('type')
        .optional()
        .trim(),
    body('packageCategory')
        .optional()
        .trim(),
    body('durationMonths')
        .optional()
        .isInt({ min: 1}).withMessage('Duration months must be at least 1 month'),
    body('price')
        .optional()
        .isFloat({ gte: 0 }).withMessage('Price must be greater than 0'),
    body('ptSessions')
        .optional()
        .isInt({ min: 0 }).withMessage('PT sessions must be at least 0'),
    body('ptSessionDuration')
        .optional()
        .isInt({ min: 30, max: 150 }).withMessage('PT session duration must be between 30 and 150 minutes'),
    handleValidationErrors
]

// Validation rules cho subscription
// validation rules cho payment