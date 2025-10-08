import express from "express";
import {
    createBranchController,
    getAllBranchesController,
    getBranchByIdController,
    updateBranchByIdController,
    deleteBranchByIdController,
    changeBranchStatusController

} from "../controllers/branch.controller.js"

import { authenticateToken, authorize } from "../middleware/auth.js"

const router = express.Router();

router.post("/", authenticateToken, authorize(["admin"]), createBranchController);

router.get("/", authenticateToken, authorize(["admin","staff"]),getAllBranchesController);

router.get("/:id",authenticateToken, authorize(["admin","staff"]), getBranchByIdController);

router.put("/:id",authenticateToken, authorize(["admin","staff"]), updateBranchByIdController);

router.delete("/:id",authenticateToken, authorize(["admin"]), deleteBranchByIdController);

router.put("/:id/status",authenticateToken, authorize(["admin"]), changeBranchStatusController);

export default router;




