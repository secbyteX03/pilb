import { Router } from 'express';
import { initiatePayment, confirmPayment, getPaymentStatus, getPaymentHistory } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/payments/initiate - Create new payment
router.post('/initiate', initiatePayment);

// POST /api/payments/confirm - Confirm Stellar transaction
router.post('/confirm', authenticate, confirmPayment);

// GET /api/payments/:id - Get payment status
router.get('/:id', getPaymentStatus);

// GET /api/payments/history - Get payment history for user
router.get('/history', getPaymentHistory);

export default router;