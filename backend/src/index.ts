import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import paymentRoutes from './routes/paymentRoutes';
import authRoutes from './routes/authRoutes';
import verificationRoutes from './routes/verificationRoutes';
import { getPaymentProcessor } from './jobs/paymentProcessor';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'PILB Backend'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/verify', verificationRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server and payment processor
const start = async () => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    
    // Start payment processor (watch Stellar for payments)
    try {
      const processor = getPaymentProcessor();
      processor.start();
      logger.info('Payment processor started');
    } catch (error) {
      logger.warn('Could not start payment processor:', error);
    }
  });
};

start();

export default app;