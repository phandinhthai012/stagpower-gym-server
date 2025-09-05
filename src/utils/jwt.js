import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";


const generateAccessToken = ({ userId, role, tokenVersion }) => {
    const accessToken = jwt.sign({
        userId: userId,
        role: role,
        tokenVersion: tokenVersion
    }, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
    return accessToken;
}
const generateRefreshToken = ({ userId, role, tokenVersion }) => {
    const refreshToken = jwt.sign({
        userId: userId,
        role: role,
        tokenVersion: tokenVersion
    }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    return refreshToken;
}


export { generateAccessToken, generateRefreshToken };