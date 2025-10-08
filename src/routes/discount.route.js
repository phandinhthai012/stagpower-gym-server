import express from "express";
import {
    getAllDiscountsController,
    createDiscountController,
    getDiscountByIdController,
    updateDiscountByIdController,
    changeDiscountStatusController,
    deleteDiscountByIdController
} from "../controllers/discount.controller.js"
import {authenticateToken, authorize} from "../middleware/auth.js"

const router = express.Router();

router.get("/",authenticateToken,getAllDiscountsController);

router.post("/",authenticateToken,authorize(["admin","staff"]),createDiscountController);

router.get("/:id",getDiscountByIdController);

router.put("/:id",authenticateToken,authorize(["admin","staff"]),updateDiscountByIdController);

router.put("/:id/status",authenticateToken,authorize(["admin","staff"]),changeDiscountStatusController);

router.delete("/:id",authenticateToken,authorize(["admin"]),deleteDiscountByIdController);

export default router;