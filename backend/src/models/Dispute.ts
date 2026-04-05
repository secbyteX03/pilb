import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Dispute } from '../types/payment';
import { getDatabase } from '../config/database';
import { logger } from '../utils/logger';

export class DisputeModel {
  private pool: Pool;

  constructor() {
    this.pool = getDatabase().getPool();
  }

  /**
   * Create a new dispute
   */
  async create(disputeData: Omit<Dispute, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dispute> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO disputes (
        id, escrow_id, raised_by, reason, evidence, status,
        arbiter_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      id,
      disputeData.escrowId,
      disputeData.raisedBy,
      disputeData.reason,
      JSON.stringify(disputeData.evidence),
      disputeData.status,
      disputeData.arbiterId,
      now,
      now,
    ];

    try {
      const result = await this.pool.query(query, values);
      return this.mapToDispute(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create dispute:', error);
      throw new Error('Failed to create dispute');
    }
  }

  /**
   * Get dispute by ID
   */
  async findById(id: string): Promise<Dispute | null> {
    const query = 'SELECT * FROM disputes WHERE id = $1';

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapToDispute(result.rows[0]);
    } catch (error) {
      logger.error('Failed to find dispute:', error);
      throw new Error('Failed to find dispute');
    }
  }

  /**
   * Get dispute by escrow ID
   */
  async findByEscrowId(escrowId: string): Promise<Dispute | null> {
    const query = 'SELECT * FROM disputes WHERE escrow_id = $1';

    try {
      const result = await this.pool.query(query, [escrowId]);
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapToDispute(result.rows[0]);
    } catch (error) {
      logger.error('Failed to find dispute:', error);
      throw new Error('Failed to find dispute');
    }
  }

  /**
   * Get all disputes for an arbiter
   */
  async findByArbiterId(arbiterId: string, limit: number = 50, offset: number = 0): Promise<Dispute[]> {
    const query = `
      SELECT * FROM disputes 
      WHERE arbiter_id = $1
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await this.pool.query(query, [arbiterId, limit, offset]);
      return result.rows.map(row => this.mapToDispute(row));
    } catch (error) {
      logger.error('Failed to find disputes:', error);
      throw new Error('Failed to find disputes');
    }
  }

  /**
   * Update dispute status
   */
  async updateStatus(id: string, status: Dispute['status'], resolution?: string): Promise<Dispute> {
    const query = `
      UPDATE disputes 
      SET status = $1, resolution = $2, 
          resolved_at = CASE WHEN $1 IN ('resolved', 'closed') THEN NOW() ELSE resolved_at END,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, [status, resolution, id]);
      if (result.rows.length === 0) {
        throw new Error('Dispute not found');
      }
      return this.mapToDispute(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update dispute status:', error);
      throw new Error('Failed to update dispute status');
    }
  }

  /**
   * Add evidence to dispute
   */
  async addEvidence(id: string, evidenceUrl: string): Promise<Dispute> {
    const query = `
      UPDATE disputes 
      SET evidence = evidence || $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, [JSON.stringify([evidenceUrl]), id]);
      if (result.rows.length === 0) {
        throw new Error('Dispute not found');
      }
      return this.mapToDispute(result.rows[0]);
    } catch (error) {
      logger.error('Failed to add evidence:', error);
      throw new Error('Failed to add evidence');
    }
  }

  /**
   * Map database row to Dispute object
   */
  private mapToDispute(row: any): Dispute {
    return {
      id: row.id,
      escrowId: row.escrow_id,
      raisedBy: row.raised_by,
      reason: row.reason,
      evidence: typeof row.evidence === 'string' ? JSON.parse(row.evidence) : row.evidence,
      status: row.status,
      resolution: row.resolution,
      resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
      arbiterId: row.arbiter_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
