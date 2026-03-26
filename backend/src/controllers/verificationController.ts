import { Request, Response } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

// Mock database of payments - in production, fetch from actual database
const mockPayments: Map<string, any> = new Map();

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    const normalizedCode = code.toUpperCase();

    // In production, look up payment by code hash
    // For now, simulate verification
    logger.info(`Verifying payment with code: ${normalizedCode}`);

    // Mock verification - in production this would check the database
    // and query Stellar blockchain for the actual transaction
    
    // Check if code exists in mock database
    const payment = mockPayments.get(normalizedCode);

    if (payment) {
      res.json({
        verified: true,
        amount: payment.amount,
        timestamp: payment.timestamp,
        transactionHash: payment.stellarTxHash,
        recipientPhone: payment.recipientPhone,
      });
    } else {
      // For demo purposes, return a mock successful verification
      // In production, this would return 404
      res.json({
        verified: true,
        amount: '500',
        timestamp: new Date().toISOString(),
        transactionHash: 'mock_stellar_tx_hash_' + normalizedCode,
      });
    }
  } catch (error) {
    logger.error('Verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

// Helper function to add mock payments (for testing)
export const addMockPayment = (code: string, payment: any) => {
  mockPayments.set(code.toUpperCase(), payment);
};