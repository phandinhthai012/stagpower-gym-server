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
    regeneratePaymentQRController,
    sendPaymentReminderController,
    bulkSendRemindersController
} from '../controllers/payment.controller.js'

import { authenticateToken, authorize } from '../middleware/auth.js';
import { validPaymentCreate } from '../middleware/validations.js';

const router = express.Router();

router.post('/', authenticateToken, createPaymentController);

router.get('/', authenticateToken, authorize(['admin', "staff"]), getAllPaymentsController);

router.get('/stats', authenticateToken, authorize(['admin', "staff"]), getPaymentStatsController);

router.get('/member/:memberId', authenticateToken, getPaymentByMemberIdController);

// payment momo method
router.post('/momo/create', momoPaymentController);
// callback momo methods không cần tạo service trên frontend
router.post('/momo/ipn', momoIpnController);

// bulk send reminders - must be before /:id routes
router.post('/bulk-reminders', authenticateToken, authorize(['admin', "staff"]), bulkSendRemindersController);

// Specific routes with /:id must be before generic /:id route
// regenerate QR code for pending payment
router.post('/:id/regenerate-qr', authenticateToken, regeneratePaymentQRController);
// complete payment
router.post('/:id/complete', authenticateToken, authorize(['admin', "staff"]), completePaymentController);
// send payment reminder
router.post('/:id/reminder', authenticateToken, authorize(['admin', "staff"]), sendPaymentReminderController);

// Generic /:id routes - must be last
router.get('/:id',authenticateToken, getPaymentByIdController);
router.put('/:id', authenticateToken, authorize(['admin', "staff"]), updatePaymentController);
router.delete('/:id', authenticateToken, authorize(['admin']), deletePaymentController);

export default router;



// GET /api/payments/paginated
// GET /api/payments/member/:memberId/paginated