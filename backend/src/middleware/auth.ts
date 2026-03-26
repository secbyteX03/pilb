import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    publicKey: string;
    address: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // In production, this would validate the JWT token from SEP-10
  // For now, we'll check for a simple auth header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // Validate token and set user
  // This is a placeholder - implement actual SEP-10 token validation
  try {
    // In production: verify JWT token
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    req.user = {
      publicKey: payload.publicKey,
      address: payload.publicKey,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};