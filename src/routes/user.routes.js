import express from "express";
import {
    getUserByIdController,
    updateMyProfileController
} from "../controllers/user.controller";

import { authenticateToken } from "../middleware/auth";

const router = express.Router();


router.get("/:userId", getUserByIdController);

// Update user profile details like fullName, phone, gender, dateOfBirth, photo
router.put("/me/profile", authenticateToken, updateMyProfileController);






// admin update infor for member or trainer
// router.put("/:userId/profile", , updateUserProfileController);
// router.put("/:userId/member-info", , updateMemberInfoController);
// router.put("/:userId/trainer-info", , updateTrainerInfoController);

export default router;