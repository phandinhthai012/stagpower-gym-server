import express from "express";
import { validateRegister, validateLogin } from "../middleware/validations";
import { registerController,loginController,getMeController,logoutController } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth";


const router = express.Router();

router.post("/register",validateRegister, registerController);


router.post("/login",validateLogin, loginController);

router.get("/me",authenticateToken, getMeController);

router.post("/logout",authenticateToken, logoutController);

// �� POST /api/auth/forgot-password - Quên mật khẩu
// �� POST /api/auth/reset-password  - Reset mật khẩu
// 🔄 PUT  /api/auth/change-password - Đổi mật khẩu


export default router;