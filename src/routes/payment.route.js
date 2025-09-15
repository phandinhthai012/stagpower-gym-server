import express from 'express';
import {
    createPaymentController,
    getAllPaymentsController,
    getPaymentByIdController,
    updatePaymentController,
    deletePaymentController,
    getPaymentByMemberIdController
} from '../controllers/payment.controller.js'

import {authenticateToken,authorize} from '../middleware/auth.js';

const router = express.Router();

router.post('/', createPaymentController);

router.get('/', getAllPaymentsController);

router.get('/:id', getPaymentByIdController);

router.put('/:id', updatePaymentController);

router.delete('/:id',authenticateToken,authorize(['admin']), deletePaymentController);

router.get('/member/:memberId', getPaymentByMemberIdController);

export default router;


