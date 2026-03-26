import { getStellarClient } from './stellarClient';
import { logger } from '../../utils/logger';

export interface IncomingPayment {
  id: string;
  type: string;
  amount: string;
  assetType: string;
  sourceAccount: string;
  destinationAccount: string;
  memo: string;
  createdAt: string;
}

export type PaymentCallback = (payment: IncomingPayment) => Promise<void>;

export class WatcherService {
  private isWatching: boolean = false;
  private stream: any = null;

  /**
   * Start watching for incoming payments to the service wallet
   */
  async start(onPayment: PaymentCallback): Promise<void> {
    if (this.isWatching) {
      logger.warn('Watcher already running');
      return;
    }

    const stellarClient = getStellarClient();
    const servicePublicKey = stellarClient.getPublicKey();

    logger.info(`🌟 Starting Stellar Payment Watcher`);
    logger.info(`👁️  Watching account: ${servicePublicKey.slice(0, 12)}...`);

    try {
      this.stream = stellarClient.streamPayments(
        servicePublicKey,
        async (payment) => {
          // Filter for incoming payments only
          if (payment.type === 'payment' && 
              payment.to === servicePublicKey) {
            
            logger.info(`💰 Incoming payment detected!`);
            logger.debug('Payment details:', {
              id: payment.id,
              type: payment.type,
              amount: payment.amount,
              asset: payment.asset_type,
              from: payment.from,
              memo: payment.memo,
              memo_type: payment.memo_type,
              created_at: payment.created_at,
            });

            // Map to our interface
            const incomingPayment: IncomingPayment = {
              id: payment.id,
              type: payment.type,
              amount: payment.amount,
              assetType: payment.asset_type,
              sourceAccount: payment.from,
              destinationAccount: payment.to,
              memo: payment.memo || payment.memo_bytes || '',
              createdAt: payment.created_at,
            };

            // Process the payment
            await onPayment(incomingPayment);
          }
        },
        (error) => {
          logger.error('❌ Stream error:', error);
          // Restart after delay
          setTimeout(() => {
            logger.info('Restarting watcher...');
            this.start(onPayment).catch(console.error);
          }, 5000);
        }
      );

      this.isWatching = true;
      logger.info('✅ Watcher started successfully');
    } catch (error) {
      logger.error('❌ Failed to start watcher:', error);
      throw error;
    }
  }

  /**
   * Stop watching for payments
   */
  async stop(): Promise<void> {
    if (this.stream) {
      this.stream();
      this.stream = null;
    }
    this.isWatching = false;
    logger.info('🛑 Watcher stopped');
  }

  /**
   * Check if watcher is running
   */
  isActive(): boolean {
    return this.isWatching;
  }
}

// Singleton instance
let watcherService: WatcherService | null = null;

export function getWatcherService(): WatcherService {
  if (!watcherService) {
    watcherService = new WatcherService();
  }
  return watcherService;
}