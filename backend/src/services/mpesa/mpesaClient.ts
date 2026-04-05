import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/environment';
import { logger } from '../../utils/logger';

export class MpesaClient {
  private client: AxiosInstance;
  private accessToken?: string;
  private tokenExpiresAt?: number;

  constructor() {
    this.client = axios.create({
      baseURL: env.MPESA_BASE_URL,
      timeout: 30000,
    });
  }

  /**
   * Get OAuth2 access token from Safaricom
   * Tokens are cached and refreshed when expired
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(
        `${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`
      ).toString('base64');

      logger.info('🔐 Getting M-Pesa access token...');

      const response = await this.client.get('/oauth/v1/generate?grant_type=client_credentials', {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      this.accessToken = response.data.access_token;
      // Token expires in 3600s, refresh at 90%
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000 * 0.9);

      logger.info('✅ Access token obtained');
      return this.accessToken as string;
    } catch (error) {
      logger.error('❌ Failed to get M-Pesa access token:', error);
      throw error;
    }
  }

  /**
   * Generate password for B2C API
   */
  private generatePassword(): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);

    const password = Buffer.from(
      env.MPESA_SHORTCODE + env.MPESA_PASSKEY + timestamp
    ).toString('base64');

    return password;
  }

  /**
   * Send money via M-Pesa B2C (Business to Customer)
   * This triggers the payment to the recipient's M-Pesa account
   */
  async b2cPayment(
    phoneNumber: string,
    amount: number,
    remarks: string = 'Payment'
  ): Promise<{
    conversationId: string;
    originatorConversationId: string;
    responseCode: string;
    responseDesc: string;
  }> {
    try {
      const token = await this.getAccessToken();

      logger.info(`📱 Initiating M-Pesa B2C payment`);
      logger.debug(`  Phone: ${phoneNumber}`);
      logger.debug(`  Amount: ${amount} KES`);

      // Normalize phone number (remove +254, add 254)
      const normalizedPhone = phoneNumber.replace(/^(\+?254|0)/, '254');
      
      const response = await this.client.post(
        '/mpesa/b2c/v3/paymentrequest',
        {
          OriginatorConversationID: `PILB${Date.now()}`,
          InitiatorName: 'PILB',
          SecurityCredential: this.generatePassword(),
          CommandID: 'BusinessPayment',
          Amount: Math.round(amount),
          PartyA: env.MPESA_SHORTCODE,
          PartyB: normalizedPhone,
          Remarks: remarks,
          QueueTimeOutURL: env.MPESA_CALLBACK_URL,
          ResultURL: env.MPESA_CALLBACK_URL,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(`✅ M-Pesa B2C request sent: ${response.data.ConversationID}`);
      
      return {
        conversationId: response.data.ConversationID,
        originatorConversationId: response.data.OriginatorConversationID,
        responseCode: response.data.ResponseCode,
        responseDesc: response.data.ResponseDesc,
      };
    } catch (error: any) {
      logger.error('❌ M-Pesa B2C payment failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Query transaction status
   */
  async queryTransactionStatus(
    conversationId: string
  ): Promise<{
    conversationId: string;
    responseCode: string;
    responseDesc: string;
  }> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.post(
        '/mpesa/transactionstatus/v1/query',
        {
          Initiator: 'PILB',
          SecurityCredential: this.generatePassword(),
          CommandID: 'TransactionStatusQuery',
          TransactionID: conversationId,
          PartyA: env.MPESA_SHORTCODE,
          IdentifierType: 4,
          ResultURL: env.MPESA_CALLBACK_URL,
          QueueTimeOutURL: env.MPESA_CALLBACK_URL,
          Remarks: 'Status query',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        conversationId: response.data.ConversationID,
        responseCode: response.data.ResponseCode,
        responseDesc: response.data.ResponseDesc,
      };
    } catch (error) {
      logger.error('Query transaction status failed:', error);
      throw error;
    }
  }
}

// Singleton instance
let mpesaClient: MpesaClient | null = null;

export function getMpesaClient(): MpesaClient {
  if (!mpesaClient) {
    mpesaClient = new MpesaClient();
  }
  return mpesaClient;
}