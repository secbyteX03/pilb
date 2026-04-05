import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/environment';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import paymentRoutes from './routes/paymentRoutes';
import authRoutes from './routes/authRoutes';
import verificationRoutes from './routes/verificationRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import escrowRoutes from './routes/escrowRoutes';
import stellarRoutes from './routes/stellarRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to PILB API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      payments: '/api/payments',
      verification: '/api/verification',
      invoices: '/api/invoices',
      escrow: '/api/escrow',
      stellar: '/api/stellar',
    },
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/stellar', stellarRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 API URL: http://localhost:${PORT}`);
});

export default app;
