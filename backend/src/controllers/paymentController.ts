import { Request, Response } from 'express';
import { CodeGenerator } from '../services/encryption/codeGenerator';
import { PaymentModel, PaymentRecord } from '../models/Payment';
import { Validators } from '../utils/validators';
import { logger } from '../utils/logger';
import { env } from '../config/environment';

/**
 * XLM to KES conversion rate (approximate)
 * In production, use a real exchange rate API
 */
const XLM_TO_KES_RATE = 25; // 1 XLM ≈ 25 KES

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { amount, recipientPhone, senderPublicKey } = req.body;

    // Validate inputs
    if (!amount || !recipientPhone || !senderPublicKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate amount
    const amountValidation = Validators.isValidAmount(amount);
    if (!amountValidation.valid) {
      return res.status(400).json({ error: amountValidation.error });
    }

    // Validate phone number
    if (!Validators.isValidPhone(recipientPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate sender public key
    if (!Validators.isValidPublicKey(senderPublicKey)) {
      return res.status(400).json({ error: 'Invalid Stellar public key' });
    }

    // Generate verification code and hash
    const verificationCode = CodeGenerator.generateCode();
    const codeSalt = CodeGenerator.generateSalt();
    const codeHash = CodeGenerator.hashCode(verificationCode, codeSalt);

    // Calculate XLM amount (approx)
    const amountXLM = (amount / XLM_TO_KES_RATE).toFixed(7);

    // Create payment record in database
    const payment = await PaymentModel.create({
      amount_KES: amount,
      amount_XLM: amountXLM,
      recipient_phone: Validators.normalizePhone(recipientPhone),
      sender_public_key: senderPublicKey,
      verification_code: verificationCode,
      code_salt: codeSalt,
      code_hash: codeHash,
      status: 'pending_stellar',
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    logger.info(`Payment initiated: ${payment.id}, Code: ${verificationCode}`);

    // Return payment details for the client to sign Stellar transaction
    res.json({
      paymentId: payment.id,
      verificationCode,
      amount,
      amountXLM,
      recipientPhone: Validators.normalizePhone(recipientPhone),
      // Transaction data for client to sign
      stellarTransaction: {
        destination: env.SERVICE_WALLET_ADDRESS,
        amount: amountXLM,
        memo: codeHash,
      },
    });
  } catch (error: any) {
    logger.error('Payment initiation error:', error.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId, stellarTxHash } = req.body;

    if (!paymentId || !stellarTxHash) {
      return res.status(400).json({ error: 'Missing payment ID or transaction hash' });
    }

    // Update payment with transaction hash
    const updated = await PaymentModel.updateStatus(paymentId, 'on_stellar', {
      stellar_tx_hash: stellarTxHash,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    logger.info(`Payment ${paymentId} confirmed on Stellar: ${stellarTxHash}`);

    res.json({
      success: true,
      status: 'on_stellar',
      stellarTxHash,
    });
  } catch (error: any) {
    logger.error('Payment confirmation error:', error.message);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Validators.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    const payment = await PaymentModel.findById(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Return status (hide sensitive data)
    res.json({
      id: payment.id,
      amount_KES: payment.amount_KES,
      status: payment.status,
      created_at: payment.created_at,
      stellar_tx_hash: payment.stellar_tx_hash,
      mpesa_tx_id: payment.mpesa_tx_id,
    });
  } catch (error: any) {
    logger.error('Get payment status error:', error.message);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const { publicKey, limit = 20, offset = 0 } = req.query;

    if (!publicKey || typeof publicKey !== 'string') {
      return res.status(400).json({ error: 'Public key is required' });
    }

    if (!Validators.isValidPublicKey(publicKey)) {
      return res.status(400).json({ error: 'Invalid public key' });
    }

    const payments = await PaymentModel.getHistory(publicKey, Number(limit), Number(offset));

    // Map to response (hide sensitive data)
    const response = payments.map((p: PaymentRecord) => ({
      id: p.id,
      amount_KES: p.amount_KES,
      recipient_phone: p.recipient_phone.slice(-4), // Only last 4 digits
      status: p.status,
      created_at: p.created_at,
    }));

    res.json({
      payments: response,
      total: response.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    logger.error('Get payment history error:', error.message);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
};