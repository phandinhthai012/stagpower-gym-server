import express from "express";
import {
    getAllDiscountsController,
    createDiscountController,
    getDiscountByIdController,
    updateDiscountByIdController,
    changeDiscountStatusController,
    deleteDiscountByIdController,
    getAvailableDiscountsController,
    applyDiscountManualController,
    validateDiscountCodeController
} from "../controllers/discount.controller.js"
import {authenticateToken, authorize} from "../middleware/auth.js"

const router = express.Router();

router.get("/",getAllDiscountsController);

router.post("/",authenticateToken,authorize(["admin","staff"]),createDiscountController);

// // Cho Member
router.post('/validate-code', authenticateToken, validateDiscountCodeController);

// // Cho Admin
router.get('/available', authenticateToken, authorize(['admin', 'staff']), getAvailableDiscountsController);
router.post('/apply-manual', authenticateToken, authorize(['admin', 'staff']), applyDiscountManualController);

router.get("/:id",getDiscountByIdController);

router.put("/:id",authenticateToken,authorize(["admin","staff"]),updateDiscountByIdController);

router.put("/:id/status",authenticateToken,authorize(["admin","staff"]),changeDiscountStatusController);

router.delete("/:id",authenticateToken,authorize(["admin"]),deleteDiscountByIdController);

export default router;