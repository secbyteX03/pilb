import { Router } from 'express';
import { initiatePayment, confirmPayment, getPaymentStatus, getPaymentHistory, initiateCrossBorderPayment, getSupportedCurrencies, getExchangeRate, createPaymentLink, getPaymentLink, createScheduledPayment, getScheduledPayment, cancelScheduledPayment, getScheduledPayments, deleteScheduledPayment, updateScheduledPayment } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/payments/initiate - Create new payment
router.post('/initiate', initiatePayment);

// POST /api/payments/initiate-cross-border - Create new cross-border payment
router.post('/initiate-cross-border', initiateCrossBorderPayment);

// POST /api/payments/link - Create payment link
router.post('/link', createPaymentLink);

// GET /api/payments/link/:id - Get payment link
router.get('/link/:id', getPaymentLink);

// POST /api/payments/scheduled - Create scheduled payment
router.post('/scheduled', createScheduledPayment);

// GET /api/payments/scheduled/:id - Get scheduled payment
router.get('/scheduled/:id', getScheduledPayment);

// POST /api/payments/scheduled/:id/cancel - Cancel scheduled payment
router.post('/scheduled/:id/cancel', authenticate, cancelScheduledPayment);

// DELETE /api/payments/scheduled/:id - Delete scheduled payment
router.delete('/scheduled/:id', authenticate, deleteScheduledPayment);

// PUT /api/payments/scheduled/:id - Update scheduled payment
router.put('/scheduled/:id', authenticate, updateScheduledPayment);

// GET /api/payments/scheduled - Get user's scheduled payments
router.get('/scheduled', getScheduledPayments);

// POST /api/payments/confirm - Confirm Stellar transaction
router.post('/confirm', authenticate, confirmPayment);

// GET /api/payments/currencies - Get supported currencies
router.get('/currencies', getSupportedCurrencies);

// GET /api/payments/methods - Get available payment methods for currency
router.get('/methods', (_req, res) => {
  const { currency } = _req.query;
  // Return available payment methods based on currency
  // For demo, return all methods
  const methods = ['mpesa', 'card', 'stellar'];
  res.json(methods);
});

// GET /api/payments/exchange-rate - Get exchange rate
router.get('/exchange-rate', getExchangeRate);

// GET /api/payments/history - Get payment history for user
router.get('/history', getPaymentHistory);

// GET /api/payments/:id - Get payment status
router.get('/:id', getPaymentStatus);

export default router;