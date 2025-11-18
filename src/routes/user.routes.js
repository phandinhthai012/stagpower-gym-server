import express from "express";
import {
    getAllUsersController,
    getUserByIdController,
    updateUserProfileController,
    getAllMembersController,
    getAllStaffsController,
    changeStatusController,
    getAllUsersWithPaginationController,
    getAllMembersWithPaginationController,
    getallStaffsWithPaginationController,
    createUserController,
    getMembersWithActiveSubscriptionsController,
    getMembersWithActivePTSubscriptionsController,
    getAllAdminsController,
    getAdminsWithoutBranchController
} from "../controllers/user.controller";

import { authenticateToken, authorize } from "../middleware/auth";

const router = express.Router();

router.get("/",authenticateToken, getAllUsersController);

//paginated
router.get("/paginated",authenticateToken, getAllUsersWithPaginationController);

router.get("/members/paginated",authenticateToken, getAllMembersWithPaginationController);

router.get("/staffs/paginated",authenticateToken, getallStaffsWithPaginationController);

router.get("/members/active-subscriptions", authenticateToken, getMembersWithActiveSubscriptionsController);

router.get("/members/active-pt-subscriptions", authenticateToken, getMembersWithActivePTSubscriptionsController);

router.get("/admins", authenticateToken, authorize(["admin"]), getAllAdminsController);

router.get("/admins/without-branch", authenticateToken, authorize(["admin"]), getAdminsWithoutBranchController);

// Specific routes should come before parameterized routes
router.get("/members",authenticateToken, getAllMembersController);
// include  trainer, staff, admin
router.get("/staffs",authenticateToken, getAllStaffsController);

// create user
// authenticateToken
router.post("/create",authenticateToken,authorize(["admin","staff"]), createUserController);
// 
router.put("/:userId/profile",authenticateToken, updateUserProfileController);

// Change user status (admin only)
router.put("/:userId/status",authenticateToken,authorize(["admin","staff"]), changeStatusController);

// Parameterized route should come last to avoid conflicts
router.get("/:userId", getUserByIdController);




export default router;

