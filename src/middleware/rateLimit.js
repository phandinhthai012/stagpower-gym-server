import rateLimit from 'express-rate-limit';
import response from '../utils/response';

export const loginRateLimiter = rateLimit({
    windowMs: 20 * 60 * 1000, // 20 minutes
    max: 10,
    message: { error: 'Too many login attempts. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// forgot password rate limiter - Cấu hình bảo mật cao
export const forgotPasswordRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 3, // Tối đa 3 lần trong 15 phút
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
        error: 'Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 15 phút.',
        retryAfter: '15 phút'
    },
    // Tăng thời gian block nếu vi phạm nhiều lần
    skipSuccessfulRequests: true,
    // Log các request bị block - sử dụng handler thay vì onLimitReached
    handler: (req, res, next, options) => {
        console.warn(`Rate limit exceeded for forgot password: ${req.ip} at ${new Date().toISOString()}`);
        response(res, {
            success: false,
            statusCode: 429,
            message: options.message
        });
    }
});

// OTP verification rate limiter - Bảo mật cao nhất
export const otpVerificationRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 phút
    max: 5, // Tối đa 5 lần nhập OTP sai trong 10 phút
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
        error: 'Quá nhiều lần nhập OTP sai. Vui lòng thử lại sau 10 phút.',
        retryAfter: '10 phút'
    },
    skipSuccessfulRequests: true,
    handler: (req, res, next, options) => {
        console.warn(`Rate limit exceeded for OTP verification: ${req.ip} at ${new Date().toISOString()}`);
        response(res, {
            success: false,
            statusCode: 429,
            message: options.message
        });
    }
});

// General API rate limiter - Bảo vệ tổng thể
export const generalApiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 1000, // Tối đa 1000 requests trong 15 phút
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
        error: 'Quá nhiều requests. Vui lòng thử lại sau.',
        retryAfter: '15 phút'
    },
    skipSuccessfulRequests: false,
    handler: (req, res, next, options) => {
        console.warn(`Rate limit exceeded for general API: ${req.ip} at ${new Date().toISOString()}`);
        response(res, {
            success: false,
            statusCode: 429,
            message: options.message
        });
    }
});

// Registration rate limiter - Ngăn spam đăng ký
export const registrationRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 5, // Tối đa 5 lần đăng ký trong 1 giờ
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
        error: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.',
        retryAfter: '1 giờ'
    },
    skipSuccessfulRequests: true,
    handler: (req, res, next, options) => {
        console.warn(`Rate limit exceeded for registration: ${req.ip} at ${new Date().toISOString()}`);
        response(res, {
            success: false,
            statusCode: 429,
            message: options.message
        });
    }
});