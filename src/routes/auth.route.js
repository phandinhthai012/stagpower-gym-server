import express from "express";
import { validateRegister, validateLogin } from "../middleware/validations";
import { registerController, loginController, getMeController, logoutController, refreshTokenController } from "../controllers/auth.controller";
import { authenticateToken, verifyRefreshToken } from "../middleware/auth";


const router = express.Router();

router.post("/register", validateRegister, registerController);


router.post("/login", validateLogin, loginController);

router.get("/me", authenticateToken, getMeController);

router.post("/logout", verifyRefreshToken, logoutController);


router.post("/refresh", verifyRefreshToken, refreshTokenController);

// �� POST /api/auth/forgot-password - Quên mật khẩu
// �� POST /api/auth/reset-password  - Reset mật khẩu
// 🔄 PUT  /api/auth/change-password - Đổi mật khẩu


export default router;




// POST /auth/login: trả accessToken + refreshToken.
// POST /auth/refresh: nhận refresh, trả cặp mới (accessToken + refreshToken).
// POST /auth/logout: thu hồi refresh hiện tại.
// POST /auth/change-password: đổi mật khẩu + tăng tokenVersion.