import { Request, Response } from 'express';
import { getAuthService } from '../services/auth/sep10Service';
import { logger } from '../utils/logger';

export const getChallenge = async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.query;

    if (!publicKey || typeof publicKey !== 'string') {
      return res.status(400).json({ error: 'Public key is required' });
    }

    const authService = getAuthService();
    const challenge = await authService.generateChallenge(publicKey);

    res.json(challenge);
  } catch (error: any) {
    logger.error('Challenge generation error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to generate challenge' });
  }
};

export const signChallenge = async (req: Request, res: Response) => {
  try {
    const { publicKey, signedTransaction } = req.body;

    if (!publicKey || !signedTransaction) {
      return res.status(400).json({ error: 'Public key and signed transaction are required' });
    }

    const authService = getAuthService();
    const result = await authService.authenticate(publicKey, signedTransaction);

    res.json({
      token: result.token,
      publicKey: result.publicKey,
    });
  } catch (error: any) {
    logger.error('Authentication error:', error.message);
    res.status(401).json({ error: error.message || 'Authentication failed' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const authService = getAuthService();
    const payload = authService.verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.json({ publicKey: payload.publicKey });
  } catch (error: any) {
    logger.error('Token verification error:', error.message);
    res.status(401).json({ error: 'Token verification failed' });
  }
};