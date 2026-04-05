import { apiClient } from './client';

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
  expiresAt?: string;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'expired';
  transactionId: string;
  amount: number;
  currency: string;
  paidAt?: string;
  confirmedAt?: string;
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
  dueDate: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  fundedAt?: string;
  releasedAt?: string;
  disputeReason?: string;
  arbiterId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dispute {
  id: string;
  escrowId: string;
  raisedBy: string;
  reason: string;
  evidence: string[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  resolvedAt?: string;
  arbiterId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentVerification {
  verificationId: string;
  transactionId: string;
  amount: number;
  currency: string;
  merchantId: string;
  description: string;
  qrCode: string;
  expiresAt: string;
  status: 'pending' | 'verified' | 'expired' | 'failed';
  verifiedAt?: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface StellarAccount {
  publicKey: string;
  balances: Array<{
    asset: string;
    balance: string;
    limit?: string;
  }>;
  sequence: string;
  signers: Array<{
    key: string;
    weight: number;
    type: string;
  }>;
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

// Payment API
export const paymentApi = {
  // Initiate payment (for Send Money feature)
  initiate: async (data: {
    amount: number;
    recipientPhone: string;
    senderPublicKey: string;
  }): Promise<{
    paymentId: string;
    verificationCode: string;
    amount: number;
    amountXLM: string;
    recipientPhone: string;
    stellarTransaction: {
      destination: string;
      amount: string;
      memo: string;
    };
  }> => {
    const response = await apiClient.post('/api/payments/initiate', data);
    return response.data;
  },

  // Process payment
  processPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    const response = await apiClient.post('/api/payments/process', request);
    return response.data;
  },

  // Confirm payment (for Send Money feature)
  confirm: async (paymentId: string, stellarTxHash: string): Promise<void> => {
    await apiClient.post('/api/payments/confirm', { paymentId, stellarTxHash });
  },

  // Get payment status
  getPaymentStatus: async (transactionId: string, method: PaymentMethod): Promise<PaymentStatus> => {
    const response = await apiClient.get(`/api/payments/${transactionId}/status?method=${method}`);
    return response.data;
  },

  // Get available payment methods
  getAvailableMethods: async (currency: string): Promise<PaymentMethod[]> => {
    const response = await apiClient.get(`/api/payments/methods?currency=${currency}`);
    return response.data;
  },

  // Get exchange rate
  getExchangeRate: async (from: string, to: string): Promise<number> => {
    const response = await apiClient.get(`/api/payments/exchange-rate?from=${from}&to=${to}`);
    return response.data;
  },

  // Initiate cross-border payment
  initiateCrossBorder: async (data: {
    amount: number;
    recipientPhone: string;
    senderPublicKey: string;
    currency: string;
    recipientCountry: string;
  }): Promise<{
    paymentId: string;
    verificationCode: string;
    amount: number;
    amountXLM: string;
    recipientPhone: string;
    currency: string;
    country: string;
    exchangeRate: number;
    stellarTransaction: {
      destination: string;
      amount: string;
      memo: string;
    };
  }> => {
    const response = await apiClient.post('/api/payments/initiate-cross-border', data);
    return response.data;
  },

  // Get supported currencies
  getSupportedCurrencies: async (): Promise<Array<{
    code: string;
    name: string;
    symbol: string;
    type?: 'fiat' | 'stellar_asset';
  }>> => {
    const response = await apiClient.get('/api/payments/currencies');
    return response.data.currencies;
  },

  // Create payment link
  createPaymentLink: async (params: {
    amount: number;
    currency: string;
    description?: string;
    merchantId: string;
    successUrl?: string;
    cancelUrl?: string;
    expiresIn?: number;
  }): Promise<{
    linkId: string;
    url: string;
    verificationCode: string;
    amount: number;
    amountXLM: string;
    currency: string;
    description: string;
    expiresAt: string;
  }> => {
    const response = await apiClient.post('/api/payments/link', params);
    return response.data;
  },

  // Get payment link
  getPaymentLink: async (id: string): Promise<{
    linkId: string;
    amount: number;
    amountXLM: string;
    currency: string;
    description: string;
    verificationCode: string;
    status: string;
  }> => {
    const response = await apiClient.get(`/api/payments/link/${id}`);
    return response.data;
  },

  // Create scheduled payment
  createScheduledPayment: async (params: {
    amount: number;
    recipientPhone: string;
    senderPublicKey: string;
    currency?: string;
    scheduleDate: string;
    recurring?: boolean;
    interval?: string;
  }): Promise<{
    scheduledId: string;
    verificationCode: string;
    amount: number;
    amountXLM: string;
    recipientPhone: string;
    currency: string;
    scheduleDate: string;
    recurring: boolean;
    interval?: string;
    status: string;
  }> => {
    const response = await apiClient.post('/api/payments/scheduled', params);
    return response.data;
  },

  // Get scheduled payment
  getScheduledPayment: async (id: string): Promise<{
    scheduledId: string;
    amount: number;
    amountXLM: string;
    recipientPhone: string;
    currency: string;
    scheduleDate: string;
    recurring: boolean;
    status: string;
  }> => {
    const response = await apiClient.get(`/api/payments/scheduled/${id}`);
    return response.data;
  },

  // Cancel scheduled payment
  cancelScheduledPayment: async (id: string): Promise<{
    scheduledId: string;
    status: string;
    message: string;
  }> => {
    const response = await apiClient.post(`/api/payments/scheduled/${id}/cancel`);
    return response.data;
  },

  // Delete scheduled payment
  deleteScheduledPayment: async (id: string): Promise<{
    scheduledId: string;
    status: string;
  }> => {
    const response = await apiClient.delete(`/api/payments/scheduled/${id}`);
    return response.data;
  },

  // Update scheduled payment
  updateScheduledPayment: async (id: string, data: {
    amount?: number;
    recipientPhone?: string;
    scheduleDate?: string;
    currency?: string;
    recurring?: boolean;
    interval?: string;
  }): Promise<{
    scheduledId: string;
    amount: number;
    amountXLM: string;
    recipientPhone: string;
    currency: string;
    scheduleDate: string;
    recurring: boolean;
    interval?: string;
    status: string;
  }> => {
    const response = await apiClient.put(`/api/payments/scheduled/${id}`, data);
    return response.data;
  },

  // Get scheduled payments for user
  getScheduledPayments: async (publicKey: string): Promise<{
    scheduledPayments: Array<{
      scheduledId: string;
      amount: number;
      amountXLM: string;
      recipientPhone: string;
      currency: string;
      scheduleDate: string;
      recurring: boolean;
      status: string;
    }>;
    total: number;
  }> => {
    const response = await apiClient.get('/api/payments/scheduled', { params: { publicKey } });
    return response.data;
  },
};

// Invoice API
export const invoiceApi = {
  // Create invoice
  createInvoice: async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> => {
    const response = await apiClient.post('/api/invoices', invoice);
    return response.data;
  },

  // Get invoice
  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get(`/api/invoices/${id}`);
    return response.data;
  },

  // Get user invoices
  getUserInvoices: async (limit?: number, offset?: number): Promise<Invoice[]> => {
    const response = await apiClient.get('/api/invoices', { params: { limit, offset } });
    return response.data;
  },

  // Send invoice
  sendInvoice: async (id: string): Promise<Invoice> => {
    const response = await apiClient.post(`/api/invoices/${id}/send`);
    return response.data;
  },

  // Pay invoice
  payInvoice: async (id: string, paymentMethod: PaymentMethod): Promise<Invoice> => {
    const response = await apiClient.post(`/api/invoices/${id}/pay`, { paymentMethod });
    return response.data;
  },

  // Cancel invoice
  cancelInvoice: async (id: string): Promise<Invoice> => {
    const response = await apiClient.post(`/api/invoices/${id}/cancel`);
    return response.data;
  },

  // Generate PDF
  generatePDF: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },
};

// Escrow API
export const escrowApi = {
  // Create escrow
  createEscrow: async (escrow: Omit<Escrow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Escrow> => {
    const response = await apiClient.post('/api/escrow', escrow);
    return response.data;
  },

  // Get escrow
  getEscrow: async (id: string): Promise<Escrow> => {
    const response = await apiClient.get(`/api/escrow/${id}`);
    return response.data;
  },

  // Get user escrows
  getUserEscrows: async (limit?: number, offset?: number): Promise<Escrow[]> => {
    const response = await apiClient.get('/api/escrow', { params: { limit, offset } });
    return response.data;
  },

  // Fund escrow
  fundEscrow: async (id: string, paymentMethod: PaymentMethod): Promise<Escrow> => {
    const response = await apiClient.post(`/api/escrow/${id}/fund`, { paymentMethod });
    return response.data;
  },

  // Release escrow
  releaseEscrow: async (id: string): Promise<Escrow> => {
    const response = await apiClient.post(`/api/escrow/${id}/release`);
    return response.data;
  },

  // Raise dispute
  raiseDispute: async (id: string, reason: string, arbiterId: string): Promise<Dispute> => {
    const response = await apiClient.post(`/api/escrow/${id}/dispute`, { reason, arbiterId });
    return response.data;
  },

  // Resolve dispute
  resolveDispute: async (disputeId: string, resolution: string, refundBuyer: boolean): Promise<Dispute> => {
    const response = await apiClient.post(`/api/escrow/dispute/${disputeId}/resolve`, { resolution, refundBuyer });
    return response.data;
  },

  // Refund escrow
  refundEscrow: async (id: string): Promise<Escrow> => {
    const response = await apiClient.post(`/api/escrow/${id}/refund`);
    return response.data;
  },
};

// Verification API
export const verificationApi = {
  // Create verification
  createVerification: async (params: {
    amount: number;
    currency: string;
    merchantId: string;
    description: string;
    expiresInMinutes?: number;
  }): Promise<PaymentVerification> => {
    const response = await apiClient.post('/api/verify', params);
    return response.data;
  },

  // Get verification status
  getVerificationStatus: async (id: string): Promise<PaymentVerification> => {
    const response = await apiClient.get(`/api/verify/${id}`);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (id: string, customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<PaymentVerification> => {
    const response = await apiClient.post(`/api/verify/${id}/verify`, { customerInfo });
    return response.data;
  },

  // Scan QR code
  scanQRCode: async (qrData: string, customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<PaymentVerification> => {
    const response = await apiClient.post('/api/verify/scan', { qrData, customerInfo });
    return response.data;
  },

  // Generate payment link
  generatePaymentLink: async (params: {
    amount: number;
    currency: string;
    description: string;
    merchantId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ linkId: string; url: string; qrCode: string }> => {
    const response = await apiClient.post('/api/verify/link', params);
    return response.data;
  },

  // Create in-store QR code
  createInStoreQRCode: async (params: {
    merchantId: string;
    terminalId: string;
    amount?: number;
    currency: string;
  }): Promise<{ qrCode: string; expiresAt: string }> => {
    const response = await apiClient.post('/api/verify/in-store', params);
    return response.data;
  },

  // Get merchant verifications
  getMerchantVerifications: async (): Promise<PaymentVerification[]> => {
    const response = await apiClient.get('/api/verify/merchant/all');
    return response.data;
  },
};

// Auth API
export const authApi = {
  // Get challenge for wallet authentication
  getChallenge: async (publicKey: string): Promise<{ transaction: string; networkPassphrase: string; expiresAt: string }> => {
    const response = await apiClient.get('/api/auth/challenge', { params: { publicKey } });
    return response.data;
  },

  // Authenticate with signed challenge
  authenticate: async (publicKey: string, signedTransaction: string): Promise<{ token: string; publicKey: string }> => {
    const response = await apiClient.post('/api/auth/authenticate', { publicKey, signedTransaction });
    return response.data;
  },

  // Verify existing token
  verifyToken: async (token: string): Promise<{ publicKey: string; valid: boolean }> => {
    const response = await apiClient.get('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },
};

// Stellar API
export const stellarApi = {
  // Get server info
  getServerInfo: async (): Promise<{
    serverUrl: string;
    network: string;
    publicKey: string;
    networkPassphrase: string;
  }> => {
    const response = await apiClient.get('/api/stellar/server');
    return response.data;
  },

  // Get account
  getAccount: async (publicKey: string): Promise<StellarAccount> => {
    const response = await apiClient.get(`/api/stellar/account/${publicKey}`);
    return response.data;
  },

  // Get balance
  getBalance: async (publicKey: string, asset?: string): Promise<{
    publicKey: string;
    asset: string;
    balance: string;
  }> => {
    const response = await apiClient.get(`/api/stellar/account/${publicKey}/balance`, { params: { asset } });
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (publicKey: string, limit?: number): Promise<Array<{
    hash: string;
    from: string;
    to: string;
    amount: string;
    asset: string;
    memo?: string;
    timestamp: string;
  }>> => {
    const response = await apiClient.get(`/api/stellar/account/${publicKey}/payments`, { params: { limit } });
    return response.data;
  },

  // Get transaction status
  getTransactionStatus: async (hash: string): Promise<{
    status: 'pending' | 'completed' | 'failed';
    ledger?: number;
    createdAt?: string;
  }> => {
    const response = await apiClient.get(`/api/stellar/transaction/${hash}`);
    return response.data;
  },

  // Create account
  createAccount: async (startingBalance?: string): Promise<{
    publicKey: string;
    secretKey: string;
    transactionHash: string;
  }> => {
    const response = await apiClient.post('/api/stellar/account', { startingBalance });
    return response.data;
  },

  // Send payment
  sendPayment: async (params: {
    destination: string;
    amount: string;
    asset?: string;
    memo?: string;
  }): Promise<{
    hash: string;
    success: boolean;
    message?: string;
  }> => {
    const response = await apiClient.post('/api/stellar/payment', params);
    return response.data;
  },

  // Create multi-sig account
  createMultiSigAccount: async (params: {
    signers: Array<{
      publicKey: string;
      weight: number;
    }>;
    thresholds: {
      low: number;
      medium: number;
      high: number;
    };
  }): Promise<{
    accountId: string;
    transactionHash: string;
  }> => {
    const response = await apiClient.post('/api/stellar/multi-sig', params);
    return response.data;
  },

  // Establish trustline
  establishTrustline: async (params: {
    accountId: string;
    assetCode: string;
    issuerPublicKey: string;
    limit?: string;
  }): Promise<{
    hash: string;
    message: string;
  }> => {
    const response = await apiClient.post('/api/stellar/trustline', params);
    return response.data;
  },

  // Path payment
  pathPayment: async (params: {
    destination: string;
    sendAsset: string;
    sendAmount: string;
    destAsset: string;
    destMin: string;
    path?: string[];
  }): Promise<{
    hash: string;
    success: boolean;
    message?: string;
  }> => {
    const response = await apiClient.post('/api/stellar/path-payment', params);
    return response.data;
  },
};
