import { getMpesaClient } from './mpesaClient';
import { PaymentModel, PaymentRecord } from '../../models/Payment';
import { logger } from '../../utils/logger';

export interface DisbursementResult {
  success: boolean;
  mpesaTxId?: string;
  error?: string;
}

/**
 * B2C Service - Handles M-Pesa disbursements to recipients
 * 
 * This service is triggered when a payment is detected on Stellar
 * and coordinates the M-Pesa payout to the recipient
 */
export class B2CService {
  /**
   * Process disbursement for a payment
   * This is called by the payment processor when Stellar payment is confirmed
   */
  async disburse(payment: PaymentRecord): Promise<DisbursementResult> {
    const mpesaClient = getMpesaClient();

    logger.info(`💸 Processing disbursement for payment: ${payment.id}`);
    logger.info(`  Recipient: ${payment.recipient_phone}`);
    logger.info(`  Amount: ${payment.amount_KES} KES`);

    try {
      // Send B2C payment to M-Pesa
      const result = await mpesaClient.b2cPayment(
        payment.recipient_phone,
        payment.amount_KES,
        `Payment received - Verify: ${payment.stellar_tx_hash?.slice(0, 8) || 'N/A'}`
      );

      if (result.responseCode === '0') {
        logger.info(`✅ M-Pesa disbursement successful!`);
        logger.info(`  Conversation ID: ${result.conversationId}`);

        // Update payment record with M-Pesa transaction ID
        await PaymentModel.updateStatus(payment.id, 'mpesa_sent', {
          mpesa_tx_id: result.conversationId,
          mpesa_status: 'pending',
        });

        return {
          success: true,
          mpesaTxId: result.conversationId,
        };
      } else {
        logger.warn(`⚠️ M-Pesa returned non-zero response: ${result.responseDesc}`);
        
        // Update payment as failed
        await PaymentModel.updateStatus(payment.id, 'failed', {
          mpesa_status: 'failed',
        });

        return {
          success: false,
          error: result.responseDesc,
        };
      }
    } catch (error: any) {
      logger.error('❌ M-Pesa disbursement failed:', error.message);

      // Mark payment as failed
      await PaymentModel.updateStatus(payment.id, 'failed', {
        mpesa_status: 'failed',
      });

      return {
        success: false,
        error: error.message || 'M-Pesa disbursement failed',
      };
    }
  }

  /**
   * Check status of a disbursement
   */
  async checkStatus(mpesaTxId: string): Promise<{
    status: 'pending' | 'success' | 'failed' | 'unknown';
    message?: string;
  }> {
    const mpesaClient = getMpesaClient();

    try {
      const result = await mpesaClient.queryTransactionStatus(mpesaTxId);

      if (result.responseCode === '0') {
        return { status: 'success' };
      } else if (result.responseCode === '2001') {
        return { status: 'pending', message: result.responseDesc };
      } else {
        return { status: 'failed', message: result.responseDesc };
      }
    } catch (error) {
      logger.error('Failed to check M-Pesa status:', error);
      return { status: 'unknown', message: 'Unable to check status' };
    }
  }
}

// Singleton
let b2cService: B2CService | null = null;

export function getB2CService(): B2CService {
  if (!b2cService) {
    b2cService = new B2CService();
  }
  return b2cService;
}