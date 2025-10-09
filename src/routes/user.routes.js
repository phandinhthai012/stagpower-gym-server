import express from "express";
import {
    getUserByIdController,
    updateMyProfileController,
    getAllMembersController,
    getAllStaffsController,
    changeStatusController,
    getAllUsersWithPaginationController,
    createMemberController,
    createTrainerController,
    createStaffController,
    createAdminController,
    updateUserController
} from "../controllers/user.controller";

import { authenticateToken, authorize } from "../middleware/auth";

const router = express.Router();

//paginated
router.get("/paginated", getAllUsersWithPaginationController);

// Specific routes should come before parameterized routes
router.get("/members", getAllMembersController);

router.get("/staffs", getAllStaffsController);

// Update user profile details like fullName, phone, gender, dateOfBirth, photo
router.put("/me/profile", authenticateToken, updateMyProfileController);

// Change user status (admin only)
router.put("/:userId/status", authenticateToken, authorize(["admin"]), changeStatusController);

// Parameterized route should come last to avoid conflicts
router.get("/:userId", getUserByIdController);
// them authenticateToken
router.put("/:userId",authenticateToken, updateUserController);

router.post("/createMember", authenticateToken, createMemberController);

router.post("/createTrainer", authenticateToken, createTrainerController);

router.post("/createStaff", authenticateToken, createStaffController);

router.post("/createAdmin", authenticateToken, createAdminController);





// admin update infor for member or trainer
// router.put("/:userId/profile", , updateUserProfileController);
// router.put("/:userId/member-info", , updateMemberInfoController);
// router.put("/:userId/trainer-info", , updateTrainerInfoController);

export default router;


// GET /api/users/paginated
// GET /api/users/role/:role/paginated