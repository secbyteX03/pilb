import { 
  Networks, 
  Keypair, 
  Horizon, 
  TransactionBuilder, 
  Operation, 
  Asset, 
  Memo
} from '@stellar/stellar-sdk';
import { logger } from '../../utils/logger';
import { env } from '../../config/environment';

export interface StellarPayment {
  hash: string;
  from: string;
  to: string;
  amount: string;
  asset: string;
  memo?: string;
  timestamp: Date;
}

export interface StellarAccount {
  publicKey: string;
  balances: Array<{
    asset: string;
    balance: string;
    limit?: string;
  }>;
  sequence: string;
  signers: Array<{
    key: string;
    weight: number;
    type: string;
  }>;
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface MultiSigConfig {
  accountId: string;
  signers: Array<{
    publicKey: string;
    weight: number;
  }>;
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

export class EnhancedStellarService {
  private server: Horizon.Server;
  private networkPassphrase: string;
  private keypair: Keypair;

  constructor() {
    this.server = new Horizon.Server(env.STELLAR_SERVER_URL);
    this.networkPassphrase = env.STELLAR_NETWORK === 'mainnet' 
      ? Networks.PUBLIC 
      : Networks.TESTNET;
    this.keypair = Keypair.fromSecret(env.SERVICE_WALLET_SECRET);
    
    logger.info(`✨ Enhanced Stellar Service initialized`);
    logger.info(`📡 Network: ${env.STELLAR_NETWORK}`);
    logger.info(`🔑 Account: ${this.keypair.publicKey()}`);
  }

  /**
   * Create a new Stellar account
   */
  async createAccount(startingBalance: string = '1.0'): Promise<{
    publicKey: string;
    secretKey: string;
    transactionHash: string;
  }> {
    try {
      const newKeypair = Keypair.random();
      
      // Load source account
      const sourceAccount = await this.server.loadAccount(this.keypair.publicKey());
      
      // Build transaction to create account
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(Operation.createAccount({
          destination: newKeypair.publicKey(),
          startingBalance,
        }))
        .setTimeout(30)
        .build();

      // Sign and submit
      transaction.sign(this.keypair);
      const result = await this.server.submitTransaction(transaction);

      logger.info(`✅ Account created: ${newKeypair.publicKey()}`);
      
      return {
        publicKey: newKeypair.publicKey(),
        secretKey: newKeypair.secret(),
        transactionHash: result.hash,
      };
    } catch (error) {
      logger.error('Failed to create account:', error);
      throw new Error(`Account creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send payment
   */
  async sendPayment(params: {
    destination: string;
    amount: string;
    asset?: string;
    memo?: string;
  }): Promise<{
    hash: string;
    success: boolean;
    message?: string;
  }> {
    try {
      const sourceAccount = await this.server.loadAccount(this.keypair.publicKey());
      
      // Determine asset
      const asset = params.asset === 'XLM' || !params.asset 
        ? Asset.native() 
        : new Asset(params.asset, this.keypair.publicKey());

      // Build transaction
      const transactionBuilder = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(Operation.payment({
          destination: params.destination,
          asset,
          amount: params.amount,
        }));

      // Add memo if provided
      if (params.memo) {
        transactionBuilder.addMemo(Memo.text(params.memo));
      }

      const transaction = transactionBuilder.setTimeout(30).build();

      // Sign and submit
      transaction.sign(this.keypair);
      const result = await this.server.submitTransaction(transaction);

      logger.info(`✅ Payment sent: ${params.amount} to ${params.destination}`);
      
      return {
        hash: result.hash,
        success: true,
        message: 'Payment successful',
      };
    } catch (error) {
      logger.error('Payment failed:', error);
      return {
        hash: '',
        success: false,
        message: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  /**
   * Create multi-signature account
   */
  async createMultiSigAccount(config: MultiSigConfig): Promise<{
    accountId: string;
    transactionHash: string;
  }> {
    try {
      // Create new account
      const newKeypair = Keypair.random();
      const sourceAccount = await this.server.loadAccount(this.keypair.publicKey());

      // Build transaction to create account and set up multi-sig
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '200',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(Operation.createAccount({
          destination: newKeypair.publicKey(),
          startingBalance: '2.0',
        }))
        .addOperation(Operation.setOptions({
          source: newKeypair.publicKey(),
          masterWeight: 0, // Disable master key
          lowThreshold: config.thresholds.low,
          medThreshold: config.thresholds.medium,
          highThreshold: config.thresholds.high,
        }))
        .setTimeout(30)
        .build();

      // Sign with both source and new account
      transaction.sign(this.keypair);
      transaction.sign(newKeypair);
      
      const result = await this.server.submitTransaction(transaction);

      // Add additional signers
      for (const signer of config.signers) {
        await this.addSigner(newKeypair.publicKey(), signer.publicKey, signer.weight, newKeypair);
      }

      logger.info(`✅ Multi-sig account created: ${newKeypair.publicKey()}`);
      
      return {
        accountId: newKeypair.publicKey(),
        transactionHash: result.hash,
      };
    } catch (error) {
      logger.error('Failed to create multi-sig account:', error);
      throw new Error(`Multi-sig account creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add signer to account
   */
  async addSigner(
    accountId: string,
    signerPublicKey: string,
    weight: number,
    signerKeypair?: Keypair
  ): Promise<string> {
    try {
      const sourceAccount = await this.server.loadAccount(accountId);
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(Operation.setOptions({
          signer: {
            ed25519PublicKey: signerPublicKey,
            weight,
          },
        }))
        .setTimeout(30)
        .build();

      // Sign with the account's signer
      if (signerKeypair) {
        transaction.sign(signerKeypair);
      } else {
        transaction.sign(this.keypair);
      }

      const result = await this.server.submitTransaction(transaction);

      logger.info(`✅ Signer added to ${accountId}: ${signerPublicKey}`);
      return result.hash;
    } catch (error) {
      logger.error('Failed to add signer:', error);
      throw new Error(`Failed to add signer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create custom asset
   */
  async createAsset(assetCode: string, issuerPublicKey: string): Promise<Asset> {
    try {
      const asset = new Asset(assetCode, issuerPublicKey);
      logger.info(`✅ Asset created: ${assetCode}:${issuerPublicKey}`);
      return asset;
    } catch (error) {
      logger.error('Failed to create asset:', error);
      throw new Error(`Asset creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Establish trustline
   */
  async establishTrustline(
    accountId: string,
    asset: Asset,
    limit?: string
  ): Promise<string> {
    try {
      const sourceAccount = await this.server.loadAccount(accountId);
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(Operation.changeTrust({
          asset,
          limit: limit || '922337203685.4775807', // Max limit
        }))
        .setTimeout(30)
        .build();

      transaction.sign(this.keypair);
      const result = await this.server.submitTransaction(transaction);

      logger.info(`✅ Trustline established for ${asset.code}`);
      return result.hash;
    } catch (error) {
      logger.error('Failed to establish trustline:', error);
      throw new Error(`Trustline establishment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Path payment (cross-asset payment)
   */
  async pathPayment(params: {
    destination: string;
    sendAsset: Asset;
    sendAmount: string;
    destAsset: Asset;
    destMin: string;
    path?: Asset[];
  }): Promise<{
    hash: string;
    success: boolean;
  }> {
    try {
      const sourceAccount = await this.server.loadAccount(this.keypair.publicKey());
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(Operation.pathPaymentStrictReceive({
          destination: params.destination,
          sendAsset: params.sendAsset,
          sendMax: params.sendAmount,
          destAsset: params.destAsset,
          destAmount: params.destMin,
          path: params.path || [],
        }))
        .setTimeout(30)
        .build();

      transaction.sign(this.keypair);
      const result = await this.server.submitTransaction(transaction);

      logger.info(`✅ Path payment successful`);
      return {
        hash: result.hash,
        success: true,
      };
    } catch (error) {
      logger.error('Path payment failed:', error);
      return {
        hash: '',
        success: false,
      };
    }
  }

  /**
   * Get account details
   */
  async getAccount(publicKey: string): Promise<StellarAccount> {
    try {
      const account = await this.server.loadAccount(publicKey);
      
      return {
        publicKey,
        balances: account.balances.map((b: any) => ({
          asset: b.asset_type === 'native' ? 'XLM' : b.asset_code,
          balance: b.balance,
          limit: b.limit,
        })),
        sequence: account.sequenceNumber(),
        signers: account.signers.map((s: any) => ({
          key: s.key,
          weight: s.weight,
          type: s.type,
        })),
        thresholds: {
          low: account.thresholds.low_threshold,
          medium: account.thresholds.med_threshold,
          high: account.thresholds.high_threshold,
        },
      };
    } catch (error) {
      logger.error('Failed to get account:', error);
      throw new Error(`Failed to get account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionHash: string): Promise<{
    status: 'pending' | 'completed' | 'failed';
    ledger?: number;
    createdAt?: Date;
  }> {
    try {
      const transaction = await this.server.transactions().transaction(transactionHash).call();
      
      return {
        status: 'completed',
        ledger: transaction.ledger_attr,
        createdAt: new Date(transaction.created_at),
      };
    } catch (error) {
      // Transaction not found means it's pending or failed
      return {
        status: 'pending',
      };
    }
  }

  /**
   * Stream payments for an account
   */
  streamPayments(
    accountId: string,
    onPayment: (payment: StellarPayment) => void,
    onError: (error: Error) => void
  ): void {
    this.server
      .payments()
      .forAccount(accountId)
      .cursor('now')
      .stream({
        onmessage: (payment: any) => {
          const stellarPayment: StellarPayment = {
            hash: payment.transaction_hash,
            from: payment.from,
            to: payment.to,
            amount: payment.amount,
            asset: payment.asset_type === 'native' ? 'XLM' : payment.asset_code,
            memo: payment.transaction.memo,
            timestamp: new Date(payment.created_at),
          };
          onPayment(stellarPayment);
        },
        onerror: (error: any) => {
          logger.error('Payment stream error:', error);
          onError(new Error('Payment stream error'));
        },
      });
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: string, asset: string = 'XLM'): Promise<string> {
    try {
      const account = await this.getAccount(publicKey);
      const balance = account.balances.find(b => b.asset === asset);
      return balance ? balance.balance : '0';
    } catch (error) {
      logger.error('Failed to get balance:', error);
      return '0';
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(accountId: string, limit: number = 10): Promise<StellarPayment[]> {
    try {
      const payments = await this.server
        .payments()
        .forAccount(accountId)
        .limit(limit)
        .order('desc')
        .call();

      return payments.records.map((payment: any) => ({
        hash: payment.transaction_hash,
        from: payment.from,
        to: payment.to,
        amount: payment.amount,
        asset: payment.asset_type === 'native' ? 'XLM' : payment.asset_code,
        memo: payment.transaction.memo,
        timestamp: new Date(payment.created_at),
      }));
    } catch (error) {
      logger.error('Failed to get payment history:', error);
      return [];
    }
  }

  /**
   * Get server instance
   */
  getServer(): Horizon.Server {
    return this.server;
  }

  /**
   * Get keypair
   */
  getKeypair(): Keypair {
    return this.keypair;
  }

  /**
   * Get public key
   */
  getPublicKey(): string {
    return this.keypair.publicKey();
  }

  /**
   * Get network passphrase
   */
  getNetworkPassphrase(): string {
    return this.networkPassphrase;
  }
}

// Singleton instance
let enhancedStellarService: EnhancedStellarService | null = null;

export function getEnhancedStellarService(): EnhancedStellarService {
  if (!enhancedStellarService) {
    enhancedStellarService = new EnhancedStellarService();
  }
  return enhancedStellarService;
}
