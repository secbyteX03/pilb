import { Request, Response, NextFunction } from 'express';
import { getAuthService } from '../services/auth/sep10Service';

export interface AuthRequest extends Request {
  user?: {
    publicKey: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    const authService = getAuthService();
    const payload = authService.verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request
    req.user = {
      publicKey: payload.publicKey,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};