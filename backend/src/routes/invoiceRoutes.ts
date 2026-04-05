import { Router } from 'express';
import { InvoiceController } from '../controllers/invoiceController';
import { authenticate } from '../middleware/auth';

const router = Router();
const invoiceController = new InvoiceController();

// All routes require authentication
router.use(authenticate);

// Invoice CRUD
router.post('/', invoiceController.createInvoice.bind(invoiceController));
router.get('/', invoiceController.getUserInvoices.bind(invoiceController));
router.get('/:id', invoiceController.getInvoice.bind(invoiceController));
router.get('/number/:invoiceNumber', invoiceController.getInvoiceByNumber.bind(invoiceController));

// Invoice actions
router.post('/:id/send', invoiceController.sendInvoice.bind(invoiceController));
router.post('/:id/pay', invoiceController.payInvoice.bind(invoiceController));
router.post('/:id/cancel', invoiceController.cancelInvoice.bind(invoiceController));
router.get('/:id/pdf', invoiceController.generatePDF.bind(invoiceController));

export default router;
