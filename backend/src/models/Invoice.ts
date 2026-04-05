import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Invoice } from '../types/payment';
import { getDatabase } from '../config/database';
import { logger } from '../utils/logger';

export class InvoiceModel {
  private pool: Pool;

  constructor() {
    this.pool = getDatabase().getPool();
  }

  /**
   * Create a new invoice
   */
  async create(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO invoices (
        id, invoice_number, user_id, customer_email, customer_name,
        items, subtotal, tax, total, currency, status, due_date,
        notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      id,
      invoiceData.invoiceNumber,
      invoiceData.userId,
      invoiceData.customerEmail,
      invoiceData.customerName,
      JSON.stringify(invoiceData.items),
      invoiceData.subtotal,
      invoiceData.tax,
      invoiceData.total,
      invoiceData.currency,
      invoiceData.status,
      invoiceData.dueDate,
      invoiceData.notes,
      now,
      now,
    ];

    try {
      const result = await this.pool.query(query, values);
      return this.mapToInvoice(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  /**
   * Get invoice by ID
   */
  async findById(id: string): Promise<Invoice | null> {
    const query = 'SELECT * FROM invoices WHERE id = $1';

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapToInvoice(result.rows[0]);
    } catch (error) {
      logger.error('Failed to find invoice:', error);
      throw new Error('Failed to find invoice');
    }
  }

  /**
   * Get invoice by invoice number
   */
  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    const query = 'SELECT * FROM invoices WHERE invoice_number = $1';

    try {
      const result = await this.pool.query(query, [invoiceNumber]);
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapToInvoice(result.rows[0]);
    } catch (error) {
      logger.error('Failed to find invoice:', error);
      throw new Error('Failed to find invoice');
    }
  }

  /**
   * Get all invoices for a user
   */
  async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Invoice[]> {
    const query = `
      SELECT * FROM invoices 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await this.pool.query(query, [userId, limit, offset]);
      return result.rows.map(row => this.mapToInvoice(row));
    } catch (error) {
      logger.error('Failed to find invoices:', error);
      throw new Error('Failed to find invoices');
    }
  }

  /**
   * Update invoice status
   */
  async updateStatus(id: string, status: Invoice['status'], paymentMethod?: string, transactionId?: string): Promise<Invoice> {
    const query = `
      UPDATE invoices 
      SET status = $1, payment_method = $2, transaction_id = $3, 
          paid_at = CASE WHEN $1 = 'paid' THEN NOW() ELSE paid_at END,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, [status, paymentMethod, transactionId, id]);
      if (result.rows.length === 0) {
        throw new Error('Invoice not found');
      }
      return this.mapToInvoice(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update invoice status:', error);
      throw new Error('Failed to update invoice status');
    }
  }

  /**
   * Generate next invoice number
   */
  async generateInvoiceNumber(): Promise<string> {
    const query = `
      SELECT invoice_number FROM invoices 
      WHERE invoice_number LIKE 'INV-%' 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    try {
      const result = await this.pool.query(query);
      
      if (result.rows.length === 0) {
        return 'INV-000001';
      }

      const lastNumber = result.rows[0].invoice_number;
      const numberPart = parseInt(lastNumber.split('-')[1], 10);
      const nextNumber = numberPart + 1;
      
      return `INV-${nextNumber.toString().padStart(6, '0')}`;
    } catch (error) {
      logger.error('Failed to generate invoice number:', error);
      return `INV-${Date.now()}`;
    }
  }

  /**
   * Map database row to Invoice object
   */
  private mapToInvoice(row: any): Invoice {
    return {
      id: row.id,
      invoiceNumber: row.invoice_number,
      userId: row.user_id,
      customerEmail: row.customer_email,
      customerName: row.customer_name,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      subtotal: parseFloat(row.subtotal),
      tax: parseFloat(row.tax),
      total: parseFloat(row.total),
      currency: row.currency,
      status: row.status,
      dueDate: new Date(row.due_date),
      paidAt: row.paid_at ? new Date(row.paid_at) : undefined,
      paymentMethod: row.payment_method,
      transactionId: row.transaction_id,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
