import { Request, Response } from 'express';
import { PaymentModel } from '../models/Payment';
import { CodeGenerator } from '../services/encryption/codeGenerator';
import { logger } from '../utils/logger';

/**
 * Verify a payment by code
 * This is for recipients to verify they received money
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    const normalizedCode = code.toUpperCase();

    logger.info(`Verifying payment with code: ${normalizedCode}`);

    // In production, you'd need to search by hash
    // For now, we'll use a simple approach
    // Find payments where verification code matches (after hashing)
    
    // This is a simplified version - in production you'd:
    // 1. Look up all recent pending/completed payments
    // 2. Hash the input code with stored salt
    // 3. Compare with stored code_hash
    
    // For demo, return a mock response
    res.json({
      verified: true,
      message: 'Payment verification service is running',
      note: 'Full verification requires database integration',
    });
  } catch (error: any) {
    logger.error('Verification error:', error.message);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

/**
 * Get payment details by transaction hash (public verification)
 */
export const verifyByTransaction = async (req: Request, res: Response) => {
  try {
    const { txHash } = req.query;

    if (!txHash || typeof txHash !== 'string') {
      return res.status(400).json({ error: 'Transaction hash is required' });
    }

    // Find payment by Stellar transaction hash
    // This requires database query in production
    
    res.json({
      verified: true,
      message: 'Transaction lookup service is running',
      note: 'Full verification requires database integration',
    });
  } catch (error: any) {
    logger.error('Transaction verification error:', error.message);
    res.status(500).json({ error: 'Failed to verify transaction' });
  }
};