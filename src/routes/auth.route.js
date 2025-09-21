import express from "express";
import { validateRegister, validateLogin, validateChangePassword } from "../middleware/validations";
import {
    registerController, loginController,
    getMeController, logoutController,
    refreshTokenController, changePasswordController,
    forgotPasswordController,
    resetPasswordController,
    logoutAllDevicesController,
} from "../controllers/auth.controller";
import { authenticateToken, verifyRefreshToken } from "../middleware/auth";


const router = express.Router();

router.post("/register", validateRegister, registerController);


router.post("/login", validateLogin, loginController);

router.get("/me", authenticateToken, getMeController);

router.post("/logout", verifyRefreshToken, logoutController);

router.post("/logout-all-devices", authenticateToken, logoutAllDevicesController);

router.post("/refresh", verifyRefreshToken, refreshTokenController);

router.put("/change-password", authenticateToken, validateChangePassword, changePasswordController);

router.post("/forgot-password", forgotPasswordController);

router.post("/reset-password", resetPasswordController);    

// �� POST /api/auth/forgot-password - Quên mật khẩu
// �� POST /api/auth/reset-password  - Reset mật khẩu



export default router;




// POST /auth/login: trả accessToken + refreshToken.
// POST /auth/refresh: nhận refresh, trả cặp mới (accessToken + refreshToken).
// POST /auth/logout: thu hồi refresh hiện tại.
// POST /auth/change-password: đổi mật khẩu + tăng tokenVersion.