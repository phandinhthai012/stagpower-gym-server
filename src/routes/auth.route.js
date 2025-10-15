import express from "express";
import { validateRegister, validateLogin, validateChangePassword } from "../middleware/validations";
import {
    registerController, 
    loginController,
    getMeController, 
    logoutController,
    refreshTokenController, 
    changePasswordController,
    forgotPasswordController,
    resetPasswordController,
    logoutAllDevicesController,
    verifyOtpController,
    resendOtpController
} from "../controllers/auth.controller";
import { authenticateToken, verifyRefreshToken } from "../middleware/auth";
import { loginRateLimiter, forgotPasswordRateLimiter, registrationRateLimiter, } from "../middleware/rateLimit";


const router = express.Router();

router.post("/register", registrationRateLimiter, validateRegister, registerController);

router.post("/login", loginRateLimiter, validateLogin, loginController);

router.get("/me", authenticateToken, getMeController);

router.post("/logout", verifyRefreshToken, logoutController);

router.post("/logout-all-devices", authenticateToken, logoutAllDevicesController);

router.post("/refresh", verifyRefreshToken, refreshTokenController);

router.put("/change-password", authenticateToken, validateChangePassword, changePasswordController);

router.post("/forgot-password", forgotPasswordRateLimiter, forgotPasswordController);

router.post("/verify-otp", verifyOtpController);

router.post("/resend-otp", resendOtpController);

router.post("/reset-password", resetPasswordController);



export default router;




// POST /auth/login: trả accessToken + refreshToken.
// POST /auth/refresh: nhận refresh, trả cặp mới (accessToken + refreshToken).
// POST /auth/logout: thu hồi refresh hiện tại.
// POST /auth/change-password: đổi mật khẩu + tăng tokenVersion.