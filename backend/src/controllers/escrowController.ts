import { Request, Response } from 'express';
import { EscrowService } from '../services/escrow/escrowService';
import { logger } from '../utils/logger';

const escrowService = new EscrowService();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class EscrowController {
  /**
   * Create a new escrow
   */
  async createEscrow(req: AuthRequest, res: Response) {
    try {
      const { sellerId, amount, currency, description, conditions, paymentMethod } = req.body;
      const buyerId = req.user?.id;

      if (!buyerId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const escrow = await escrowService.createEscrow({
        buyerId,
        sellerId,
        amount,
        currency,
        description,
        conditions,
        paymentMethod,
      });

      res.status(201).json({
        success: true,
        data: escrow,
      });
    } catch (error) {
      logger.error('Failed to create escrow:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create escrow',
      });
    }
  }

  /**
   * Get escrow by ID
   */
  async getEscrow(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const escrow = await escrowService.getEscrow(id);

      if (!escrow) {
        return res.status(404).json({
          success: false,
          error: 'Escrow not found',
        });
      }

      // Verify user is buyer or seller
      if (escrow.buyerId !== userId && escrow.sellerId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this escrow',
        });
      }

      res.json({
        success: true,
        data: escrow,
      });
    } catch (error) {
      logger.error('Failed to get escrow:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get escrow',
      });
    }
  }

  /**
   * Get user's escrows
   */
  async getUserEscrows(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { limit, offset } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const escrows = await escrowService.getUserEscrows(
        userId,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );

      res.json({
        success: true,
        data: escrows,
      });
    } catch (error) {
      logger.error('Failed to get user escrows:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get escrows',
      });
    }
  }

  /**
   * Fund an escrow
   */
  async fundEscrow(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const escrow = await escrowService.getEscrow(id);

      if (!escrow) {
        return res.status(404).json({
          success: false,
          error: 'Escrow not found',
        });
      }

      // Verify user is buyer
      if (escrow.buyerId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Only buyer can fund escrow',
        });
      }

      const fundedEscrow = await escrowService.fundEscrow(id, paymentMethod);

      res.json({
        success: true,
        data: fundedEscrow,
      });
    } catch (error) {
      logger.error('Failed to fund escrow:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fund escrow',
      });
    }
  }

  /**
   * Release escrow funds
   */
  async releaseEscrow(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const escrow = await escrowService.getEscrow(id);

      if (!escrow) {
        return res.status(404).json({
          success: false,
          error: 'Escrow not found',
        });
      }

      // Verify user is buyer or arbiter
      if (escrow.buyerId !== userId && escrow.arbiterId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to release escrow',
        });
      }

      const releasedEscrow = await escrowService.releaseEscrow(id, userId);

      res.json({
        success: true,
        data: releasedEscrow,
      });
    } catch (error) {
      logger.error('Failed to release escrow:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release escrow',
      });
    }
  }

  /**
   * Raise a dispute
   */
  async raiseDispute(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reason, arbiterId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const escrow = await escrowService.getEscrow(id);

      if (!escrow) {
        return res.status(404).json({
          success: false,
          error: 'Escrow not found',
        });
      }

      // Verify user is buyer or seller
      if (escrow.buyerId !== userId && escrow.sellerId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to raise dispute',
        });
      }

      const dispute = await escrowService.raiseDispute(id, userId, reason, arbiterId);

      res.status(201).json({
        success: true,
        data: dispute,
      });
    } catch (error) {
      logger.error('Failed to raise dispute:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to raise dispute',
      });
    }
  }

  /**
   * Resolve a dispute
   */
  async resolveDispute(req: AuthRequest, res: Response) {
    try {
      const { disputeId } = req.params;
      const { resolution, refundBuyer } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const dispute = await escrowService.getDispute(disputeId);

      if (!dispute) {
        return res.status(404).json({
          success: false,
          error: 'Dispute not found',
        });
      }

      // Verify user is arbiter
      if (dispute.arbiterId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Only arbiter can resolve dispute',
        });
      }

      const resolvedDispute = await escrowService.resolveDispute(disputeId, resolution, refundBuyer);

      res.json({
        success: true,
        data: resolvedDispute,
      });
    } catch (error) {
      logger.error('Failed to resolve dispute:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve dispute',
      });
    }
  }

  /**
   * Refund an escrow
   */
  async refundEscrow(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const escrow = await escrowService.getEscrow(id);

      if (!escrow) {
        return res.status(404).json({
          success: false,
          error: 'Escrow not found',
        });
      }

      // Verify user is buyer or arbiter
      if (escrow.buyerId !== userId && escrow.arbiterId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to refund escrow',
        });
      }

      const refundedEscrow = await escrowService.refundEscrow(id);

      res.json({
        success: true,
        data: refundedEscrow,
      });
    } catch (error) {
      logger.error('Failed to refund escrow:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refund escrow',
      });
    }
  }
}
