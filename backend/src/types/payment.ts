export type PaymentMethod = 'mpesa' | 'card' | 'stellar' | 'bitcoin' | 'ethereum';

export interface PaymentRequest {
  method: PaymentMethod;
  amount: number;
  currency: string;
  reference: string;
  description: string;
  phoneNumber?: string;
  destinationAddress?: string;
  asset?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string | null;
  message?: string;
  error?: string;
  clientSecret?: string;
  redirectUrl?: string;
  paymentAddress?: string;
  qrCode?: string;
  expiresAt?: Date;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'expired';
  transactionId: string;
  amount: number;
  currency: string;
  paidAt?: Date;
  confirmedAt?: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Escrow {
  id: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: 'created' | 'funded' | 'released' | 'disputed' | 'refunded';
  description: string;
  conditions: string[];
  fundedAt?: Date;
  releasedAt?: Date;
  disputeReason?: string;
  arbiterId?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dispute {
  id: string;
  escrowId: string;
  raisedBy: string;
  reason: string;
  evidence: string[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  resolvedAt?: Date;
  arbiterId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethodConfig {
  method: PaymentMethod;
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  fixedFee: number;
  supportedCurrencies: string[];
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
  source: string;
}
