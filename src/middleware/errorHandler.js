const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    // Log error với thông tin chi tiết
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        error = { message, statusCode: 409 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { message, statusCode: 400 };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { message, statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { message, statusCode: 401 };
    }

    // Rate limiting errors
    if (err.status === 429) {
        const message = 'Too many requests';
        error = { message, statusCode: 429 };
    }

    // File upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'File too large';
        error = { message, statusCode: 400 };
    }

    // Response với format nhất quán
    res.status(error.statusCode || 500).json({
        success: false,
        statusCode: error.statusCode || 500,
        data: null,
        message: error.message || 'Internal Server Error',
        stack: error.stack || undefined,
        timestamp: new Date().toISOString()
    });
}

export default errorHandler;