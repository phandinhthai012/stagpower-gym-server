import express from "express";
import { authenticateToken, authorize } from "../middleware/auth";
import {
    createHealthInfoController,
    getHealthInfoByIdController,
    getHealthInfoByMemberIdController,
    getMyHealthInfoController,
    updateHealthInfoByIdController,
    getAllHealthInfoController,
    deleteHealthInfoByIdController
  } from "../controllers/healthInfo.controller"
import { validateHealthProfileCreate, validateHealthProfileUpdate } from "../middleware/validations"

const router = express.Router();

// get all health info
router.get("/",authenticateToken, authorize("admin", "trainer","staff"), getAllHealthInfoController);

// get my health info
router.get("/me",authenticateToken, getMyHealthInfoController);

// get health info by member id ==> admin and trainer and staff
router.get("/member/:memberId", getHealthInfoByMemberIdController);
// get health info by id
router.get("/:id",authenticateToken, getHealthInfoByIdController);
// create health info
router.post("/:memberId", validateHealthProfileCreate, createHealthInfoController);
// update health info by id
router.put("/:id",authenticateToken, validateHealthProfileUpdate, updateHealthInfoByIdController);
// delete health info by id
router.delete("/:id",authenticateToken, authorize("admin", "trainer"),deleteHealthInfoByIdController);



export default router;

