import { logger } from '../../utils/logger';

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

export class ExchangeRateService {
  private static instance: ExchangeRateService;
  private rates: Map<string, ExchangeRate> = new Map();
  private lastUpdate: Date = new Date(0);
  private updateInterval: number = 5 * 60 * 1000; // 5 minutes

  // Supported fiat currencies and their XLM rates
  private readonly supportedCurrencies: { [key: string]: { name: string; symbol: string; xlmRate: number } } = {
    KES: { name: 'Kenyan Shilling', symbol: 'KES', xlmRate: 25 },
    USD: { name: 'US Dollar', symbol: '$', xlmRate: 0.12 },
    EUR: { name: 'Euro', symbol: '€', xlmRate: 0.11 },
    GBP: { name: 'British Pound', symbol: '£', xlmRate: 0.095 },
    UGX: { name: 'Ugandan Shilling', symbol: 'UGX', xlmRate: 450 },
    TZS: { name: 'Tanzanian Shilling', symbol: 'TZS', xlmRate: 280 },
    NGN: { name: 'Nigerian Naira', symbol: '₦', xlmRate: 180 },
    GHS: { name: 'Ghanaian Cedi', symbol: 'GH₵', xlmRate: 1.5 },
    ZAR: { name: 'South African Rand', symbol: 'R', xlmRate: 2.2 },
    INR: { name: 'Indian Rupee', symbol: '₹', xlmRate: 10 },
  };

  // Stellar assets (stablecoins and other tokens)
  private readonly stellarAssets: { [key: string]: { name: string; symbol: string; xlmRate: number; issuer?: string } } = {
    USDC: { name: 'USD Coin', symbol: 'USDC$', xlmRate: 1.0, issuer: 'GA7ZNCGBCXGT6VKW4MVO4S6DYPNCMUKG7C4K3VRZMBQD3C7D3W4JAMD' },
    XLM: { name: 'Stellar Lumens', symbol: 'XLM', xlmRate: 1.0 },
    BTC: { name: 'Bitcoin', symbol: 'BTC', xlmRate: 0.00015, issuer: 'GA7XENDQAQW79VDG9GRUFYD3QT5KRT7C6RC7K5A7ULNTKPC3CZTID2QD' },
    ETH: { name: 'Ethereum', symbol: 'ETH', xlmRate: 0.0025, issuer: 'GBD4HZL4CKD4VFJVD3BDK6I7B6WQLMS5QGFTUKDXAL6RABJHRMMDGBQ4' },
    AUD: { name: 'Australian Dollar', symbol: 'A$', xlmRate: 0.13 },
    CAD: { name: 'Canadian Dollar', symbol: 'C$', xlmRate: 0.14 },
    JPY: { name: 'Japanese Yen', symbol: '¥', xlmRate: 0.014 },
    CNY: { name: 'Chinese Yuan', symbol: '¥', xlmRate: 0.028 },
    KRW: { name: 'South Korean Won', symbol: '₩', xlmRate: 0.00015 },
    MXN: { name: 'Mexican Peso', symbol: '$', xlmRate: 0.011 },
    BRL: { name: 'Brazilian Real', symbol: 'R$', xlmRate: 0.04 },
  };

  private constructor() {
    this.initializeRates();
  }

  static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService();
    }
    return ExchangeRateService.instance;
  }

  private initializeRates(): void {
    // Initialize fiat currency rates
    Object.entries(this.supportedCurrencies).forEach(([code, config]) => {
      this.rates.set(`XLM_${code}`, {
        from: 'XLM',
        to: code,
        rate: config.xlmRate,
        timestamp: new Date(),
      });
      this.rates.set(`${code}_XLM`, {
        from: code,
        to: 'XLM',
        rate: 1 / config.xlmRate,
        timestamp: new Date(),
      });
    });

    // Initialize Stellar asset rates
    Object.entries(this.stellarAssets).forEach(([code, config]) => {
      this.rates.set(`XLM_${code}`, {
        from: 'XLM',
        to: code,
        rate: config.xlmRate,
        timestamp: new Date(),
      });
      this.rates.set(`${code}_XLM`, {
        from: code,
        to: 'XLM',
        rate: 1 / config.xlmRate,
        timestamp: new Date(),
      });
    });

    this.lastUpdate = new Date();
    logger.info('💱 Exchange rates initialized with fiat currencies and Stellar assets');
  }

  /**
   * Get exchange rate from one currency to another
   */
  getRate(from: string, to: string): number {
    if (from === to) return 1;

    // Check if we need to update rates
    if (Date.now() - this.lastUpdate.getTime() > this.updateInterval) {
      this.updateRates();
    }

    // Direct rate
    const directRate = this.rates.get(`${from}_${to}`);
    if (directRate) return directRate.rate;

    // Via XLM
    const toXLM = this.rates.get(`${from}_XLM`);
    const fromXLM = this.rates.get(`XLM_${to}`);
    if (toXLM && fromXLM) {
      return toXLM.rate * fromXLM.rate;
    }

    logger.warn(`Exchange rate not found: ${from} -> ${to}`);
    return 0;
  }

  /**
   * Convert amount from one currency to another
   */
  convert(amount: number, from: string, to: string): number {
    const rate = this.getRate(from, to);
    return amount * rate;
  }

  /**
   * Get all supported currencies (fiat + Stellar assets)
   */
  getSupportedCurrencies(): Array<{ code: string; name: string; symbol: string; type: 'fiat' | 'stellar_asset' }> {
    const fiatCurrencies = Object.entries(this.supportedCurrencies).map(([code, config]) => ({
      code,
      name: config.name,
      symbol: config.symbol,
      type: 'fiat' as const,
    }));

    const stellarAssets = Object.entries(this.stellarAssets).map(([code, config]) => ({
      code,
      name: config.name,
      symbol: config.symbol,
      type: 'stellar_asset' as const,
    }));

    return [...fiatCurrencies, ...stellarAssets];
  }

  /**
   * Get only fiat currencies
   */
  getFiatCurrencies(): Array<{ code: string; name: string; symbol: string }> {
    return Object.entries(this.supportedCurrencies).map(([code, config]) => ({
      code,
      name: config.name,
      symbol: config.symbol,
    }));
  }

  /**
   * Get only Stellar assets
   */
  getStellarAssets(): Array<{ code: string; name: string; symbol: string; issuer?: string }> {
    return Object.entries(this.stellarAssets).map(([code, config]) => ({
      code,
      name: config.name,
      symbol: config.symbol,
      issuer: config.issuer,
    }));
  }

  /**
   * Check if a currency is supported
   */
  isCurrencySupported(currency: string): boolean {
    return currency.toUpperCase() in this.supportedCurrencies || currency.toUpperCase() in this.stellarAssets;
  }

  /**
   * Check if a currency is a Stellar asset
   */
  isStellarAsset(currency: string): boolean {
    return currency.toUpperCase() in this.stellarAssets;
  }

  /**
   * Update rates (in production, fetch from API)
   */
  private updateRates(): void {
    // In production, fetch from a real exchange rate API
    // For now, just update the timestamp
    this.rates.forEach((rate, _key) => {
      rate.timestamp = new Date();
    });
    this.lastUpdate = new Date();
    logger.info('💱 Exchange rates updated');
  }

  /**
   * Get rate for display
   */
  getDisplayRate(from: string, to: string): string {
    const rate = this.getRate(from, to);
    if (rate === 0) return 'N/A';
    return `1 ${from} = ${rate.toFixed(6)} ${to}`;
  }
}
