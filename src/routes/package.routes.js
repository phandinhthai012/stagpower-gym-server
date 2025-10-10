import express from "express";
import {
    createPackageController,
    getAllPackagesController,
    getPackageByIdController,
    updatePackageByIdController,
    deletePackageByIdController
} from "../controllers/package.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";
import { validatePackageCreate, validatePackageUpdate } from "../middleware/validations.js";

const router = express.Router();

// Tạo mới gói tập
router.post("/",validatePackageCreate, createPackageController);

// // Lấy danh sách tất cả gói tập
router.get("/",authenticateToken, authorize(['admin', 'trainer','staff','member']), getAllPackagesController);

// // Lấy thông tin chi tiết gói tập theo ID
router.get("/:id", getPackageByIdController);

// // Cập nhật gói tập theo ID
router.put("/:id",authenticateToken, authorize(['admin', 'trainer','staff']), validatePackageUpdate, updatePackageByIdController);

// // Xóa gói tập theo ID
router.delete("/:id", deletePackageByIdController);

export default router;
