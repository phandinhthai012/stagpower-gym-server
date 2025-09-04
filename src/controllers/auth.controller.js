import { register, login, getMe, logout } from "../services/auth.service";
import response from "../utils/response";


// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public

export const registerController = async (req, res, next) => {
    try {
        const { email, password, phone, fullName, role, dateOfBirth, gender } = req.body;
        const user = await register({ email, password, phone, fullName, role, dateOfBirth, gender });
        return response(res, {
            success: true,
            statusCode: 201,
            message: "User registered successfully",
            data: user
        });
    } catch (error) {
        // only for errorHandler
        return next(error);
    }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const data = await login({ email, password });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "User logged in successfully",
            data: data
        });
    } catch (error) {
        return next(error);
    }
}

// @desc    Get me
// @route   GET /api/auth/me
// @access  Private
export const getMeController = async (req, res, next) => {
    try {
        const user = await getMe(req.user.id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "User fetched successfully",
            data: user
        });
    } catch (error) {
        return next(error);
    }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutController = async (req, res, next) => {
    try {
        const user = await logout(req.user.id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "User logged out successfully",
            data: {
                logout: true,
                message: "User logged out successfully"
            }
        });
    } catch (error) {
        return next(error);
    }
}