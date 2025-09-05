import jwt from "jsonwebtoken";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import dotenv from "dotenv";


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            const error = new Error('Access token required');
            error.statusCode = 401;
            error.code = 'UNAUTHORIZED';
            return next(error);
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            error.code = 'UNAUTHORIZED';
            return next(error);
        }

        // check if token version is the same as the user's token version
        if (decoded.tokenVersion !== user.tokenVersion) {
            const error = new Error('Token version is not the same as the user\'s token version');
            error.statusCode = 401;
            error.code = 'UNAUTHORIZED';
            return next(error);
        }
        
        req.user = user;

        return next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            error.statusCode = 401;
            error.code = "TOKEN_EXPIRED";
        } else if (error.name === "JsonWebTokenError") {
            error.statusCode = 401;
            error.code = "INVALID_TOKEN";
        } else {
            error.statusCode = 401;
            error.code = "UNAUTHORIZED";
        }
        return next(error);
    }
}

export const verifyRefreshToken = async (req, res, next) => {
    try {
        const {refreshToken} = req.body || req.headers['refresh-token'];
        // console.log(refreshToken);
        if(!refreshToken) {
            const error = new Error("Refresh token is required");
            error.statusCode = 401;
            error.code = "UNAUTHORIZED";
            return next(error);
        }
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if(!user) {
            const error = new Error("User not found");
            error.statusCode = 401;
            error.code = "UNAUTHORIZED";
            return next(error);
        }
        if(decoded.tokenVersion !== user.tokenVersion) {
            const error = new Error("Token version is not the same as the user's token version");
            error.statusCode = 401;
            error.code = "UNAUTHORIZED";
            return next(error);
        }
        // kiểm tra refresh token có trong database không
        const storedRefreshToken = await RefreshToken.findOne({token: refreshToken});
        if(!storedRefreshToken) {
            const error = new Error("Refresh token not found");
            error.statusCode = 401;
            error.code = "UNAUTHORIZED";
            return next(error);
        }
        if(storedRefreshToken.isRevoked) {
            const error = new Error("Refresh token is revoked");
            error.statusCode = 401;
            error.code = "UNAUTHORIZED";
            return next(error);
        }
        req.user = user;
        req.refreshToken = refreshToken;
        return next();
    }catch (error) {
        if (error.name === "TokenExpiredError") {
            error.statusCode = 401;
            error.code = "TOKEN_EXPIRED";
        } else if (error.name === "JsonWebTokenError") {
            error.statusCode = 401;
            error.code = "INVALID_TOKEN";
        } else {
            error.statusCode = 401;
            error.code = "UNAUTHORIZED";
        }
        return next(error);
    }
}



// frontend:
// pseudo axios interceptor
// axios.interceptors.response.use((res) => {
//     const newToken = res.headers["x-access-token"];
//     if (newToken) {
//       tokenStore.set(newToken); // tự cài đặt theo app của bạn
//     }
//     return res;
//   });