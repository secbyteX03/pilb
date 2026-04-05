import { Router } from 'express';
import { EscrowController } from '../controllers/escrowController';
import { authenticate } from '../middleware/auth';

const router = Router();
const escrowController = new EscrowController();

// All routes require authentication
router.use(authenticate);

// Escrow CRUD
router.post('/', escrowController.createEscrow.bind(escrowController));
router.get('/', escrowController.getUserEscrows.bind(escrowController));
router.get('/:id', escrowController.getEscrow.bind(escrowController));

// Escrow actions
router.post('/:id/fund', escrowController.fundEscrow.bind(escrowController));
router.post('/:id/release', escrowController.releaseEscrow.bind(escrowController));
router.post('/:id/refund', escrowController.refundEscrow.bind(escrowController));

// Dispute actions
router.post('/:id/dispute', escrowController.raiseDispute.bind(escrowController));
router.post('/dispute/:disputeId/resolve', escrowController.resolveDispute.bind(escrowController));

export default router;
