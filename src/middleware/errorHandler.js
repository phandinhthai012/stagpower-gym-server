const errorHandler = (err, req, res, next) => {
    
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'INTERNAL_ERROR';
    let details = err.details || null;

    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found';
        code = 'RESOURCE_NOT_FOUND';
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
        code = 'DUPLICATE_KEY';
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        code = 'VALIDATION_ERROR';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        code = 'JWT_INVALID';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        code = 'JWT_EXPIRED';
    }

    // Response với format nhất quán
    res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        data: null,
        code: code,
        message: message,
        ...(details ? { details } : {}),
        // stack: err.stack || undefined,
        timestamp: new Date().toISOString()
    });
}

export default errorHandler;