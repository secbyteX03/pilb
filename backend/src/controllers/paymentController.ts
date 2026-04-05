import { Request, Response } from 'express';
import { CodeGenerator } from '../services/encryption/codeGenerator';
import { PaymentModel, PaymentRecord } from '../models/Payment';
import { Validators } from '../utils/validators';
import { logger } from '../utils/logger';
import { env } from '../config/environment';
import { ExchangeRateService } from '../services/exchange/exchangeRateService';

/**
 * XLM to KES conversion rate (approximate)
 * In production, use a real exchange rate API
 */
const XLM_TO_KES_RATE = 25; // 1 XLM ≈ 25 KES

const exchangeRateService = ExchangeRateService.getInstance();

// In-memory storage for payment links (for demo purposes)
// In production, this would be a database
const paymentLinksStore = new Map<string, any>();

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { amount, recipientPhone, senderPublicKey } = req.body;

    // Validate inputs
    if (!amount || !recipientPhone || !senderPublicKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate amount
    const amountValidation = Validators.isValidAmount(amount);
    if (!amountValidation.valid) {
      return res.status(400).json({ error: amountValidation.error });
    }

    // Validate phone number
    if (!Validators.isValidPhone(recipientPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate sender public key
    if (!Validators.isValidPublicKey(senderPublicKey)) {
      return res.status(400).json({ error: 'Invalid Stellar public key' });
    }

    // Generate verification code and hash
    const verificationCode = CodeGenerator.generateCode();
    const codeSalt = CodeGenerator.generateSalt();
    const codeHash = CodeGenerator.hashCode(verificationCode, codeSalt);

    // Calculate XLM amount (approx)
    const amountXLM = (amount / XLM_TO_KES_RATE).toFixed(7);
    const currency = 'KES';
    const country = 'KE';

    // Create payment record in database
    const payment = await PaymentModel.create({
      amount_KES: amount,
      amount_XLM: amountXLM,
      recipient_phone: Validators.normalizePhone(recipientPhone),
      sender_public_key: senderPublicKey,
      verification_code: verificationCode,
      code_salt: codeSalt,
      code_hash: codeHash,
      status: 'pending_stellar',
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      currency,
      country,
      recipient_country_code: country,
      exchange_rate: XLM_TO_KES_RATE,
    });

    logger.info(`Payment initiated: ${payment.id}, Code: ${verificationCode}`);

    // Return payment details for the client to sign Stellar transaction
    res.json({
      paymentId: payment.id,
      verificationCode,
      amount,
      amountXLM,
      recipientPhone: Validators.normalizePhone(recipientPhone),
      currency,
      country,
      // Transaction data for client to sign
      stellarTransaction: {
        destination: env.SERVICE_WALLET_ADDRESS,
        amount: amountXLM,
        memo: codeHash,
      },
    });
  } catch (error: any) {
    logger.error('Payment initiation error:', error.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId, stellarTxHash } = req.body;

    if (!paymentId || !stellarTxHash) {
      return res.status(400).json({ error: 'Missing payment ID or transaction hash' });
    }

    // Update payment with transaction hash
    const updated = await PaymentModel.updateStatus(paymentId, 'on_stellar', {
      stellar_tx_hash: stellarTxHash,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    logger.info(`Payment ${paymentId} confirmed on Stellar: ${stellarTxHash}`);

    res.json({
      success: true,
      status: 'on_stellar',
      stellarTxHash,
    });
  } catch (error: any) {
    logger.error('Payment confirmation error:', error.message);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Validators.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    const payment = await PaymentModel.findById(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Return status (hide sensitive data)
    res.json({
      id: payment.id,
      amount_KES: payment.amount_KES,
      status: payment.status,
      created_at: payment.created_at,
      stellar_tx_hash: payment.stellar_tx_hash,
      mpesa_tx_id: payment.mpesa_tx_id,
    });
  } catch (error: any) {
    logger.error('Get payment status error:', error.message);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const { publicKey, limit = 20, offset = 0 } = req.query;

    if (!publicKey || typeof publicKey !== 'string') {
      return res.status(400).json({ error: 'Public key is required' });
    }

    if (!Validators.isValidPublicKey(publicKey)) {
      return res.status(400).json({ error: 'Invalid public key' });
    }

    const payments = await PaymentModel.getHistory(publicKey, Number(limit), Number(offset));

    // Map to response (hide sensitive data)
    const response = payments.map((p: PaymentRecord) => ({
      id: p.id,
      amount_KES: p.amount_KES,
      recipient_phone: p.recipient_phone.slice(-4), // Only last 4 digits
      status: p.status,
      currency: p.currency,
      country: p.country,
      created_at: p.created_at,
    }));

    res.json({
      payments: response,
      total: response.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    logger.error('Get payment history error:', error.message);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
};

export const initiateCrossBorderPayment = async (req: Request, res: Response) => {
  try {
    const { amount, recipientPhone, senderPublicKey, currency, recipientCountry } = req.body;

    // Validate inputs
    if (!amount || !recipientPhone || !senderPublicKey || !currency || !recipientCountry) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate amount
    const amountValidation = Validators.isValidAmount(amount);
    if (!amountValidation.valid) {
      return res.status(400).json({ error: amountValidation.error });
    }

    // Validate phone number
    if (!Validators.isValidPhone(recipientPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate sender public key
    if (!Validators.isValidPublicKey(senderPublicKey)) {
      return res.status(400).json({ error: 'Invalid Stellar public key' });
    }

    // Validate currency
    if (!exchangeRateService.isCurrencySupported(currency)) {
      return res.status(400).json({ error: 'Unsupported currency' });
    }

    // Generate verification code and hash
    const verificationCode = CodeGenerator.generateCode();
    const codeSalt = CodeGenerator.generateSalt();
    const codeHash = CodeGenerator.hashCode(verificationCode, codeSalt);

    // Calculate XLM amount using exchange rate
    const amountXLM = exchangeRateService.convert(amount, currency, 'XLM').toFixed(7);
    const exchangeRate = exchangeRateService.getRate(currency, 'XLM');

    // Create payment record in database
    const payment = await PaymentModel.create({
      amount_KES: amount, // Store original amount
      amount_XLM: amountXLM,
      recipient_phone: Validators.normalizePhone(recipientPhone),
      sender_public_key: senderPublicKey,
      verification_code: verificationCode,
      code_salt: codeSalt,
      code_hash: codeHash,
      status: 'pending_stellar',
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      currency,
      country: recipientCountry.toUpperCase(),
      recipient_country_code: recipientCountry.toUpperCase(),
      exchange_rate: exchangeRate,
    });

    logger.info(`Cross-border payment initiated: ${payment.id}, Code: ${verificationCode}, Currency: ${currency}, Country: ${recipientCountry}`);

    // Return payment details for the client to sign Stellar transaction
    res.json({
      paymentId: payment.id,
      verificationCode,
      amount,
      amountXLM,
      recipientPhone: Validators.normalizePhone(recipientPhone),
      currency,
      country: recipientCountry.toUpperCase(),
      exchangeRate,
      // Transaction data for client to sign
      stellarTransaction: {
        destination: env.SERVICE_WALLET_ADDRESS,
        amount: amountXLM,
        memo: codeHash,
      },
    });
  } catch (error: any) {
    logger.error('Cross-border payment initiation error:', error.message);
    res.status(500).json({ error: 'Failed to initiate cross-border payment' });
  }
};

export const getSupportedCurrencies = async (_req: Request, res: Response) => {
  try {
    const currencies = exchangeRateService.getSupportedCurrencies();
    res.json({ currencies });
  } catch (error: any) {
    logger.error('Get supported currencies error:', error.message);
    res.status(500).json({ error: 'Failed to get supported currencies' });
  }
};

export const getExchangeRate = async (_req: Request, res: Response) => {
  try {
    const { from, to } = _req.query;

    if (!from || !to || typeof from !== 'string' || typeof to !== 'string') {
      return res.status(400).json({ error: 'Missing from or to currency' });
    }

    const rate = exchangeRateService.getRate(from.toUpperCase(), to.toUpperCase());
    const displayRate = exchangeRateService.getDisplayRate(from.toUpperCase(), to.toUpperCase());

    res.json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate,
      displayRate,
    });
  } catch (error: any) {
    logger.error('Get exchange rate error:', error.message);
    res.status(500).json({ error: 'Failed to get exchange rate' });
  }
};

// Payment Link exports
export const createPaymentLink = async (req: Request, res: Response) => {
  try {
    const { amount, currency, description, merchantId, successUrl, cancelUrl, expiresIn } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields: amount and currency' });
    }

    // Validate amount
    const amountValidation = Validators.isValidAmount(amount);
    if (!amountValidation.valid) {
      return res.status(400).json({ error: amountValidation.error });
    }

    // Validate currency
    if (!exchangeRateService.isCurrencySupported(currency)) {
      return res.status(400).json({ error: 'Unsupported currency' });
    }

    // Generate unique link ID
    const linkId = `pl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const verificationCode = CodeGenerator.generateCode();
    const codeSalt = CodeGenerator.generateSalt();
    const codeHash = CodeGenerator.hashCode(verificationCode, codeSalt);

    // Calculate amount in XLM
    const amountXLM = exchangeRateService.convert(amount, currency, 'XLM').toFixed(7);

    // Calculate expiry
    const expiresInMs = expiresIn ? expiresIn * 60 * 1000 : 60 * 60 * 1000; // Default 1 hour
    const expiresAt = new Date(Date.now() + expiresInMs);

    // Store payment link in memory
    const paymentLink = {
      linkId,
      amount,
      amountXLM,
      currency,
      description,
      merchantId,
      verificationCode,
      codeSalt,
      codeHash,
      successUrl,
      cancelUrl,
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    paymentLinksStore.set(linkId, paymentLink);
    
    logger.debug('Payment link created, stored keys:', Array.from(paymentLinksStore.keys()));
    logger.debug('Payment link created:', { linkId, amount, currency, merchantId });

    logger.info(`Payment link created: ${linkId}, Amount: ${amount} ${currency}, Verification: ${verificationCode}`);

    res.json({
      linkId,
      url: `http://localhost:3000/pay/${linkId}`,
      verificationCode,
      amount,
      amountXLM,
      currency,
      description,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: any) {
    logger.error('Create payment link error:', error.message);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
};

export const getPaymentLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing payment link ID' });
    }

    // Try to fetch from in-memory store first
    const storedLink = paymentLinksStore.get(id);
    
    logger.debug('Looking for payment link:', { id, stored: !!storedLink });
    logger.debug('Store keys:', Array.from(paymentLinksStore.keys()));
    
    if (storedLink) {
      logger.info('Found payment link in store:', { linkId: id, verificationCode: storedLink.verificationCode });
      return res.json({
        ...storedLink,
        exists: true,
      });
    }

    // In production, fetch from database
    // For demo, validate the ID format
    if (!id.startsWith('pl_')) {
      return res.status(404).json({ error: 'Payment link not found' });
    }

    // If not found in store, return error
    return res.status(404).json({ error: 'Payment link not found or has expired' });
  } catch (error: any) {
    logger.error('Get payment link error:', error.message);
    res.status(500).json({ error: 'Failed to get payment link' });
  }
};

// Scheduled Payments exports
export const createScheduledPayment = async (req: Request, res: Response) => {
  try {
    const { amount, recipientPhone, senderPublicKey, currency, scheduleDate, recurring, interval } = req.body;

    if (!amount || !recipientPhone || !senderPublicKey || !scheduleDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate amount
    const amountValidation = Validators.isValidAmount(amount);
    if (!amountValidation.valid) {
      return res.status(400).json({ error: amountValidation.error });
    }

    // Validate schedule date
    const scheduledTime = new Date(scheduleDate);
    if (scheduledTime <= new Date()) {
      return res.status(400).json({ error: 'Schedule date must be in the future' });
    }

    // Validate phone number
    if (!Validators.isValidPhone(recipientPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate sender public key
    if (!Validators.isValidPublicKey(senderPublicKey)) {
      return res.status(400).json({ error: 'Invalid Stellar public key' });
    }

    // Validate currency
    const currencyCode = currency || 'KES';
    if (!exchangeRateService.isCurrencySupported(currencyCode)) {
      return res.status(400).json({ error: 'Unsupported currency' });
    }

    // Generate scheduled payment ID
    const scheduledId = `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const verificationCode = CodeGenerator.generateCode();
    const codeSalt = CodeGenerator.generateSalt();
    const codeHash = CodeGenerator.hashCode(verificationCode, codeSalt);

    // Calculate amount in XLM
    const amountXLM = exchangeRateService.convert(amount, currencyCode, 'XLM').toFixed(7);

    // Store in memory store
    scheduledPaymentsStore.set(scheduledId, {
      scheduledId,
      amount,
      amountXLM,
      recipientPhone: Validators.normalizePhone(recipientPhone),
      currency: currencyCode,
      scheduleDate: scheduledTime.toISOString(),
      recurring: recurring || false,
      interval,
      status: 'scheduled',
      senderPublicKey,
      verificationCode,
    });

    logger.info(`Scheduled payment created: ${scheduledId}, Amount: ${amount} ${currencyCode}, Scheduled for: ${scheduleDate}`);

    res.json({
      scheduledId,
      verificationCode,
      amount,
      amountXLM,
      recipientPhone: Validators.normalizePhone(recipientPhone),
      currency: currencyCode,
      scheduleDate: scheduledTime.toISOString(),
      recurring: recurring || false,
      interval,
      status: 'scheduled',
    });
  } catch (error: any) {
    logger.error('Create scheduled payment error:', error.message);
    res.status(500).json({ error: 'Failed to create scheduled payment' });
  }
};

export const getScheduledPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing scheduled payment ID' });
    }

    if (!id.startsWith('sp_')) {
      return res.status(404).json({ error: 'Scheduled payment not found' });
    }

    // In production, fetch from database
    res.json({
      scheduledId: id,
      amount: 100,
      amountXLM: '1.2345678',
      recipientPhone: '+254700000000',
      currency: 'KES',
      scheduleDate: new Date(Date.now() + 86400000).toISOString(),
      recurring: false,
      status: 'scheduled',
    });
  } catch (error: any) {
    logger.error('Get scheduled payment error:', error.message);
    res.status(500).json({ error: 'Failed to get scheduled payment' });
  }
};

export const cancelScheduledPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing scheduled payment ID' });
    }

    const payment = scheduledPaymentsStore.get(id);
    if (!payment) {
      return res.status(404).json({ error: 'Scheduled payment not found' });
    }

    // Update status in memory store
    scheduledPaymentsStore.set(id, {
      ...payment,
      status: 'cancelled',
    });

    logger.info(`Scheduled payment cancelled: ${id}`);

    res.json({
      scheduledId: id,
      status: 'cancelled',
      message: 'Scheduled payment cancelled successfully',
    });
  } catch (error: any) {
    logger.error('Cancel scheduled payment error:', error.message);
    res.status(500).json({ error: 'Failed to cancel scheduled payment' });
  }
};

export const deleteScheduledPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing scheduled payment ID' });
    }

    const payment = scheduledPaymentsStore.get(id);
    if (!payment) {
      return res.status(404).json({ error: 'Scheduled payment not found' });
    }

    // Delete from memory store
    scheduledPaymentsStore.delete(id);

    logger.info(`Scheduled payment deleted: ${id}`);

    res.json({
      scheduledId: id,
      status: 'deleted',
    });
  } catch (error: any) {
    logger.error('Delete scheduled payment error:', error.message);
    res.status(500).json({ error: 'Failed to delete scheduled payment' });
  }
};

export const updateScheduledPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, recipientPhone, scheduleDate, currency, recurring, interval } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing scheduled payment ID' });
    }

    const payment = scheduledPaymentsStore.get(id);
    if (!payment) {
      return res.status(404).json({ error: 'Scheduled payment not found' });
    }

    // Update fields if provided
    if (amount !== undefined) payment.amount = amount;
    if (recipientPhone !== undefined) payment.recipientPhone = recipientPhone;
    if (scheduleDate !== undefined) payment.scheduleDate = scheduleDate;
    if (currency !== undefined) payment.currency = currency;
    if (recurring !== undefined) payment.recurring = recurring;
    if (interval !== undefined) payment.interval = interval;

    // Save updated payment
    scheduledPaymentsStore.set(id, payment);

    logger.info(`Scheduled payment updated: ${id}`);

    res.json({
      scheduledId: id,
      amount: payment.amount,
      amountXLM: payment.amountXLM,
      recipientPhone: payment.recipientPhone,
      currency: payment.currency,
      scheduleDate: payment.scheduleDate,
      recurring: payment.recurring,
      interval: payment.interval,
      status: payment.status,
    });
  } catch (error: any) {
    logger.error('Update scheduled payment error:', error.message);
    res.status(500).json({ error: 'Failed to update scheduled payment' });
  }
};

// In-memory storage for scheduled payments (until database model is added)
const scheduledPaymentsStore = new Map<string, {
  scheduledId: string;
  amount: number;
  amountXLM: string;
  recipientPhone: string;
  currency: string;
  scheduleDate: string;
  recurring: boolean;
  interval?: string;
  status: string;
  senderPublicKey: string;
  verificationCode: string;
}>();

export const getScheduledPayments = async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.query;

    if (!publicKey || typeof publicKey !== 'string') {
      return res.status(400).json({ error: 'Public key is required' });
    }

    // Fetch scheduled payments from memory store
    const payments: Array<{
      scheduledId: string;
      verificationCode: string;
      amount: number;
      amountXLM: string;
      recipientPhone: string;
      currency: string;
      scheduleDate: string;
      recurring: boolean;
      status: string;
    }> = [];

    scheduledPaymentsStore.forEach((payment, id) => {
      if (payment.senderPublicKey === publicKey && payment.status !== 'cancelled') {
        payments.push({
          scheduledId: id,
          verificationCode: payment.verificationCode,
          amount: payment.amount,
          amountXLM: payment.amountXLM,
          recipientPhone: payment.recipientPhone,
          currency: payment.currency,
          scheduleDate: payment.scheduleDate,
          recurring: payment.recurring,
          status: payment.status,
        });
      }
    });

    res.json({
      scheduledPayments: payments,
      total: payments.length,
    });
  } catch (error: any) {
    logger.error('Get scheduled payments error:', error.message);
    res.status(500).json({ error: 'Failed to get scheduled payments' });
  }
};