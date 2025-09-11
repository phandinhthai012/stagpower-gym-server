import express from "express";
import { authenticateToken, authorize } from "../middleware/auth";
import {
    createHealthInfoController,
    getHealthInfoByIdController,
    getHealthInfoByMemberIdController,
    getMyHealthInfoController,
    updateHealthInfoByIdController
  } from "../controllers/healthInfo.controller"
import { validateHealthProfileCreate, validateHealthProfileUpdate } from "../middleware/validations"

const router = express.Router();
// get my health info
router.get("/me",authenticateToken, getMyHealthInfoController);

// get health info by member id
router.get("/member/:memberId", getHealthInfoByMemberIdController);
// get health info by id
router.get("/:id", getHealthInfoByIdController);

// create health info
router.post("/:memberId", validateHealthProfileCreate, createHealthInfoController);
// update health info by id
router.put("/:id",authenticateToken, validateHealthProfileUpdate, updateHealthInfoByIdController);



export default router;

