import { logger } from '../utils/logger';

export class PaymentService {
  constructor() {
    logger.info('PaymentService initialized');
  }

  async processPayment(paymentData: any): Promise<any> {
    logger.info('Processing payment:', paymentData);
    return { success: true };
  }
}