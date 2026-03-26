import * as StellarSDK from '@stellar/stellar-sdk';
import { logger } from '../../utils/logger';
import { env } from '../environment';

export class StellarClient {
  private server: StellarSDK.Server;
  private keypair: StellarSDK.Keypair;
  private networkPassphrase: string;

  constructor() {
    // Initialize Stellar server
    this.server = new StellarSDK.Server(env.STELLAR_SERVER_URL);

    // Set network passphrase
    this.networkPassphrase = env.STELLAR_NETWORK === 'mainnet'
      ? StellarSDK.Networks.PUBLIC_NETWORK_PASSPHRASE
      : StellarSDK.Networks.TESTNET_NETWORK_PASSPHRASE;

    // Initialize keypair
    this.keypair = StellarSDK.Keypair.fromSecret(env.SERVICE_WALLET_SECRET);

    logger.info(`✨ Stellar client initialized`);
    logger.info(`📡 Network: ${env.STELLAR_NETWORK}`);
    logger.info(`🔑 Account: ${this.keypair.publicKey()}`);
  }

  getServer(): StellarSDK.Server {
    return this.server;
  }

  getKeypair(): StellarSDK.Keypair {
    return this.keypair;
  }

  getPublicKey(): string {
    return this.keypair.publicKey();
  }

  getNetworkPassphrase(): string {
    return this.networkPassphrase;
  }

  /**
   * Load account information
   */
  async getAccount(publicKey: string): Promise<StellarSDK.Account> {
    return this.server.loadAccount(publicKey);
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: string): Promise<string> {
    const account = await this.server.loadAccount(publicKey);
    const balance = account.balances.find((b) => b.asset_type === 'native');
    return balance ? balance.balance : '0';
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string): Promise<StellarSDK.Horizon.TransactionResponse> {
    return this.server.transactions().transaction(txHash).call();
  }

  /**
   * Get payments for account
   */
  async getPayments(accountId: string, limit: number = 10): Promise<StellarSDK.Horizon.ServerApi.PaymentOperationRecord[]> {
    const payments = await this.server
      .payments()
      .forAccount(accountId)
      .limit(limit)
      .order('desc')
      .call();
    return payments.records;
  }

  /**
   * Stream payments in real-time
   */
  streamPayments(
    accountId: string,
    onMessage: (payment: StellarSDK.Horizon.ServerApi.PaymentOperationRecord) => void,
    onError: (error: Error) => void
  ): StellarSDK.Horizon.CallPromise<StellarSDK.Horizon.PaymentCallRecords> {
    return this.server
      .payments()
      .forAccount(accountId)
      .cursor('now')
      .stream({
        onmessage: onMessage,
        onerror: onError,
      });
  }
}

// Singleton instance
let stellarClient: StellarClient | null = null;

export function getStellarClient(): StellarClient {
  if (!stellarClient) {
    stellarClient = new StellarClient();
  }
  return stellarClient;
}