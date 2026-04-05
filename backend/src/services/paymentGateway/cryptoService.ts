import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { PaymentStatus } from '../../types/payment';

interface CryptoInvoice {
  invoiceId: string;
  address: string;
  amount: number;
  currency: string;
  qrCode: string;
  expiresAt: Date;
  status: 'pending' | 'paid' | 'expired' | 'confirmed';
}

export class CryptoService {
  private bitcoinApiUrl = 'https://api.blockcypher.com/v1/btc/main';
  private ethereumApiUrl = 'https://api.etherscan.io/api';
  private invoices: Map<string, CryptoInvoice> = new Map();

  /**
   * Create Bitcoin invoice
   */
  async createBitcoinInvoice(params: {
    amount: number;
    currency: string;
    description: string;
    reference: string;
  }): Promise<CryptoInvoice> {
    try {
      // Generate a unique address for this invoice
      // In production, you'd use a proper HD wallet
      const address = await this.generateBitcoinAddress();
      
      // Convert amount to BTC if needed
      const btcAmount = params.currency === 'BTC' 
        ? params.amount 
        : await this.convertToBTC(params.amount, params.currency);

      const invoiceId = uuidv4();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      const invoice: CryptoInvoice = {
        invoiceId,
        address,
        amount: btcAmount,
        currency: 'BTC',
        qrCode: this.generateQRCode('bitcoin', address, btcAmount),
        expiresAt,
        status: 'pending',
      };

      this.invoices.set(invoiceId, invoice);
      
      logger.info(`Bitcoin invoice created: ${invoiceId} for ${btcAmount} BTC`);
      
      return invoice;
    } catch (error) {
      logger.error('Failed to create Bitcoin invoice:', error);
      throw new Error(`Bitcoin invoice creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create Ethereum invoice
   */
  async createEthereumInvoice(params: {
    amount: number;
    currency: string;
    description: string;
    reference: string;
  }): Promise<CryptoInvoice> {
    try {
      // Generate a unique address for this invoice
      const address = await this.generateEthereumAddress();
      
      // Convert amount to ETH if needed
      const ethAmount = params.currency === 'ETH' 
        ? params.amount 
        : await this.convertToETH(params.amount, params.currency);

      const invoiceId = uuidv4();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      const invoice: CryptoInvoice = {
        invoiceId,
        address,
        amount: ethAmount,
        currency: 'ETH',
        qrCode: this.generateQRCode('ethereum', address, ethAmount),
        expiresAt,
        status: 'pending',
      };

      this.invoices.set(invoiceId, invoice);
      
      logger.info(`Ethereum invoice created: ${invoiceId} for ${ethAmount} ETH`);
      
      return invoice;
    } catch (error) {
      logger.error('Failed to create Ethereum invoice:', error);
      throw new Error(`Ethereum invoice creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get invoice status
   */
  async getInvoiceStatus(invoiceId: string): Promise<PaymentStatus> {
    const invoice = this.invoices.get(invoiceId);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Check if invoice has expired
    if (new Date() > invoice.expiresAt && invoice.status === 'pending') {
      invoice.status = 'expired';
    }

    // Check blockchain for payment
    if (invoice.status === 'pending') {
      const isPaid = await this.checkBlockchainPayment(invoice);
      if (isPaid) {
        invoice.status = 'paid';
      }
    }

    return {
      status: invoice.status === 'paid' ? 'completed' : 
              invoice.status === 'expired' ? 'expired' : 'pending',
      transactionId: invoice.invoiceId,
      amount: invoice.amount,
      currency: invoice.currency,
      paidAt: invoice.status === 'paid' ? new Date() : undefined,
    };
  }

  /**
   * Generate Bitcoin address (mock implementation)
   */
  private async generateBitcoinAddress(): Promise<string> {
    // In production, use a proper HD wallet library
    // This is a mock implementation
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = '1'; // Bitcoin addresses start with 1 or 3
    
    for (let i = 0; i < 33; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return address;
  }

  /**
   * Generate Ethereum address (mock implementation)
   */
  private async generateEthereumAddress(): Promise<string> {
    // In production, use a proper Ethereum wallet library
    // This is a mock implementation
    const chars = '0123456789abcdef';
    let address = '0x';
    
    for (let i = 0; i < 40; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return address;
  }

  /**
   * Generate QR code for payment
   */
  private generateQRCode(type: string, address: string, amount: number): string {
    // In production, use a QR code library
    // This returns a data URL or a URL to a QR code service
    const uri = type === 'bitcoin' 
      ? `bitcoin:${address}?amount=${amount}`
      : `ethereum:${address}?value=${amount}`;
    
    // Return a placeholder QR code URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;
  }

  /**
   * Convert amount to BTC
   */
  private async convertToBTC(amount: number, fromCurrency: string): Promise<number> {
    try {
      // In production, use a real exchange rate API
      const rates: Record<string, number> = {
        USD: 0.000015,
        EUR: 0.000016,
        KES: 0.00000012,
      };
      
      return amount * (rates[fromCurrency] || 0.000015);
    } catch (error) {
      logger.error('Failed to convert to BTC:', error);
      throw new Error('Currency conversion failed');
    }
  }

  /**
   * Convert amount to ETH
   */
  private async convertToETH(amount: number, fromCurrency: string): Promise<number> {
    try {
      // In production, use a real exchange rate API
      const rates: Record<string, number> = {
        USD: 0.00023,
        EUR: 0.00025,
        KES: 0.0000018,
      };
      
      return amount * (rates[fromCurrency] || 0.00023);
    } catch (error) {
      logger.error('Failed to convert to ETH:', error);
      throw new Error('Currency conversion failed');
    }
  }

  /**
   * Check blockchain for payment
   */
  private async checkBlockchainPayment(invoice: CryptoInvoice): Promise<boolean> {
    try {
      // In production, use blockchain APIs to check for payments
      // This is a mock implementation
      
      if (invoice.currency === 'BTC') {
        // Check Bitcoin blockchain
        const response = await axios.get(
          `${this.bitcoinApiUrl}/addrs/${invoice.address}/balance`
        );
        
        // Check if balance matches expected amount
        const balance = response.data.balance / 100000000; // Convert satoshis to BTC
        return balance >= invoice.amount;
      } else if (invoice.currency === 'ETH') {
        // Check Ethereum blockchain
        const response = await axios.get(
          `${this.ethereumApiUrl}?module=account&action=balance&address=${invoice.address}&tag=latest`
        );
        
        // Check if balance matches expected amount
        const balance = parseInt(response.data.result) / 1e18; // Convert wei to ETH
        return balance >= invoice.amount;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to check blockchain payment:', error);
      return false;
    }
  }

  /**
   * Get supported cryptocurrencies
   */
  getSupportedCryptos(): string[] {
    return ['BTC', 'ETH', 'USDT', 'USDC', 'XLM'];
  }

  /**
   * Get crypto prices
   */
  async getCryptoPrices(): Promise<Record<string, number>> {
    try {
      // In production, use CoinGecko or similar API
      return {
        BTC: 65000,
        ETH: 3500,
        XLM: 0.12,
        USDT: 1,
        USDC: 1,
      };
    } catch (error) {
      logger.error('Failed to get crypto prices:', error);
      throw new Error('Failed to fetch crypto prices');
    }
  }
}
