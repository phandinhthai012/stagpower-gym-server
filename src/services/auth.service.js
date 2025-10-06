
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { createRefreshToken, revokeRefreshToken, revokeAllRefreshTokens } from "./refreshToken.service.js";
import { createOtp, isExpired, compareOtp } from "../utils/otp.js";


export const register = async (data) => {
    const {
        email,
        password,
        phone,
        fullName,
        role,
        dateOfBirth,
        gender } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
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
    const { email, password } = data;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        error.code = "INVALID_CREDENTIALS";
        throw error;
    }
    const isPasswordValid = await user.correctPassword(password);
    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        error.code = "INVALID_CREDENTIALS";
        throw error;
    }
    const accessToken = generateAccessToken({ userId: user._id, role: user.role, tokenVersion: user.tokenVersion });
    const refreshToken = generateRefreshToken({ userId: user._id, role: user.role, tokenVersion: user.tokenVersion });
    delete user.password;

    // create refresh token in database
    await createRefreshToken({ userId: user._id, refreshToken: refreshToken });
    return {
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken
    };

}

export const getMe = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "NOT_FOUND";
        throw error;
    }
    return user;
}

// Không cần tăng tokenVersion cho logout single device
// Chỉ cần revoke refresh token là đủ
export const logout = async ({ refreshToken, user }) => {
    await revokeRefreshToken({ refreshToken });
    //await User.findByIdAndUpdate(user._id, {tokenVersion: user.tokenVersion + 1});
    //return user;
}

export const logoutAllDevices = async ({user }) => {
    await revokeAllRefreshTokens({userId: user._id});
    await User.findByIdAndUpdate(user._id, {$inc: {tokenVersion: 1}});
    return user;
}

export const getRefreshToken = async ({ refreshToken, user }) => {
    // console.log(refreshToken,user);
    await revokeRefreshToken({ refreshToken });
    const accessToken = generateAccessToken({ userId: user._id, role: user.role, tokenVersion: user.tokenVersion });
    const newRefreshToken = generateRefreshToken({ userId: user._id, role: user.role, tokenVersion: user.tokenVersion });
    await createRefreshToken({ userId: user._id, refreshToken: newRefreshToken });
    return {
        accessToken: accessToken,
        refreshToken: newRefreshToken
    };
}

export const changePassword = async ({ userId, oldPassword, newPassword }) => {
    const user = await User.findById(userId).select('+password');
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "NOT_FOUND";
        throw error;
    }
    const isPasswordValid = await user.correctPassword(oldPassword);
    if (!isPasswordValid) {
        const error = new Error("Invalid old password");
        error.statusCode = 401;
        error.code = "INVALID_CREDENTIALS";
        throw error;
    }
    user.password = newPassword;
    await user.save();
    // // revoke all tokens by incrementing tokenVersion and user have to login again
    // bỏ dòng này sẽ không cần login lại
    // await User.findByIdAndUpdate(userId, {$inc: {tokenVersion: 1}});
    // delete user.password;
    return user;
}

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async ({ email }) => {
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "NOT_FOUND";
        throw error;
    }
    const OTP = createOtp();
    user.otp = {
        code: OTP.code,
        expiresAt: OTP.expiresAt,
        isUsed: OTP.isUsed
    };
    await user.save();
    return {
        OTP: OTP.code, // sau sẽ remove OTP.code
        message: "OTP sent to and expires in 10 minutes"
    };
}

export const verifyOtp = async ({ email, otp }) => {
    const user = await User.findOne({ email });
    if (!user || !user.otp) {
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 404;
        error.code = "NOT_FOUND";
        throw error;
    }
    const { code, expiresAt, isUsed } = user.otp;
    if (isUsed || !code || isExpired(expiresAt)) {
        const error = new Error('Invalid or expired OTP');
        error.statusCode = 400;
        error.code = 'INVALID_OTP';
        throw error;
    }
    const isOtpValid = compareOtp(otp, code);
    if (!isOtpValid) {
        const error = new Error("Invalid OTP");
        error.statusCode = 400;
        error.code = "INVALID_OTP";
        throw error;
    }
    return { verified: true };
}

export const resetPassword = async ({email,otp, newPassword}) => {
    const user = await User.findOne({email});
    if (!user || !user.otp) {
        const error = new Error('Invalid or expired OTP');
        error.statusCode = 400; error.code = 'INVALID_OTP';
        throw error;
      }
    const { code, expiresAt, isUsed } = user.otp;
    if (isUsed || !code ) {
        const error = new Error('Invalid or expired OTP');
        error.statusCode = 400; error.code = 'INVALID_OTP';
        throw error;
    }
    if (isExpired(expiresAt)) {
        const error = new Error('Expired OTP');
        error.statusCode = 400; error.code = 'INVALID_OTP';
        throw error;
    }
    const isOtpValid = compareOtp(otp, code);
    if (!isOtpValid) {
        const error = new Error("Invalid OTP");
        error.statusCode = 400;
        error.code = "INVALID_OTP";
        throw error;
    }
    user.otp.isUsed = true;
    user.otp.expiresAt = null;
    user.password = newPassword;
    user.tokenVersion = user.tokenVersion + 1;
    await user.save();
    return { message: "Password reset successfully" };
}

