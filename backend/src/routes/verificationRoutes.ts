import { Router } from 'express';
import { verifyPayment, verifyByTransaction } from '../controllers/verificationController';

const router = Router();

// GET /api/verify/payment - Verify by code
router.get('/payment', verifyPayment);

// GET /api/verify/transaction - Verify by Stellar transaction
router.get('/transaction', verifyByTransaction);

export default router;