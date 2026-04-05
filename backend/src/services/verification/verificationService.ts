import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { PaymentGateway } from '../paymentGateway/paymentGateway';

interface PaymentVerification {
  verificationId: string;
  transactionId: string;
  amount: number;
  currency: string;
  merchantId: string;
  description: string;
  qrCode: string;
  expiresAt: Date;
  status: 'pending' | 'verified' | 'expired' | 'failed';
  verifiedAt?: Date;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export class VerificationService {
  private paymentGateway: PaymentGateway;
  private verifications: Map<string, PaymentVerification> = new Map();

  constructor() {
    this.paymentGateway = new PaymentGateway();
  }

  /**
   * Create a payment verification request
   */
  async createVerification(params: {
    amount: number;
    currency: string;
    merchantId: string;
    description: string;
    expiresInMinutes?: number;
  }): Promise<PaymentVerification> {
    try {
      const verificationId = uuidv4();
      const transactionId = uuidv4();
      const expiresAt = new Date(Date.now() + (params.expiresInMinutes || 15) * 60 * 1000);

      // Generate QR code
      const qrCode = await this.generateQRCode({
        verificationId,
        transactionId,
        amount: params.amount,
        currency: params.currency,
        merchantId: params.merchantId,
      });

      const verification: PaymentVerification = {
        verificationId,
        transactionId,
        amount: params.amount,
        currency: params.currency,
        merchantId: params.merchantId,
        description: params.description,
        qrCode,
        expiresAt,
        status: 'pending',
      };

      this.verifications.set(verificationId, verification);

      logger.info(`Payment verification created: ${verificationId}`);
      return verification;
    } catch (error) {
      logger.error('Failed to create payment verification:', error);
      throw new Error(`Verification creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify a payment using QR code data
   */
  async verifyPayment(verificationId: string, customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<PaymentVerification> {
    try {
      const verification = this.verifications.get(verificationId);
      
      if (!verification) {
        throw new Error('Verification not found');
      }

      if (verification.status !== 'pending') {
        throw new Error('Verification is not in pending status');
      }

      if (new Date() > verification.expiresAt) {
        verification.status = 'expired';
        throw new Error('Verification has expired');
      }

      logger.info(`Verifying payment: ${verificationId}`);

      // Process payment
      const paymentResponse = await this.paymentGateway.processPayment({
        method: 'mpesa', // Default to M-Pesa for in-person payments
        amount: verification.amount,
        currency: verification.currency,
        reference: verification.transactionId,
        description: verification.description,
        phoneNumber: customerInfo?.phone,
      });

      if (!paymentResponse.success) {
        verification.status = 'failed';
        throw new Error(`Payment failed: ${paymentResponse.error}`);
      }

      // Update verification status
      verification.status = 'verified';
      verification.verifiedAt = new Date();
      verification.customerInfo = customerInfo;

      logger.info(`Payment verified: ${verificationId}`);
      return verification;
    } catch (error) {
      logger.error('Failed to verify payment:', error);
      throw new Error(`Payment verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(verificationId: string): Promise<PaymentVerification | null> {
    const verification = this.verifications.get(verificationId);
    
    if (!verification) {
      return null;
    }

    // Check if expired
    if (verification.status === 'pending' && new Date() > verification.expiresAt) {
      verification.status = 'expired';
    }

    return verification;
  }

  /**
   * Generate QR code for payment verification
   */
  private async generateQRCode(data: {
    verificationId: string;
    transactionId: string;
    amount: number;
    currency: string;
    merchantId: string;
  }): Promise<string> {
    try {
      // Create QR code data
      const qrData = JSON.stringify({
        type: 'payment_verification',
        verificationId: data.verificationId,
        transactionId: data.transactionId,
        amount: data.amount,
        currency: data.currency,
        merchantId: data.merchantId,
        timestamp: Date.now(),
      });

      // Generate QR code as data URL
      const qrCode = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      return qrCode;
    } catch (error) {
      logger.error('Failed to generate QR code:', error);
      throw new Error('QR code generation failed');
    }
  }

  /**
   * Generate payment link
   */
  async generatePaymentLink(params: {
    amount: number;
    currency: string;
    description: string;
    merchantId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{
    linkId: string;
    url: string;
    qrCode: string;
  }> {
    try {
      const linkId = uuidv4();

      // Create payment link URL with query parameters
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const queryParams = new URLSearchParams({
        amount: params.amount.toString(),
        currency: params.currency,
        description: params.description,
        merchantId: params.merchantId,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
      });
      const url = `${baseUrl}/pay/${linkId}?${queryParams.toString()}`;

      // Generate QR code for the link
      const qrCode = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
      });

      // Store link data (in production, save to database)
      // For now, just return the link

      logger.info(`Payment link generated: ${linkId}`);
      return { linkId, url, qrCode };
    } catch (error) {
      logger.error('Failed to generate payment link:', error);
      throw new Error(`Payment link generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create in-store payment QR code
   */
  async createInStoreQRCode(params: {
    merchantId: string;
    terminalId: string;
    amount?: number;
    currency: string;
  }): Promise<{
    qrCode: string;
    expiresAt: Date;
  }> {
    try {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Create QR code data for in-store payment
      const qrData = JSON.stringify({
        type: 'in_store_payment',
        merchantId: params.merchantId,
        terminalId: params.terminalId,
        amount: params.amount,
        currency: params.currency,
        timestamp: Date.now(),
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
      });

      logger.info(`In-store QR code created for merchant: ${params.merchantId}`);
      return { qrCode, expiresAt };
    } catch (error) {
      logger.error('Failed to create in-store QR code:', error);
      throw new Error(`In-store QR code creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Scan and process QR code
   */
  async scanQRCode(qrData: string, customerInfo: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<PaymentVerification> {
    try {
      // Parse QR code data
      const data = JSON.parse(qrData);

      if (data.type === 'payment_verification') {
        return await this.verifyPayment(data.verificationId, customerInfo);
      } else if (data.type === 'in_store_payment') {
        // Handle in-store payment
        return await this.processInStorePayment(data, customerInfo);
      } else {
        throw new Error('Invalid QR code type');
      }
    } catch (error) {
      logger.error('Failed to scan QR code:', error);
      throw new Error(`QR code scanning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process in-store payment
   */
  private async processInStorePayment(data: any, customerInfo: any): Promise<PaymentVerification> {
    try {
      const verificationId = uuidv4();
      const transactionId = uuidv4();

      // Process payment
      const paymentResponse = await this.paymentGateway.processPayment({
        method: 'mpesa',
        amount: data.amount,
        currency: data.currency,
        reference: transactionId,
        description: `In-store payment at ${data.merchantId}`,
        phoneNumber: customerInfo.phone,
      });

      if (!paymentResponse.success) {
        throw new Error(`Payment failed: ${paymentResponse.error}`);
      }

      const verification: PaymentVerification = {
        verificationId,
        transactionId,
        amount: data.amount,
        currency: data.currency,
        merchantId: data.merchantId,
        description: `In-store payment`,
        qrCode: '',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: 'verified',
        verifiedAt: new Date(),
        customerInfo,
      };

      logger.info(`In-store payment processed: ${verificationId}`);
      return verification;
    } catch (error) {
      logger.error('Failed to process in-store payment:', error);
      throw error;
    }
  }

  /**
   * Get merchant's verifications
   */
  async getMerchantVerifications(merchantId: string): Promise<PaymentVerification[]> {
    const verifications: PaymentVerification[] = [];
    
    this.verifications.forEach(verification => {
      if (verification.merchantId === merchantId) {
        verifications.push(verification);
      }
    });

    return verifications.sort((a, b) => 
      new Date(b.verifiedAt || b.expiresAt).getTime() - 
      new Date(a.verifiedAt || a.expiresAt).getTime()
    );
  }
}
