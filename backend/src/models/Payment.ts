import { getDatabase } from '../config/database';

export interface PaymentRecord {
  id: string;
  amount_KES: number;
  amount_XLM: string;
  recipient_phone: string;
  sender_public_key: string;
  sender_secret_encrypted?: string;
  verification_code: string;
  code_salt: string;
  code_hash: string;
  stellar_tx_hash?: string;
  mpesa_tx_id?: string;
  mpesa_status?: 'pending' | 'success' | 'failed';
  status: 'pending_stellar' | 'on_stellar' | 'mpesa_sent' | 'completed' | 'failed';
  currency: string;
  country: string;
  recipient_country_code?: string;
  exchange_rate?: number;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class PaymentModel {
  /**
   * Create a new payment record
   */
  static async create(payment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentRecord> {
    const db = getDatabase();
    const result = await db.query(
      `INSERT INTO payments (
        amount_KES, amount_XLM, recipient_phone, sender_public_key,
        verification_code, code_salt, code_hash, status, expires_at,
        currency, country, recipient_country_code, exchange_rate
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        payment.amount_KES,
        payment.amount_XLM,
        payment.recipient_phone,
        payment.sender_public_key,
        payment.verification_code,
        payment.code_salt,
        payment.code_hash,
        payment.status,
        payment.expires_at,
        payment.currency || 'KES',
        payment.country || 'KE',
        payment.recipient_country_code || 'KE',
        payment.exchange_rate || 1,
      ]
    );
    return result.rows[0];
  }

  /**
   * Find payment by code hash
   */
  static async findByCodeHash(codeHash: string): Promise<PaymentRecord | null> {
    const db = getDatabase();
    const result = await db.query(
      'SELECT * FROM payments WHERE code_hash = $1 AND status IN ($2, $3)',
      [codeHash, 'pending_stellar', 'on_stellar']
    );
    return result.rows[0] || null;
  }

  /**
   * Find payment by ID
   */
  static async findById(id: string): Promise<PaymentRecord | null> {
    const db = getDatabase();
    const result = await db.query('SELECT * FROM payments WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Update payment status
   */
  static async updateStatus(
    id: string,
    status: PaymentRecord['status'],
    updates?: Partial<Pick<PaymentRecord, 'stellar_tx_hash' | 'mpesa_tx_id' | 'mpesa_status'>>
  ): Promise<PaymentRecord | null> {
    const db = getDatabase();
    
    let query = 'UPDATE payments SET status = $1, updated_at = NOW()';
    const params: any[] = [status, id];
    
    if (updates?.stellar_tx_hash) {
      query += ', stellar_tx_hash = $' + (params.length + 1);
      params.push(updates.stellar_tx_hash);
    }
    if (updates?.mpesa_tx_id) {
      query += ', mpesa_tx_id = $' + (params.length + 1);
      params.push(updates.mpesa_tx_id);
    }
    if (updates?.mpesa_status) {
      query += ', mpesa_status = $' + (params.length + 1);
      params.push(updates.mpesa_status);
    }
    
    query += ' WHERE id = $2 RETURNING *';
    
    const result = await db.query(query, params);
    return result.rows[0] || null;
  }

  /**
   * Get payment history for a sender
   */
  static async getHistory(senderPublicKey: string, limit: number = 20, offset: number = 0): Promise<PaymentRecord[]> {
    const db = getDatabase();
    const result = await db.query(
      'SELECT * FROM payments WHERE sender_public_key = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [senderPublicKey, limit, offset]
    );
    return result.rows;
  }
}

// SQL for creating the payments table
export const CREATE_PAYMENTS_TABLE = `
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_KES INTEGER NOT NULL,
  amount_XLM VARCHAR(50) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  sender_public_key VARCHAR(56) NOT NULL,
  sender_secret_encrypted TEXT,
  verification_code VARCHAR(10) NOT NULL,
  code_salt VARCHAR(64) NOT NULL,
  code_hash VARCHAR(64) NOT NULL UNIQUE,
  stellar_tx_hash VARCHAR(64),
  mpesa_tx_id VARCHAR(50),
  mpesa_status VARCHAR(20),
  status VARCHAR(30) NOT NULL DEFAULT 'pending_stellar',
  currency VARCHAR(10) NOT NULL DEFAULT 'KES',
  country VARCHAR(2) NOT NULL DEFAULT 'KE',
  recipient_country_code VARCHAR(2),
  exchange_rate DECIMAL(20, 10) DEFAULT 1,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_code_hash ON payments(code_hash);
CREATE INDEX IF NOT EXISTS idx_payments_sender ON payments(sender_public_key);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_currency ON payments(currency);
CREATE INDEX IF NOT EXISTS idx_payments_country ON payments(country);
`;