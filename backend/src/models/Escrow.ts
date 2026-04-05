import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Escrow } from '../types/payment';
import { getDatabase } from '../config/database';
import { logger } from '../utils/logger';

export class EscrowModel {
  private pool: Pool;

  constructor() {
    this.pool = getDatabase().getPool();
  }

  /**
   * Create a new escrow
   */
  async create(escrowData: Omit<Escrow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Escrow> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO escrows (
        id, buyer_id, seller_id, amount, currency, status,
        description, conditions, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      id,
      escrowData.buyerId,
      escrowData.sellerId,
      escrowData.amount,
      escrowData.currency,
      escrowData.status,
      escrowData.description,
      JSON.stringify(escrowData.conditions),
      now,
      now,
    ];

    try {
      const result = await this.pool.query(query, values);
      return this.mapToEscrow(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create escrow:', error);
      throw new Error('Failed to create escrow');
    }
  }

  /**
   * Get escrow by ID
   */
  async findById(id: string): Promise<Escrow | null> {
    const query = 'SELECT * FROM escrows WHERE id = $1';

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapToEscrow(result.rows[0]);
    } catch (error) {
      logger.error('Failed to find escrow:', error);
      throw new Error('Failed to find escrow');
    }
  }

  /**
   * Get all escrows for a user (as buyer or seller)
   */
  async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Escrow[]> {
    const query = `
      SELECT * FROM escrows 
      WHERE buyer_id = $1 OR seller_id = $1
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await this.pool.query(query, [userId, limit, offset]);
      return result.rows.map(row => this.mapToEscrow(row));
    } catch (error) {
      logger.error('Failed to find escrows:', error);
      throw new Error('Failed to find escrows');
    }
  }

  /**
   * Update escrow status
   */
  async updateStatus(id: string, status: Escrow['status'], additionalData?: Partial<Escrow>): Promise<Escrow> {
    let query = `
      UPDATE escrows 
      SET status = $1, updated_at = NOW()
    `;
    const values: any[] = [status];
    let paramIndex = 2;

    if (additionalData?.fundedAt) {
      query += `, funded_at = $${paramIndex}`;
      values.push(additionalData.fundedAt);
      paramIndex++;
    }

    if (additionalData?.releasedAt) {
      query += `, released_at = $${paramIndex}`;
      values.push(additionalData.releasedAt);
      paramIndex++;
    }

    if (additionalData?.disputeReason) {
      query += `, dispute_reason = $${paramIndex}`;
      values.push(additionalData.disputeReason);
      paramIndex++;
    }

    if (additionalData?.arbiterId) {
      query += `, arbiter_id = ${paramIndex}`;
      values.push(additionalData.arbiterId);
      paramIndex++;
    }

    if (additionalData?.transactionId) {
      query += `, transaction_id = ${paramIndex}`;
      values.push(additionalData.transactionId);
      paramIndex++;
    }

    query += ` WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    try {
      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Escrow not found');
      }
      return this.mapToEscrow(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update escrow status:', error);
      throw new Error('Failed to update escrow status');
    }
  }

  /**
   * Fund an escrow
   */
  async fund(id: string, transactionId: string): Promise<Escrow> {
    return this.updateStatus(id, 'funded', { fundedAt: new Date(), transactionId });
  }

  /**
   * Release escrow funds
   */
  async release(id: string): Promise<Escrow> {
    return this.updateStatus(id, 'released', { releasedAt: new Date() });
  }

  /**
   * Raise a dispute
   */
  async dispute(id: string, reason: string, arbiterId: string): Promise<Escrow> {
    return this.updateStatus(id, 'disputed', { disputeReason: reason, arbiterId });
  }

  /**
   * Refund escrow
   */
  async refund(id: string): Promise<Escrow> {
    return this.updateStatus(id, 'refunded');
  }

  /**
   * Map database row to Escrow object
   */
  private mapToEscrow(row: any): Escrow {
    return {
      id: row.id,
      buyerId: row.buyer_id,
      sellerId: row.seller_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status,
      description: row.description,
      conditions: typeof row.conditions === 'string' ? JSON.parse(row.conditions) : row.conditions,
      fundedAt: row.funded_at ? new Date(row.funded_at) : undefined,
      releasedAt: row.released_at ? new Date(row.released_at) : undefined,
      disputeReason: row.dispute_reason,
      arbiterId: row.arbiter_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
