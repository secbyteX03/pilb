import { Networks, Keypair, Account, Horizon } from '@stellar/stellar-sdk';
import { logger } from '../../utils/logger';
import { env } from '../../config/environment';

// Type aliases for the Stellar SDK
export type TransactionResponse = Horizon.TransactionResponse;
export type PaymentOperationRecord = Horizon.ServerApi.PaymentOperationRecord;

export class StellarClient {
  private server: typeof Horizon.Server.prototype;
  private keypair: Keypair;
  private networkPassphrase: string;

  constructor() {
    // Initialize Stellar server using the correct namespace
    this.server = new Horizon.Server(env.STELLAR_SERVER_URL);

    // Set network passphrase using the correct API
    this.networkPassphrase = env.STELLAR_NETWORK === 'mainnet'
      ? Networks.PUBLIC
      : Networks.TESTNET;

    // Initialize keypair
    this.keypair = Keypair.fromSecret(env.SERVICE_WALLET_SECRET);

    logger.info(`✨ Stellar client initialized`);
    logger.info(`📡 Network: ${env.STELLAR_NETWORK}`);
    logger.info(`🔑 Account: ${this.keypair.publicKey()}`);
  }

  getServer(): typeof Horizon.Server.prototype {
    return this.server;
  }

  getKeypair(): Keypair {
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
  async getAccount(publicKey: string): Promise<Account> {
    return this.server.loadAccount(publicKey);
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: string): Promise<string> {
    const account = await this.server.loadAccount(publicKey);
    const balance = account.balances.find((b: any) => b.asset_type === 'native');
    return balance ? balance.balance : '0';
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string): Promise<TransactionResponse> {
    return this.server.transactions().transaction(txHash).call();
  }

  /**
   * Get payments for account
   */
  async getPayments(accountId: string, limit: number = 10): Promise<PaymentOperationRecord[]> {
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
    onMessage: (payment: PaymentOperationRecord) => void,
    onError: (error: Error) => void
  ): void {
    this.server
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