import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoicing/invoiceService';
import { logger } from '../utils/logger';

const invoiceService = new InvoiceService();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class InvoiceController {
  /**
   * Create a new invoice
   */
  async createInvoice(req: AuthRequest, res: Response) {
    try {
      const { customerEmail, customerName, items, currency, dueDate, notes, taxRate } = req.body;
      const userId = req.user?.id; // Assuming user is attached by auth middleware

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const invoice = await invoiceService.createInvoice({
        userId,
        customerEmail,
        customerName,
        items,
        currency,
        dueDate: new Date(dueDate),
        notes,
        taxRate,
      });

      res.status(201).json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      logger.error('Failed to create invoice:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice',
      });
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const invoice = await invoiceService.getInvoice(id);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found',
        });
      }

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      logger.error('Failed to get invoice:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get invoice',
      });
    }
  }

  /**
   * Get invoice by invoice number
   */
  async getInvoiceByNumber(req: Request, res: Response) {
    try {
      const { invoiceNumber } = req.params;

      const invoice = await invoiceService.getInvoiceByNumber(invoiceNumber);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found',
        });
      }

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      logger.error('Failed to get invoice:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get invoice',
      });
    }
  }

  /**
   * Get user's invoices
   */
  async getUserInvoices(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { limit, offset } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const invoices = await invoiceService.getUserInvoices(
        userId,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );

      res.json({
        success: true,
        data: invoices,
      });
    } catch (error) {
      logger.error('Failed to get user invoices:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get invoices',
      });
    }
  }

  /**
   * Send invoice to customer
   */
  async sendInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const invoice = await invoiceService.sendInvoice(id);

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      logger.error('Failed to send invoice:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invoice',
      });
    }
  }

  /**
   * Pay an invoice
   */
  async payInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;

      const invoice = await invoiceService.payInvoice(id, paymentMethod);

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      logger.error('Failed to pay invoice:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pay invoice',
      });
    }
  }

  /**
   * Cancel an invoice
   */
  async cancelInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const invoice = await invoiceService.cancelInvoice(id);

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      logger.error('Failed to cancel invoice:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel invoice',
      });
    }
  }

  /**
   * Generate invoice PDF
   */
  async generatePDF(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pdfBuffer = await invoiceService.generateInvoicePDF(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('Failed to generate PDF:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      });
    }
  }
}
