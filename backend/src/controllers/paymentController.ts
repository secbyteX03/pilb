import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import { PaymentService } from '../services/paymentService';

const paymentService = new PaymentService();

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { amount, recipientPhone, senderPublicKey } = req.body;

    // Validate input
    if (!amount || amount < 10) {
      return res.status(400).json({ error: 'Minimum amount is 10 KES' });
    }

    if (!recipientPhone || !/^07\d{8}$/.test(recipientPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Generate verification code and hash
    const verificationCode = uuidv4().slice(0, 8).toUpperCase();
    const codeSalt = crypto.randomBytes(16).toString('hex');
    const codeHash = crypto
      .createHash('sha256')
      .update(verificationCode + codeSalt)
      .digest('hex');

    // Store payment record in database (placeholder)
    const paymentRecord = {
      id: uuidv4(),
      amount,
      recipientPhone,
      senderPublicKey,
      verificationCode,
      codeSalt,
      codeHash,
      status: 'pending_stellar',
      createdAt: new Date(),
    };

    logger.info(`Payment initiated: ${paymentRecord.id}`);

    // Return transaction data for client to sign
    res.json({
      paymentId: paymentRecord.id,
      verificationCode,
      codeHash,
      amount,
      recipientPhone,
      // This would be the actual Stellar transaction in production
      stellarTransaction: {
        destination: process.env.SERVICE_WALLET_ADDRESS,
        amount: amount.toString(),
        memo: codeHash,
      },
    });
  } catch (error) {
    logger.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In production, fetch from database
    res.json({
      id,
      status: 'pending',
      message: 'Payment status retrieved',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    // In production, fetch from database with pagination
    res.json({
      payments: [],
      total: 0,
      page: 1,
      limit: 20,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get payment history' });
  }
};