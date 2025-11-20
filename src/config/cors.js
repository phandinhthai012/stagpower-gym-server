// src/config/cors.js
const getCorsOrigins = () => {

    if (process.env.CORS_ORIGIN) {
        return process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    }
    // Mặc định cho development
    return [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:3001',
        'http://localhost:8080',
        'https://localhost:5173',
        'https://localhost:3000'
    ];
};

export const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = getCorsOrigins();

        // Cho phép requests không có origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Cho phép gửi cookies/credentials
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'refreshtoken',
    ],
};

export default corsOptions;