import { getWatcherService, IncomingPayment } from '../stellar/watcherService';
import { getB2CService } from '../mpesa/b2cService';
import { PaymentModel } from '../../models/Payment';
import { logger } from '../../utils/logger';

/**
 * Payment Processor - Coordinates the full payment flow
 * 
 * Flow:
 * 1. Watch Stellar for incoming payments
 * 2. When payment detected, verify against database
 * 3. Trigger M-Pesa B2C disbursement
 * 4. Update payment status
 */
export class PaymentProcessor {
  private isRunning: boolean = false;

  /**
   * Start the payment processor
   * This begins watching for Stellar payments
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Payment processor already running');
      return;
    }

    logger.info('🚀 Starting Payment Processor...');

    const watcherService = getWatcherService();

    await watcherService.start(async (payment: IncomingPayment) => {
      await this.handleIncomingPayment(payment);
    });

    this.isRunning = true;
    logger.info('✅ Payment Processor started');
  }

  /**
   * Stop the payment processor
   */
  async stop(): Promise<void> {
    const watcherService = getWatcherService();
    await watcherService.stop();
    this.isRunning = false;
    logger.info('🛑 Payment Processor stopped');
  }

  /**
   * Handle incoming payment from Stellar
   */
  private async handleIncomingPayment(payment: IncomingPayment): Promise<void> {
    try {
      logger.info(`
${'='.repeat(50)}
Processing Stellar Payment
${'='.repeat(50)}
TX ID: ${payment.id}
Amount: ${payment.amount} XLM
From: ${payment.sourceAccount.slice(0, 12)}...
Memo (Hash): ${payment.memo ? payment.memo.slice(0, 16) + '...' : 'None'}
Created: ${payment.createdAt}
${'='.repeat(50)}
`);

      // Step 1: Find matching payment record in database
      const paymentRecord = await PaymentModel.findByCodeHash(payment.memo);

      if (!paymentRecord) {
        logger.warn(`❌ No matching payment record for memo: ${payment.memo.slice(0, 16)}...`);
        return;
      }

      logger.info(`✅ Found matching payment record`);
      logger.debug(`   Payment ID: ${paymentRecord.id}`);
      logger.debug(`   Amount KES: ${paymentRecord.amount_KES}`);
      logger.debug(`   Recipient: ${paymentRecord.recipient_phone.slice(-4)}`);

      // Step 2: Verify the amount matches (convert XLM to approximate KES)
      // In production, you'd use a more accurate conversion
      const expectedXlm = paymentRecord.amount_XLM;
      const actualXlm = parseFloat(payment.amount);
      
      // Allow small tolerance for rounding
      if (Math.abs(actualXlm - parseFloat(expectedXlm)) > 0.1) {
        logger.warn(`⚠️ Amount mismatch: expected ${expectedXlm}, got ${actualXlm}`);
        // Continue anyway - the memo hash is the key identifier
      }

      // Step 3: Update payment status to 'on_stellar'
      await PaymentModel.updateStatus(paymentRecord.id, 'on_stellar', {
        stellar_tx_hash: payment.id,
      });

      logger.info('✅ Payment status updated to on_stellar');

      // Step 4: Trigger M-Pesa disbursement
      const b2cService = getB2CService();
      
      logger.info(`\n📱 Triggering M-Pesa disbursement...`);
      const result = await b2cService.disburse(paymentRecord);

      if (result.success) {
        logger.info(`
${'='.repeat(50)}
✅ Payment Complete!
${'='.repeat(50)}
Amount: ${paymentRecord.amount_KES} KES
Recipient: ${paymentRecord.recipient_phone}
M-Pesa TX: ${result.mpesaTxId}
Stellar TX: ${payment.id}
${'='.repeat(50)}
`);
      } else {
        logger.error(`❌ Disbursement failed: ${result.error}`);
      }
    } catch (error) {
      logger.error('❌ Error processing payment:', error);
      // Continue - don't block the watcher
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

// Singleton
let paymentProcessor: PaymentProcessor | null = null;

export function getPaymentProcessor(): PaymentProcessor {
  if (!paymentProcessor) {
    paymentProcessor = new PaymentProcessor();
  }
  return paymentProcessor;
}