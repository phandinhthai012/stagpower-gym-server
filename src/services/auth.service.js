import dotenv from "dotenv";
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { createRefreshToken, revokeRefreshToken } from "./refreshToken.service.js";

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

    // create refresh token in database
    await createRefreshToken({userId: user._id, refreshToken: refreshToken});
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

export const logout = async ({ refreshToken, user }) => {
    await revokeRefreshToken({refreshToken});
    //await User.findByIdAndUpdate(user._id, {tokenVersion: user.tokenVersion + 1});
    //return user;
}

// export const logoutAll = async ({ refreshToken, user }) => {
//     await revokeRefreshToken({refreshToken});
//     await User.findByIdAndUpdate(user._id, {$inc: {tokenVersion: 1}});
//     return user;
// }

export const getRefreshToken = async ({ refreshToken,user }) => {
    // console.log(refreshToken,user);
    await revokeRefreshToken({refreshToken});
    const accessToken = generateAccessToken({userId: user._id, role: user.role, tokenVersion: user.tokenVersion});
    const newRefreshToken = generateRefreshToken({userId: user._id, role: user.role, tokenVersion: user.tokenVersion});
    await createRefreshToken({userId: user._id, refreshToken: newRefreshToken});
    return {
        accessToken: accessToken,
        refreshToken: newRefreshToken
    }
}