import { Request, Response } from 'express';
import { getEnhancedStellarService } from '../services/stellar/enhancedStellarService';
import { logger } from '../utils/logger';
import { env } from '../config/environment';

const stellarService = getEnhancedStellarService();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class StellarController {
  /**
   * Create a new Stellar account
   */
  async createAccount(req: AuthRequest, res: Response) {
    try {
      const { startingBalance } = req.body;

      const account = await stellarService.createAccount(startingBalance || '1.0');

      res.status(201).json({
        success: true,
        data: account,
      });
    } catch (error) {
      logger.error('Failed to create account:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create account',
      });
    }
  }

  /**
   * Send payment
   */
  async sendPayment(req: AuthRequest, res: Response) {
    try {
      const { destination, amount, asset, memo } = req.body;

      const result = await stellarService.sendPayment({
        destination,
        amount,
        asset: asset || 'XLM',
        memo,
      });

      if (result.success) {
        res.json({
          success: true,
          data: {
            transactionHash: result.hash,
            message: result.message,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message,
        });
      }
    } catch (error) {
      logger.error('Failed to send payment:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send payment',
      });
    }
  }

  /**
   * Create multi-signature account
   */
  async createMultiSigAccount(req: AuthRequest, res: Response) {
    try {
      const { signers, thresholds } = req.body;

      const account = await stellarService.createMultiSigAccount({
        accountId: '', // Will be generated
        signers,
        thresholds,
      });

      res.status(201).json({
        success: true,
        data: account,
      });
    } catch (error) {
      logger.error('Failed to create multi-sig account:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create multi-sig account',
      });
    }
  }

  /**
   * Get account details
   */
  async getAccount(req: Request, res: Response) {
    try {
      const { publicKey } = req.params;

      const account = await stellarService.getAccount(publicKey);

      res.json({
        success: true,
        data: account,
      });
    } catch (error) {
      logger.error('Failed to get account:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get account',
      });
    }
  }

  /**
   * Get account balance
   */
  async getBalance(req: Request, res: Response) {
    try {
      const { publicKey } = req.params;
      const { asset } = req.query;

      const balance = await stellarService.getBalance(publicKey, asset as string || 'XLM');

      res.json({
        success: true,
        data: {
          publicKey,
          asset: asset || 'XLM',
          balance,
        },
      });
    } catch (error) {
      logger.error('Failed to get balance:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get balance',
      });
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(req: Request, res: Response) {
    try {
      const { publicKey } = req.params;
      const { limit } = req.query;

      const payments = await stellarService.getPaymentHistory(
        publicKey,
        limit ? parseInt(limit as string) : 10
      );

      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      logger.error('Failed to get payment history:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get payment history',
      });
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(req: Request, res: Response) {
    try {
      const { hash } = req.params;

      const status = await stellarService.getTransactionStatus(hash);

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error('Failed to get transaction status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get transaction status',
      });
    }
  }

  /**
   * Establish trustline
   */
  async establishTrustline(req: AuthRequest, res: Response) {
    try {
      const { accountId, assetCode, issuerPublicKey, limit } = req.body;

      const asset = await stellarService.createAsset(assetCode, issuerPublicKey);
      const hash = await stellarService.establishTrustline(accountId, asset, limit);

      res.json({
        success: true,
        data: {
          transactionHash: hash,
          message: 'Trustline established successfully',
        },
      });
    } catch (error) {
      logger.error('Failed to establish trustline:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to establish trustline',
      });
    }
  }

  /**
   * Path payment (cross-asset payment)
   */
  async pathPayment(req: AuthRequest, res: Response) {
    try {
      const { destination, sendAsset, sendAmount, destAsset, destMin, path } = req.body;

      const result = await stellarService.pathPayment({
        destination,
        sendAsset,
        sendAmount,
        destAsset,
        destMin,
        path,
      });

      if (result.success) {
        res.json({
          success: true,
          data: {
            transactionHash: result.hash,
            message: 'Path payment successful',
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Path payment failed',
        });
      }
    } catch (error) {
      logger.error('Failed to process path payment:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process path payment',
      });
    }
  }

  /**
   * Get server info
   */
  async getServerInfo(_req: Request, res: Response) {
    try {
      const publicKey = stellarService.getPublicKey();
      const networkPassphrase = stellarService.getNetworkPassphrase();

      res.json({
        success: true,
        data: {
          serverUrl: env.STELLAR_SERVER_URL,
          network: env.STELLAR_NETWORK,
          publicKey,
          networkPassphrase,
        },
      });
    } catch (error) {
      logger.error('Failed to get server info:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get server info',
      });
    }
  }
}
