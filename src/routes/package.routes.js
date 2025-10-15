import express from "express";
import {
    createPackageController,
    getAllPackagesController,
    getPackageByIdController,
    updatePackageByIdController,
    deletePackageByIdController,
    changePackageStatusController,
    getAllPackagesWithPaginationController
} from "../controllers/package.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";
import { validatePackageCreate, validatePackageUpdate } from "../middleware/validations.js";

const router = express.Router();


// // Lấy danh sách gói tập với phân trang
router.get("/paginated", getAllPackagesWithPaginationController);

// Tạo mới gói tập
router.post("/",validatePackageCreate, createPackageController);

// // Lấy danh sách tất cả gói tập
router.get("/", getAllPackagesController);

// // Lấy thông tin chi tiết gói tập theo ID
router.get("/:id", getPackageByIdController);

// // Cập nhật gói tập theo ID
router.put("/:id",authenticateToken, authorize(['admin', 'trainer','staff']), validatePackageUpdate, updatePackageByIdController);

// // Thay đổi trạng thái gói tập theo ID
router.put("/:id/status",authenticateToken, authorize(['admin','staff']), changePackageStatusController);


// // Xóa gói tập theo ID
router.delete("/:id",authenticateToken, authorize(['admin','staff']), deletePackageByIdController);

export default router;
