import { InvoiceModel } from '../../models/Invoice';
import { PaymentGateway } from '../paymentGateway/paymentGateway';
import { logger } from '../../utils/logger';
import { Invoice, InvoiceItem, PaymentMethod } from '../../types/payment';

export class InvoiceService {
  private invoiceModel: InvoiceModel;
  private paymentGateway: PaymentGateway;

  constructor() {
    this.invoiceModel = new InvoiceModel();
    this.paymentGateway = new PaymentGateway();
  }

  /**
   * Create a new invoice
   */
  async createInvoice(params: {
    userId: string;
    customerEmail: string;
    customerName: string;
    items: InvoiceItem[];
    currency: string;
    dueDate: Date;
    notes?: string;
    taxRate?: number;
  }): Promise<Invoice> {
    try {
      logger.info(`Creating invoice for customer: ${params.customerEmail}`);

      // Calculate totals
      const subtotal = params.items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * (params.taxRate || 0);
      const total = subtotal + tax;

      // Generate invoice number
      const invoiceNumber = await this.invoiceModel.generateInvoiceNumber();

      // Create invoice
      const invoice = await this.invoiceModel.create({
        invoiceNumber,
        userId: params.userId,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        items: params.items,
        subtotal,
        tax,
        total,
        currency: params.currency,
        status: 'draft',
        dueDate: params.dueDate,
        notes: params.notes,
      });

      logger.info(`Invoice created: ${invoice.invoiceNumber}`);
      return invoice;
    } catch (error) {
      logger.error('Failed to create invoice:', error);
      throw new Error(`Invoice creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send invoice to customer
   */
  async sendInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const invoice = await this.invoiceModel.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status !== 'draft') {
        throw new Error('Invoice can only be sent from draft status');
      }

      logger.info(`Sending invoice: ${invoice.invoiceNumber}`);

      // Update status to sent
      const sentInvoice = await this.invoiceModel.updateStatus(invoiceId, 'sent');

      // Send email to customer (implement email service)
      await this.sendInvoiceEmail(sentInvoice);

      logger.info(`Invoice sent: ${invoice.invoiceNumber}`);
      return sentInvoice;
    } catch (error) {
      logger.error('Failed to send invoice:', error);
      throw new Error(`Invoice sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Pay an invoice
   */
  async payInvoice(invoiceId: string, paymentMethod: PaymentMethod): Promise<Invoice> {
    try {
      const invoice = await this.invoiceModel.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status !== 'sent' && invoice.status !== 'overdue') {
        throw new Error('Invoice cannot be paid in current status');
      }

      logger.info(`Processing payment for invoice: ${invoice.invoiceNumber}`);

      // Process payment
      const paymentResponse = await this.paymentGateway.processPayment({
        method: paymentMethod,
        amount: invoice.total,
        currency: invoice.currency,
        reference: invoice.invoiceNumber,
        description: `Payment for invoice ${invoice.invoiceNumber}`,
      });

      if (!paymentResponse.success) {
        throw new Error(`Payment failed: ${paymentResponse.error}`);
      }

      // Update invoice status
      const paidInvoice = await this.invoiceModel.updateStatus(
        invoiceId,
        'paid',
        paymentMethod,
        paymentResponse.transactionId!
      );

      // Send payment confirmation
      await this.sendPaymentConfirmation(paidInvoice);

      logger.info(`Invoice paid: ${invoice.invoiceNumber}`);
      return paidInvoice;
    } catch (error) {
      logger.error('Failed to pay invoice:', error);
      throw new Error(`Invoice payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel an invoice
   */
  async cancelInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const invoice = await this.invoiceModel.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === 'paid') {
        throw new Error('Paid invoices cannot be cancelled');
      }

      logger.info(`Cancelling invoice: ${invoice.invoiceNumber}`);

      // Update status
      const cancelledInvoice = await this.invoiceModel.updateStatus(invoiceId, 'cancelled');

      logger.info(`Invoice cancelled: ${invoice.invoiceNumber}`);
      return cancelledInvoice;
    } catch (error) {
      logger.error('Failed to cancel invoice:', error);
      throw new Error(`Invoice cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    return this.invoiceModel.findById(invoiceId);
  }

  /**
   * Get invoice by invoice number
   */
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    return this.invoiceModel.findByInvoiceNumber(invoiceNumber);
  }

  /**
   * Get user's invoices
   */
  async getUserInvoices(userId: string, limit?: number, offset?: number): Promise<Invoice[]> {
    return this.invoiceModel.findByUserId(userId, limit, offset);
  }

  /**
   * Check for overdue invoices
   */
  async checkOverdueInvoices(): Promise<void> {
    try {
      // This would be called by a scheduled job
      // Find invoices that are past due date and still in 'sent' status
      // Update their status to 'overdue'
      logger.info('Checking for overdue invoices');
      
      // Implementation would query database for overdue invoices
      // and update their status
    } catch (error) {
      logger.error('Failed to check overdue invoices:', error);
    }
  }

  /**
   * Generate invoice PDF
   */
  async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
    try {
      const invoice = await this.invoiceModel.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      logger.info(`Generating PDF for invoice: ${invoice.invoiceNumber}`);

      // In production, use a PDF generation library like PDFKit
      // For now, return a placeholder
      const pdfContent = this.generatePDFContent(invoice);
      
      return Buffer.from(pdfContent);
    } catch (error) {
      logger.error('Failed to generate invoice PDF:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send invoice email
   */
  private async sendInvoiceEmail(invoice: Invoice): Promise<void> {
    try {
      // In production, integrate with email service (SendGrid, Mailgun, etc.)
      logger.info(`Sending invoice email to: ${invoice.customerEmail}`);
      
      // Email would include:
      // - Invoice number
      // - Due date
      // - Total amount
      // - Payment link
      // - PDF attachment
    } catch (error) {
      logger.error('Failed to send invoice email:', error);
      // Don't throw - email failure shouldn't fail the invoice
    }
  }

  /**
   * Send payment confirmation
   */
  private async sendPaymentConfirmation(invoice: Invoice): Promise<void> {
    try {
      // In production, integrate with email service
      logger.info(`Sending payment confirmation to: ${invoice.customerEmail}`);
      
      // Email would include:
      // - Payment confirmation
      // - Transaction ID
      // - Receipt
    } catch (error) {
      logger.error('Failed to send payment confirmation:', error);
      // Don't throw - email failure shouldn't fail the payment
    }
  }

  /**
   * Generate PDF content (placeholder)
   */
  private generatePDFContent(invoice: Invoice): string {
    return `
INVOICE
=======
Invoice Number: ${invoice.invoiceNumber}
Date: ${invoice.createdAt.toLocaleDateString()}
Due Date: ${invoice.dueDate.toLocaleDateString()}

Bill To:
${invoice.customerName}
${invoice.customerEmail}

Items:
${invoice.items.map(item => 
  `${item.description} - Qty: ${item.quantity} x ${item.unitPrice} = ${item.total}`
).join('\n')}

Subtotal: ${invoice.subtotal}
Tax: ${invoice.tax}
Total: ${invoice.total} ${invoice.currency}

Status: ${invoice.status}
${invoice.notes ? `\nNotes: ${invoice.notes}` : ''}
    `;
  }
}
