import { Request, Response } from 'express';
import { Keypair, Transaction } from '@stellar/stellar-sdk';
import { logger } from '../utils/logger';

// In production, this would use proper SEP-10 implementation
const SERVICE_KEYPAIR = Keypair.fromSecret(
  process.env.STELLAR_SECRET || 'SCZOF3VJ5UWZDOJXRW5DDTKBK3VRSF2B6ZMT7CPLQTGYZ2V6HZ6Q7B6K'
);

export const getChallenge = async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.query;

    if (!publicKey || typeof publicKey !== 'string') {
      return res.status(400).json({ error: 'Public key is required' });
    }

    // Validate Stellar address format
    try {
      Keypair.fromPublicKey(publicKey);
    } catch {
      return res.status(400).json({ error: 'Invalid Stellar public key' });
    }

    // Create a challenge transaction (simplified SEP-10)
    // In production, this would include proper time bounds and domain
    const challenge = {
      transaction: 'mock_challenge_transaction',
      networkPassphrase: process.env.STELLAR_NETWORK === 'mainnet' 
        ? 'Public Global Stellar Network ; September 2015' 
        : 'Test SDF Network ; September 2015',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    logger.info(`Challenge generated for: ${publicKey}`);

    res.json(challenge);
  } catch (error) {
    logger.error('Challenge generation error:', error);
    res.status(500).json({ error: 'Failed to generate challenge' });
  }
};

export const signChallenge = async (req: Request, res: Response) => {
  try {
    const { publicKey, signedChallenge } = req.body;

    if (!publicKey || !signedChallenge) {
      return res.status(400).json({ error: 'Public key and signed challenge are required' });
    }

    // In production, verify the signature properly
    // For now, we'll just return a mock JWT token
    
    // Create mock JWT token (in production use proper JWT library)
    const token = Buffer.from(
      JSON.stringify({
        publicKey,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })
    ).toString('base64');

    logger.info(`User authenticated: ${publicKey}`);

    res.json({
      token: `Bearer ${token}`,
      publicKey,
    });
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};