import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

dotenv.config();


export const register = async (data) => {
    const {
        email,
        password,
        phone,
        fullName,
        role,
        dateOfBirth,
        gender } = data;

    const existingUser = await User.findOne({email});
    if(existingUser) {
        const error = new Error("User already exists");
        error.statusCode = 409;
        error.code = "DUPLICATE_KEY";
        throw error;
    }

    const newUser = await User.create({
        email,
        password,
        phone,
        fullName,
        role,
        dateOfBirth,
        gender
    });
    return newUser;
}

export const login = async (data) => {
    const {email, password} = data;
    const user = await User.findOne({email}).select('+password');
    
    if(!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        error.code = "INVALID_CREDENTIALS";
        throw error;
    }
    const isPasswordValid = await user.correctPassword(password);
    if(!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        error.code = "INVALID_CREDENTIALS";
        throw error;
    }
    const accessToken = generateAccessToken({userId: user._id, role: user.role, tokenVersion: user.tokenVersion});
    const refreshToken = generateRefreshToken({userId: user._id, role: user.role, tokenVersion: user.tokenVersion});
    delete user.password;
    return {
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken
    }
}

export const getMe = async (userId) => {
    const user = await User.findById(userId);
    if(!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "NOT_FOUND";
        throw error;
    }
    return user;
}

export const logout = async (userId) => {
    const user = await User.findByIdAndUpdate(
        userId,
        {$inc: {tokenVersion: 1}},
        {new: true}
    );
    if(!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "NOT_FOUND";
        throw error;
    }
    return user;
}