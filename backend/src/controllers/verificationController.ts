import { Request, Response } from 'express';
import { VerificationService } from '../services/verification/verificationService';
import { logger } from '../utils/logger';

const verificationService = new VerificationService();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class VerificationController {
  /**
   * Create a payment verification request
   */
  async createVerification(req: AuthRequest, res: Response) {
    try {
      const { amount, currency, description, expiresInMinutes } = req.body;
      const merchantId = req.user?.id;

      if (!merchantId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const verification = await verificationService.createVerification({
        amount,
        currency,
        merchantId,
        description,
        expiresInMinutes,
      });

      res.status(201).json({
        success: true,
        data: verification,
      });
    } catch (error) {
      logger.error('Failed to create verification:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create verification',
      });
    }
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const verification = await verificationService.getVerificationStatus(id);

      if (!verification) {
        return res.status(404).json({
          success: false,
          error: 'Verification not found',
        });
      }

      res.json({
        success: true,
        data: verification,
      });
    } catch (error) {
      logger.error('Failed to get verification status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get verification status',
      });
    }
  }

  /**
   * Verify a payment
   */
  async verifyPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { customerInfo } = req.body;

      const verification = await verificationService.verifyPayment(id, customerInfo);

      res.json({
        success: true,
        data: verification,
      });
    } catch (error) {
      logger.error('Failed to verify payment:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify payment',
      });
    }
  }

  /**
   * Scan QR code
   */
  async scanQRCode(req: Request, res: Response) {
    try {
      const { qrData, customerInfo } = req.body;

      const verification = await verificationService.scanQRCode(qrData, customerInfo);

      res.json({
        success: true,
        data: verification,
      });
    } catch (error) {
      logger.error('Failed to scan QR code:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scan QR code',
      });
    }
  }

  /**
   * Generate payment link
   */
  async generatePaymentLink(req: AuthRequest, res: Response) {
    try {
      const { amount, currency, description, successUrl, cancelUrl } = req.body;
      const merchantId = req.user?.id;

      if (!merchantId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const link = await verificationService.generatePaymentLink({
        amount,
        currency,
        description,
        merchantId,
        successUrl,
        cancelUrl,
      });

      res.status(201).json({
        success: true,
        data: link,
      });
    } catch (error) {
      logger.error('Failed to generate payment link:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate payment link',
      });
    }
  }

  /**
   * Create in-store QR code
   */
  async createInStoreQRCode(req: AuthRequest, res: Response) {
    try {
      const { terminalId, amount, currency } = req.body;
      const merchantId = req.user?.id;

      if (!merchantId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const qrCode = await verificationService.createInStoreQRCode({
        merchantId,
        terminalId,
        amount,
        currency,
      });

      res.status(201).json({
        success: true,
        data: qrCode,
      });
    } catch (error) {
      logger.error('Failed to create in-store QR code:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create in-store QR code',
      });
    }
  }

  /**
   * Get merchant's verifications
   */
  async getMerchantVerifications(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.user?.id;

      if (!merchantId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const verifications = await verificationService.getMerchantVerifications(merchantId);

      res.json({
        success: true,
        data: verifications,
      });
    } catch (error) {
      logger.error('Failed to get merchant verifications:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get verifications',
      });
    }
  }
}
