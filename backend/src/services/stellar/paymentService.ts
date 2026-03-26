import StellarSDK from '@stellar/stellar-sdk';
import { getStellarClient } from './stellarClient';
import { logger } from '../../utils/logger';
import { env } from '../../config/environment';

export interface PaymentResult {
  txHash: string;
  amount: string;
  codeHash: string;
}

export class PaymentService {
  /**
   * Create a payment transaction to the service provider wallet
   * with the code hash as memo
   */
  async createPayment(
    senderPublicKey: string,
    senderSecret: string,
    amount: string,
    codeHash: string
  ): Promise<PaymentResult> {
    const stellarClient = getStellarClient();
    const server = stellarClient.getServer();
    const keypair = StellarSDK.Keypair.fromSecret(senderSecret);

    try {
      logger.info(`💳 Creating Stellar payment...`);
      logger.info(`  From: ${senderPublicKey.slice(0, 12)}...`);
      logger.info(`  To: ${env.SERVICE_WALLET_ADDRESS.slice(0, 12)}...`);
      logger.info(`  Amount: ${amount} XLM`);
      logger.info(`  Memo: ${codeHash.slice(0, 16)}...`);

      // Load sender account
      const account = await server.loadAccount(senderPublicKey);

      // Get base fee
      const baseFee = await server.fetchBaseFee();

      // Build transaction
      const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: baseFee,
        networkPassphrase: stellarClient.getNetworkPassphrase(),
      })
        .addOperation(
          StellarSDK.Operation.payment({
            destination: env.SERVICE_WALLET_ADDRESS,
            asset: StellarSDK.Asset.native(),
            amount: amount,
          })
        )
        .addMemo(StellarSDK.Memo.hash(codeHash))
        .setTimeout(300) // 5 minutes
        .build();

      // Sign with sender's key
      transaction.sign(keypair);

      // Submit to network
      const result = await server.submitTransaction(transaction);

      logger.info(`✅ Payment submitted! TX: ${result.hash}`);

      return {
        txHash: result.hash,
        amount,
        codeHash,
      };
    } catch (error) {
      logger.error('❌ Failed to create payment:', error);
      throw error;
    }
  }

  /**
   * Verify a transaction on Stellar blockchain
   */
  async verifyTransaction(txHash: string): Promise<{
    verified: boolean;
    amount?: string;
    memo?: string;
    source?: string;
    createdAt?: string;
  }> {
    const stellarClient = getStellarClient();

    try {
      const tx = await stellarClient.getTransaction(txHash);

      return {
        verified: true,
        amount: tx.amount || tx.operation_amount || '0',
        memo: tx.memo || tx.memo_bytes || '',
        source: tx.source_account,
        createdAt: tx.created_at,
      };
    } catch (error) {
      logger.error('Transaction verification failed:', error);
      return { verified: false };
    }
  }
}