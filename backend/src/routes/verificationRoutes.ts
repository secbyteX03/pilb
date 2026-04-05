import { Router } from 'express';
import { VerificationController } from '../controllers/verificationController';
import { authenticate } from '../middleware/auth';

const router = Router();
const verificationController = new VerificationController();

// Public routes (no auth required)
router.get('/:id', verificationController.getVerificationStatus.bind(verificationController));
router.post('/:id/verify', verificationController.verifyPayment.bind(verificationController));
router.post('/scan', verificationController.scanQRCode.bind(verificationController));

// Protected routes (auth required)
router.post('/', authenticate, verificationController.createVerification.bind(verificationController));
router.post('/link', authenticate, verificationController.generatePaymentLink.bind(verificationController));
router.post('/in-store', authenticate, verificationController.createInStoreQRCode.bind(verificationController));
router.get('/merchant/all', authenticate, verificationController.getMerchantVerifications.bind(verificationController));

export default router;
