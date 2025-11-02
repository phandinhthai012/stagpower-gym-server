import express from "express";
import { authenticateToken, authorize } from "../middleware/auth";
import upload from "../middleware/upload";
import {
  createHealthInfoController,
  getHealthInfoByIdController,
  getHealthInfoByMemberIdController,
  getMyHealthInfoController,
  updateHealthInfoByIdController,
  getAllHealthInfoController,
  deleteHealthInfoByIdController,
  parseHealthDataPreview,
  getHealthInfoHistoryByMemberIdController,
  getLatestHealthInfoByMemberIdController
} from "../controllers/healthInfo.controller"
import { validateHealthProfileCreate, validateHealthProfileUpdate } from "../middleware/validations"

const router = express.Router();


router.post("/parse-preview",upload.single('healthFile'),parseHealthDataPreview
  // authenticateToken,
  // authorize("admin", "trainer", "staff"),
);

// get all health info
router.get("/", authenticateToken, authorize("admin", "trainer", "staff"), getAllHealthInfoController);

// get my health info
router.get("/me", authenticateToken, getMyHealthInfoController);

// get health info by member id ==> admin and trainer and staff
router.get("/member/:memberId", getHealthInfoByMemberIdController);
// get health info history by member id
router.get("/member/:memberId/history", getHealthInfoHistoryByMemberIdController);
// get latest health info by member id
router.get("/member/:memberId/latest", getLatestHealthInfoByMemberIdController);
// get health info by id
router.get("/:id", authenticateToken, getHealthInfoByIdController);
// create health info
router.post("/:memberId", validateHealthProfileCreate, createHealthInfoController);
// update health info by id
router.put("/:id", authenticateToken, validateHealthProfileUpdate, updateHealthInfoByIdController);
// delete health info by id
router.delete("/:id", authenticateToken, authorize("admin", "trainer"), deleteHealthInfoByIdController);



export default router;

