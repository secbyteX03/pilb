import { Router } from 'express';
import { verifyPayment } from '../controllers/verificationController';

const router = Router();

// GET /api/verify/payment - Verify a payment by code
router.get('/payment', verifyPayment);

export default router;