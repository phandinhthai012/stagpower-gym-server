import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken";


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";


const createRefreshToken = async ({ userId, refreshToken }) => {
    if(!userId || !refreshToken) {
        const error = new Error("User ID and refresh token are required");
        error.statusCode = 400;
        error.code = "BAD_REQUEST";
        throw error;
    }
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const newRefreshToken = await RefreshToken.create({
        userId,
        token: refreshToken,
        expiresAt: new Date(decoded.exp * 1000)
    });
    return newRefreshToken;
}

const revokeRefreshToken = async ({ refreshToken }) => {

    if(!refreshToken) {
        const error = new Error("Refresh token is required");
        error.statusCode = 400;
        error.code = "BAD_REQUEST";
        throw error;
    }
    await RefreshToken.updateOne({ token: refreshToken }, { $set: { isRevoked: true } });
}




export { createRefreshToken, revokeRefreshToken };