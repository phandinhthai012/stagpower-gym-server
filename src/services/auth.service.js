
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { createRefreshToken, revokeRefreshToken, revokeAllRefreshTokens } from "./refreshToken.service.js";
import { createOtp, isExpired, compareOtp } from "../utils/otp.js";
import { sendOtpEmail,sendWelcomeEmail } from "../utils/emailHelper.js";


export const register = async (data) => {
    const {
        email,
        password,
        phone,
        fullName,
        role,
        dateOfBirth,
        gender } = data;

    // Check for existing user by email or phone
    const existingUser = await User.findOne({ 
        $or: [
            { email: email?.toLowerCase()?.trim() },
            { phone: phone?.trim() }
        ]
    });
    
    if (existingUser) {
        const error = new Error(
            existingUser.email === email?.toLowerCase()?.trim() 
                ? "Email already exists" 
                : "Phone number already exists"
        );
        error.statusCode = 409;
        error.code = "DUPLICATE_KEY";
        throw error;
    }

    try {
        const userRole = role || 'member';
        const userData = {
            email: email?.toLowerCase()?.trim(),
            password,
            phone: phone?.trim(),
            fullName,
            role: userRole,
            dateOfBirth,
            gender
        };

        // Initialize memberInfo for members
        if (userRole === 'member') {
            userData.memberInfo = {
                membership_level: 'basic',
                is_student: false,
                total_spending: 0,
                membership_month: 0
            };
        }

        const newUser = await User.create(userData);
        
        if (newUser) {
            try {
                await sendWelcomeEmail({ 
                    to: email, 
                    data: { 
                        userEmail: email, 
                        userName: fullName, 
                        uid: newUser.uid, 
                        joinDate: newUser.joinDate, 
                        packageName: 'None' 
                    } 
                });
            } catch (emailError) {
                // Log email error but don't fail registration
                console.error('Failed to send welcome email:', emailError);
            }
        }

        return newUser;
    } catch (error) {
        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue || {})[0];
            const fieldMessage = field === 'email' 
                ? 'Email already exists' 
                : field === 'phone'
                ? 'Phone number already exists'
                : field === 'uid'
                ? 'UID already exists. Please try again.'
                : `${field} already exists`;
            
            const dbError = new Error(fieldMessage);
            dbError.statusCode = 409;
            dbError.code = 'DUPLICATE_KEY';
            throw dbError;
        }
        throw error;
    }
}

export const login = async (data) => {
    const { email, password } = data;
    
    if (!email || !password) {
        const error = new Error("Email and password are required");
        error.statusCode = 400;
        error.code = "MISSING_CREDENTIALS";
        throw error;
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        error.code = "INVALID_CREDENTIALS";
        throw error;
    }

    // Check if user account is active
    if (user.status === 'banned' || user.status === 'inactive') {
        const error = new Error("Your account has been " + (user.status === 'banned' ? 'banned' : 'deactivated'));
        error.statusCode = 403;
        error.code = "ACCOUNT_DISABLED";
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
    const user = await User.findById(userId)
        .populate('adminInfo.branchId', 'name address status phone email openTime closeTime')
        .populate('staffInfo.brand_id', 'name address status phone email openTime closeTime');
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
        isUsed: OTP.isUsed,
        isVerified: OTP.isVerified
    };
    await user.save();
    // send email
    await sendOtpEmail({ to: email, data: { userEmail: email, otpCode: OTP.code } });
    return {
        email: email,
        userUid: user._id,
        userName: user.fullName,
        message: "OTP sent to and expires in 10 minutes"
    };
}

export const verifyOtp = async ({ email, otp }) => {
    const user = await User.findOne({ email });
    if (!user || !user.otp) {
        const error = new Error("Email is not found");
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
    
    // Đánh dấu OTP đã được verify (nhưng chưa sử dụng)
    user.otp.isVerified = true;
    await user.save();
    
    return { 
        email: email,
        userUid: user._id,
        userName: user.fullName,
        message: "OTP verified successfully"
    };
}


export const resendOtp = async ({email}) => {
    const user = await User.findOne({email});
    if (!user) {
        const error = new Error("Email is not found");
        error.statusCode = 404;
        error.code = "NOT_FOUND";
        throw error;
    }
    const OTP = createOtp();
    user.otp = {
        code: OTP.code,
        expiresAt: OTP.expiresAt,
        isUsed: OTP.isUsed,
        isVerified: OTP.isVerified
    };
    await user.save();
    await sendOtpEmail({ to: email, data: { userEmail: email, otpCode: OTP.code } });
    return {
        email: email,
        message: "OTP resent successfully"
    };
}


export const resetPassword = async ({email, newPassword}) => {
    // 1. Tìm user và kiểm tra OTP đã được verify
    const user = await User.findOne({ email });
    if (!user || !user.otp) {
        const error = new Error('User not found or OTP not found');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
    }
    
    // 2. Kiểm tra OTP đã được verify chưa
    if (!user.otp.isVerified) {
        const error = new Error('OTP must be verified first');
        error.statusCode = 400;
        error.code = 'OTP_NOT_VERIFIED';
        throw error;
    }
    
    // 3. Kiểm tra OTP chưa được sử dụng
    if (user.otp.isUsed) {
        const error = new Error('OTP already used');
        error.statusCode = 400;
        error.code = 'OTP_ALREADY_USED';
        throw error;
    }
    
    // 4. Cập nhật password và đánh dấu OTP đã sử dụng
    user.otp.isUsed = true;
    user.otp.expiresAt = null;
    user.password = newPassword;
    user.tokenVersion = user.tokenVersion + 1;
    await user.save();
    
    return { message: "Password reset successfully" };
}

