import express from 'express';
import {
    createPaymentController,
    getAllPaymentsController,
    getPaymentByIdController,
    updatePaymentController,
    deletePaymentController,
    getPaymentByMemberIdController,
    momoIpnController,
    momoPaymentController,
    completePaymentController,
    getPaymentStatsController,
    regeneratePaymentQRController
} from '../controllers/payment.controller.js'

import { authenticateToken, authorize } from '../middleware/auth.js';
import { validPaymentCreate } from '../middleware/validations.js';

const router = express.Router();

router.post('/', authenticateToken, createPaymentController);

router.get('/', authenticateToken, authorize(['admin', "staff"]), getAllPaymentsController);

router.get('/stats', authenticateToken, authorize(['admin', "staff"]), getPaymentStatsController);

router.get('/:id',authenticateToken, getPaymentByIdController);

router.put('/:id', authenticateToken, authorize(['admin', "staff"]), updatePaymentController);

router.delete('/:id', authenticateToken, authorize(['admin']), deletePaymentController);

router.get('/member/:memberId', authenticateToken, getPaymentByMemberIdController);


// payment momo method
router.post('/momo/create', momoPaymentController);
// callback momo methods không cần tạo service trên frontend
router.post('/momo/ipn', momoIpnController);
// regenerate QR code for pending payment
router.post('/:id/regenerate-qr', authenticateToken, regeneratePaymentQRController);
// complete payment
router.post('/:id/complete', authenticateToken, authorize(['admin', "staff"]), completePaymentController);


export default router;



// GET /api/payments/paginated
// GET /api/payments/member/:memberId/paginated