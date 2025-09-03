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
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
        // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        // .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
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
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];