import { Router } from 'express';
import { StellarController } from '../controllers/stellarController';
import { authenticate } from '../middleware/auth';

const router = Router();
const stellarController = new StellarController();

// Public routes
router.get('/server', stellarController.getServerInfo.bind(stellarController));
router.get('/account/:publicKey', stellarController.getAccount.bind(stellarController));
router.get('/account/:publicKey/balance', stellarController.getBalance.bind(stellarController));
router.get('/account/:publicKey/payments', stellarController.getPaymentHistory.bind(stellarController));
router.get('/transaction/:hash', stellarController.getTransactionStatus.bind(stellarController));

// Protected routes (auth required)
router.post('/account', authenticate, stellarController.createAccount.bind(stellarController));
router.post('/payment', authenticate, stellarController.sendPayment.bind(stellarController));
router.post('/multi-sig', authenticate, stellarController.createMultiSigAccount.bind(stellarController));
router.post('/trustline', authenticate, stellarController.establishTrustline.bind(stellarController));
router.post('/path-payment', authenticate, stellarController.pathPayment.bind(stellarController));

export default router;
