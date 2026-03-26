import { Response } from 'express';

export const healthCheck = (req: any, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PILB Backend',
    version: '1.0.0',
  });
};