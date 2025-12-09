import express from 'express';
import {
    getAllDiscountTypesController,
    createDiscountTypeController,
    getDiscountTypeByIdController,
    updateDiscountTypeController,
    deleteDiscountTypeController
} from '../controllers/discountType.controller.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllDiscountTypesController);
router.post('/', authenticateToken, authorize(['admin']), createDiscountTypeController);
router.get('/:id', getDiscountTypeByIdController);
router.put('/:id', authenticateToken, authorize(['admin']), updateDiscountTypeController);
router.delete('/:id', authenticateToken, authorize(['admin']), deleteDiscountTypeController);

export default router;