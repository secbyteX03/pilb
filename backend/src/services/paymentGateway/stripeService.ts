import Stripe from 'stripe';
import { env } from '../../config/environment';
import { logger } from '../../utils/logger';
import { PaymentStatus } from '../../types/payment';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  /**
   * Create a payment intent for card payments
   */
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
  }): Promise<{
    paymentIntentId: string;
    clientSecret: string;
    redirectUrl?: string;
  }> {
    try {
      // Convert amount to smallest currency unit (cents for USD, cents for KES, etc.)
      const amountInSmallestUnit = this.convertToSmallestUnit(params.amount, params.currency);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: params.currency.toLowerCase(),
        metadata: params.metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Stripe payment intent created: ${paymentIntent.id}`);

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        redirectUrl: undefined, // Stripe handles redirects automatically
      };
    } catch (error) {
      logger.error('Failed to create Stripe payment intent:', error);
      throw new Error(`Stripe payment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a checkout session for hosted payment page
   */
  async createCheckoutSession(params: {
    amount: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
  }): Promise<{
    sessionId: string;
    url: string;
  }> {
    try {
      const amountInSmallestUnit = this.convertToSmallestUnit(params.amount, params.currency);

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              product_data: {
                name: params.metadata?.description || 'Payment',
              },
              unit_amount: amountInSmallestUnit,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.customerEmail,
        metadata: params.metadata || {},
      });

      logger.info(`Stripe checkout session created: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      logger.error('Failed to create Stripe checkout session:', error);
      throw new Error(`Stripe checkout creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatus> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      let status: PaymentStatus['status'];
      switch (paymentIntent.status) {
        case 'succeeded':
          status = 'completed';
          break;
        case 'requires_payment_method':
        case 'requires_confirmation':
        case 'requires_action':
        case 'processing':
          status = 'pending';
          break;
        case 'canceled':
          status = 'failed';
          break;
        default:
          status = 'pending';
      }

      return {
        status,
        transactionId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert from smallest unit
        currency: paymentIntent.currency.toUpperCase(),
        paidAt: paymentIntent.status === 'succeeded' ? new Date(paymentIntent.created * 1000) : undefined,
      };
    } catch (error) {
      logger.error('Failed to get Stripe payment status:', error);
      throw new Error(`Failed to get payment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentIntentId: string, amount?: number): Promise<{
    refundId: string;
    status: string;
  }> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = this.convertToSmallestUnit(amount, 'USD'); // Assume same currency
      }

      const refund = await this.stripe.refunds.create(refundParams);

      logger.info(`Stripe refund created: ${refund.id}`);

      return {
        refundId: refund.id,
        status: refund.status || 'pending',
      };
    } catch (error) {
      logger.error('Failed to create Stripe refund:', error);
      throw new Error(`Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert amount to smallest currency unit
   */
  private convertToSmallestUnit(amount: number, currency: string): number {
    const zeroDecimalCurrencies = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'];

    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
      return Math.round(amount);
    }

    return Math.round(amount * 100);
  }

  /**
   * Create a customer
   */
  async createCustomer(email: string, name?: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
      });

      logger.info(`Stripe customer created: ${customer.id}`);
      return customer.id;
    } catch (error) {
      logger.error('Failed to create Stripe customer:', error);
      throw new Error(`Customer creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get payment methods for a customer
   */
  async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      logger.error('Failed to get customer payment methods:', error);
      throw new Error(`Failed to get payment methods: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
