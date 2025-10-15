import express from "express";
import {
    createBranchController,
    getAllBranchesController,
    getPublicBranchesController,
    getBranchByIdController,
    updateBranchByIdController,
    deleteBranchByIdController,
    changeBranchStatusController

} from "../controllers/branch.controller.js"

import { authenticateToken, authorize } from "../middleware/auth.js"

const router = express.Router();

router.post("/", authenticateToken, authorize(["admin"]), createBranchController);

router.get("/", authenticateToken, authorize(["admin","staff"]),getAllBranchesController);

// Public endpoint for members to get active branches
router.get("/public", getPublicBranchesController);

router.get("/:id",authenticateToken, authorize(["admin","staff"]), getBranchByIdController);

router.put("/:id",authenticateToken, authorize(["admin","staff"]), updateBranchByIdController);

router.delete("/:id",authenticateToken, authorize(["admin"]), deleteBranchByIdController);

router.put("/:id/status",authenticateToken, authorize(["admin"]), changeBranchStatusController);

export default router;




