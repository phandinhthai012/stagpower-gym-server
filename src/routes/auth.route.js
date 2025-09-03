import express from "express";
import { validateRegister } from "../middleware/validations";
import { registerController } from "../controllers/auth.controller";


const router = express.Router();

router.post("/register",validateRegister, registerController);




export default router;