import { Router, Request, Response } from 'express';
import { initiatePayment, getPaymentStatus, getPaymentHistory } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/payments/initiate - Initiate a new payment
router.post('/initiate', authenticate, initiatePayment);

// GET /api/payments/:id - Get payment status
router.get('/:id', authenticate, getPaymentStatus);

// GET /api/payments/history - Get payment history
router.get('/history', authenticate, getPaymentHistory);

export default router;