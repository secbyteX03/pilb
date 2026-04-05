import { PaymentMethod, PaymentRequest, PaymentResponse, PaymentStatus } from '../../types/payment';
import { MpesaClient } from '../mpesa/mpesaClient';
import { StellarClient } from '../stellar/stellarClient';
import { StripeService } from './stripeService';
import { CryptoService } from './cryptoService';
import { logger } from '../../utils/logger';

export class PaymentGateway {
  private mpesaService: MpesaClient;
  private stellarService: StellarClient;
  private stripeService: StripeService;
  private cryptoService: CryptoService;

  constructor() {
    this.mpesaService = new MpesaClient();
    this.stellarService = new StellarClient();
    this.stripeService = new StripeService();
    this.cryptoService = new CryptoService();
  }

  /**
   * Process payment using the specified method
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      logger.info(`Processing payment via ${request.method}: ${request.amount} ${request.currency}`);

      switch (request.method) {
        case 'mpesa':
          return await this.processMpesaPayment(request);
        case 'card':
          return await this.processCardPayment(request);
        case 'stellar':
          return await this.processStellarPayment();
        case 'bitcoin':
          return await this.processBitcoinPayment(request);
        case 'ethereum':
          return await this.processEthereumPayment(request);
        default:
          throw new Error(`Unsupported payment method: ${request.method}`);
      }
    } catch (error) {
      logger.error('Payment processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        transactionId: null,
      };
    }
  }

  /**
   * Process M-Pesa payment
   */
  private async processMpesaPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const response = await this.mpesaService.b2cPayment(
      request.phoneNumber!,
      request.amount,
      request.description
    );

    return {
      success: response.responseCode === '0',
      transactionId: response.conversationId,
      message: response.responseDesc,
    };
  }

  /**
   * Process card payment via Stripe
   */
  private async processCardPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const response = await this.stripeService.createPaymentIntent({
      amount: request.amount,
      currency: request.currency,
      metadata: {
        reference: request.reference,
        description: request.description,
      },
    });

    return {
      success: true,
      transactionId: response.paymentIntentId,
      clientSecret: response.clientSecret,
      redirectUrl: response.redirectUrl,
    };
  }

  /**
   * Process Stellar payment
   */
  private async processStellarPayment(): Promise<PaymentResponse> {
    // For Stellar, we need to build and submit a transaction
    // This is a simplified version - in production, you'd build a proper transaction
    await this.stellarService.getAccount(this.stellarService.getPublicKey());
    
    return {
      success: true,
      transactionId: `stellar_${Date.now()}`,
      message: 'Stellar payment initiated',
    };
  }

  /**
   * Process Bitcoin payment
   */
  private async processBitcoinPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const response = await this.cryptoService.createBitcoinInvoice({
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      reference: request.reference,
    });

    return {
      success: true,
      transactionId: response.invoiceId,
      paymentAddress: response.address,
      qrCode: response.qrCode,
      expiresAt: response.expiresAt,
    };
  }

  /**
   * Process Ethereum payment
   */
  private async processEthereumPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const response = await this.cryptoService.createEthereumInvoice({
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      reference: request.reference,
    });

    return {
      success: true,
      transactionId: response.invoiceId,
      paymentAddress: response.address,
      qrCode: response.qrCode,
      expiresAt: response.expiresAt,
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string, method: PaymentMethod): Promise<PaymentStatus> {
    switch (method) {
      case 'mpesa':
        const mpesaStatus = await this.mpesaService.queryTransactionStatus(transactionId);
        return {
          status: mpesaStatus.responseCode === '0' ? 'completed' : 'pending',
          transactionId,
          amount: 0,
          currency: 'KES',
        };
      case 'card':
        return await this.stripeService.getPaymentStatus(transactionId);
      case 'stellar':
        await this.stellarService.getTransaction(transactionId);
        return {
          status: 'completed',
          transactionId,
          amount: 0,
          currency: 'XLM',
        };
      case 'bitcoin':
      case 'ethereum':
        return await this.cryptoService.getInvoiceStatus(transactionId);
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }

  /**
   * Get available payment methods for a currency
   * Stellar is prioritized as the primary payment method
   */
  getAvailableMethods(currency: string): PaymentMethod[] {
    const methods: PaymentMethod[] = [];

    // Stellar is always available (primary method)
    methods.push('stellar');

    // M-Pesa for KES
    if (currency === 'KES') {
      methods.push('mpesa');
    }

    // Cards for all currencies
    methods.push('card');

    // Bitcoin
    if (currency === 'BTC') {
      methods.push('bitcoin');
    }

    // Ethereum
    if (currency === 'ETH' || currency === 'USDT' || currency === 'USDC') {
      methods.push('ethereum');
    }

    return methods;
  }

  /**
   * Get exchange rates between currencies
   */
  async getExchangeRate(from: string, to: string): Promise<number> {
    // Implement exchange rate fetching from multiple sources
    // For now, return mock rates
    const rates: Record<string, Record<string, number>> = {
      KES: { USD: 0.0077, EUR: 0.0071, XLM: 0.023, BTC: 0.00000012, ETH: 0.0000018 },
      USD: { KES: 130, EUR: 0.92, XLM: 3.0, BTC: 0.000015, ETH: 0.00023 },
      EUR: { KES: 141, USD: 1.09, XLM: 3.26, BTC: 0.000016, ETH: 0.00025 },
    };

    return rates[from]?.[to] || 1;
  }
}
