import { EscrowModel } from '../../models/Escrow';
import { DisputeModel } from '../../models/Dispute';
import { PaymentGateway } from '../paymentGateway/paymentGateway';
import { logger } from '../../utils/logger';
import { Escrow, Dispute, PaymentMethod } from '../../types/payment';

export class EscrowService {
  private escrowModel: EscrowModel;
  private disputeModel: DisputeModel;
  private paymentGateway: PaymentGateway;

  constructor() {
    this.escrowModel = new EscrowModel();
    this.disputeModel = new DisputeModel();
    this.paymentGateway = new PaymentGateway();
  }

  /**
   * Create a new escrow
   */
  async createEscrow(params: {
    buyerId: string;
    sellerId: string;
    amount: number;
    currency: string;
    description: string;
    conditions: string[];
    paymentMethod: PaymentMethod;
  }): Promise<Escrow> {
    try {
      logger.info(`Creating escrow: ${params.amount} ${params.currency} between ${params.buyerId} and ${params.sellerId}`);

      // Create escrow record
      const escrow = await this.escrowModel.create({
        buyerId: params.buyerId,
        sellerId: params.sellerId,
        amount: params.amount,
        currency: params.currency,
        status: 'created',
        description: params.description,
        conditions: params.conditions,
      });

      // For Stellar, create a multi-signature account
      if (params.paymentMethod === 'stellar') {
        await this.createMultiSigAccount(escrow);
      }

      logger.info(`Escrow created: ${escrow.id}`);
      return escrow;
    } catch (error) {
      logger.error('Failed to create escrow:', error);
      throw new Error(`Escrow creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fund an escrow
   */
  async fundEscrow(escrowId: string, paymentMethod: PaymentMethod): Promise<Escrow> {
    try {
      const escrow = await this.escrowModel.findById(escrowId);
      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (escrow.status !== 'created') {
        throw new Error('Escrow cannot be funded in current status');
      }

      logger.info(`Funding escrow: ${escrowId}`);

      // Process payment based on method
      const paymentResponse = await this.paymentGateway.processPayment({
        method: paymentMethod,
        amount: escrow.amount,
        currency: escrow.currency,
        reference: `ESCROW-${escrowId}`,
        description: `Escrow funding for: ${escrow.description}`,
      });

      if (!paymentResponse.success) {
        throw new Error(`Payment failed: ${paymentResponse.error}`);
      }

      // Update escrow status
      const fundedEscrow = await this.escrowModel.fund(escrowId, paymentResponse.transactionId!);

      logger.info(`Escrow funded: ${escrowId}`);
      return fundedEscrow;
    } catch (error) {
      logger.error('Failed to fund escrow:', error);
      throw new Error(`Escrow funding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Release escrow funds to seller
   */
  async releaseEscrow(escrowId: string, releasedBy: string): Promise<Escrow> {
    try {
      const escrow = await this.escrowModel.findById(escrowId);
      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (escrow.status !== 'funded') {
        throw new Error('Escrow cannot be released in current status');
      }

      // Verify all conditions are met
      const conditionsMet = await this.verifyConditions(escrow);
      if (!conditionsMet) {
        throw new Error('Not all conditions are met for release');
      }

      logger.info(`Releasing escrow: ${escrowId} by ${releasedBy}`);

      // For Stellar, release from multi-signature account
      if (escrow.currency === 'XLM') {
        await this.releaseFromMultiSig(escrow);
      } else {
        // For other methods, transfer to seller
        await this.transferToSeller(escrow);
      }

      // Update escrow status
      const releasedEscrow = await this.escrowModel.release(escrowId);

      logger.info(`Escrow released: ${escrowId}`);
      return releasedEscrow;
    } catch (error) {
      logger.error('Failed to release escrow:', error);
      throw new Error(`Escrow release failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Raise a dispute on an escrow
   */
  async raiseDispute(escrowId: string, raisedBy: string, reason: string, arbiterId: string): Promise<Dispute> {
    try {
      const escrow = await this.escrowModel.findById(escrowId);
      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (escrow.status !== 'funded') {
        throw new Error('Dispute can only be raised on funded escrows');
      }

      logger.info(`Raising dispute on escrow: ${escrowId}`);

      // Update escrow status
      await this.escrowModel.dispute(escrowId, reason, arbiterId);

      // Create dispute record
      const dispute = await this.disputeModel.create({
        escrowId,
        raisedBy,
        reason,
        evidence: [],
        status: 'open',
        arbiterId,
      });

      logger.info(`Dispute created: ${dispute.id}`);
      return dispute;
    } catch (error) {
      logger.error('Failed to raise dispute:', error);
      throw new Error(`Dispute creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Resolve a dispute
   */
  async resolveDispute(disputeId: string, resolution: string, refundBuyer: boolean): Promise<Dispute> {
    try {
      const dispute = await this.disputeModel.findById(disputeId);
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      if (dispute.status !== 'open' && dispute.status !== 'investigating') {
        throw new Error('Dispute cannot be resolved in current status');
      }

      logger.info(`Resolving dispute: ${disputeId}`);

      // Update dispute status
      const resolvedDispute = await this.disputeModel.updateStatus(disputeId, 'resolved', resolution);

      // Handle escrow based on resolution
      const escrow = await this.escrowModel.findById(dispute.escrowId);
      if (escrow) {
        if (refundBuyer) {
          await this.escrowModel.refund(escrow.id);
        } else {
          await this.escrowModel.release(escrow.id);
        }
      }

      logger.info(`Dispute resolved: ${disputeId}`);
      return resolvedDispute;
    } catch (error) {
      logger.error('Failed to resolve dispute:', error);
      throw new Error(`Dispute resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refund an escrow
   */
  async refundEscrow(escrowId: string): Promise<Escrow> {
    try {
      const escrow = await this.escrowModel.findById(escrowId);
      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (escrow.status !== 'funded' && escrow.status !== 'disputed') {
        throw new Error('Escrow cannot be refunded in current status');
      }

      logger.info(`Refunding escrow: ${escrowId}`);

      // Process refund based on payment method
      // This would integrate with the payment gateway to process refunds

      // Update escrow status
      const refundedEscrow = await this.escrowModel.refund(escrowId);

      logger.info(`Escrow refunded: ${escrowId}`);
      return refundedEscrow;
    } catch (error) {
      logger.error('Failed to refund escrow:', error);
      throw new Error(`Escrow refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create multi-signature account for Stellar escrow
   */
  private async createMultiSigAccount(escrow: Escrow): Promise<void> {
    try {
      // In production, create a Stellar account with multi-signature
      // requiring both buyer and seller signatures for release
      logger.info(`Creating multi-signature account for escrow: ${escrow.id}`);
      
      // This would:
      // 1. Create a new Stellar account
      // 2. Add buyer and seller as signers
      // 3. Set thresholds for operations
      // 4. Fund the account with the escrow amount
    } catch (error) {
      logger.error('Failed to create multi-signature account:', error);
      throw error;
    }
  }

  /**
   * Release funds from multi-signature account
   */
  private async releaseFromMultiSig(escrow: Escrow): Promise<void> {
    try {
      // In production, submit a transaction that requires
      // both buyer and seller signatures to release funds
      logger.info(`Releasing from multi-signature account: ${escrow.id}`);
      
      // This would:
      // 1. Create a payment transaction from escrow account to seller
      // 2. Require buyer signature (or arbiter in case of dispute)
      // 3. Submit to Stellar network
    } catch (error) {
      logger.error('Failed to release from multi-signature account:', error);
      throw error;
    }
  }

  /**
   * Transfer funds to seller
   */
  private async transferToSeller(escrow: Escrow): Promise<void> {
    try {
      // For non-Stellar payments, transfer from escrow holding to seller
      logger.info(`Transferring to seller: ${escrow.sellerId}`);
      
      // This would integrate with the payment gateway to
      // transfer funds to the seller's account
    } catch (error) {
      logger.error('Failed to transfer to seller:', error);
      throw error;
    }
  }

  /**
   * Verify escrow conditions are met
   */
  private async verifyConditions(escrow: Escrow): Promise<boolean> {
    try {
      // In production, this would check:
      // 1. Delivery confirmation
      // 2. Service completion
      // 3. Buyer approval
      // 4. Time-based conditions
      // 5. Any custom conditions
      
      logger.info(`Verifying conditions for escrow: ${escrow.id}`);
      
      // For now, return true (all conditions met)
      return true;
    } catch (error) {
      logger.error('Failed to verify conditions:', error);
      return false;
    }
  }

  /**
   * Get escrow by ID
   */
  async getEscrow(escrowId: string): Promise<Escrow | null> {
    return this.escrowModel.findById(escrowId);
  }

  /**
   * Get user's escrows
   */
  async getUserEscrows(userId: string, limit?: number, offset?: number): Promise<Escrow[]> {
    return this.escrowModel.findByUserId(userId, limit, offset);
  }

  /**
   * Get dispute by ID
   */
  async getDispute(disputeId: string): Promise<Dispute | null> {
    return this.disputeModel.findById(disputeId);
  }

  /**
   * Get disputes for an arbiter
   */
  async getArbiterDisputes(arbiterId: string, limit?: number, offset?: number): Promise<Dispute[]> {
    return this.disputeModel.findByArbiterId(arbiterId, limit, offset);
  }
}
