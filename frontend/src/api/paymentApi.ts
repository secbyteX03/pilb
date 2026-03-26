import api from './client';

export interface PaymentRequest {
  amount: number;
  recipientPhone: string;
  senderPublicKey: string;
}

export interface PaymentResponse {
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
}

export const paymentApi = {
  initiate: async (data: PaymentRequest): Promise<PaymentResponse> => {
    const response = await api.post('/payments/initiate', data);
    return response.data;
  },

  confirm: async (paymentId: string, stellarTxHash: string) => {
    const response = await api.post('/payments/confirm', { paymentId, stellarTxHash });
    return response.data;
  },

  getStatus: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  getHistory: async (publicKey: string, limit = 20, offset = 0) => {
    const response = await api.get('/payments/history', {
      params: { publicKey, limit, offset },
    });
    return response.data;
  },
};

export const authApi = {
  getChallenge: async (publicKey: string) => {
    const response = await api.get('/auth/challenge', { params: { publicKey } });
    return response.data;
  },

  authenticate: async (publicKey: string, signedTransaction: string) => {
    const response = await api.post('/auth/authenticate', { publicKey, signedTransaction });
    return response.data;
  },
};

export const verifyApi = {
  byCode: async (code: string) => {
    const response = await api.get('/verify/payment', { params: { code } });
    return response.data;
  },

  byTransaction: async (txHash: string) => {
    const response = await api.get('/verify/transaction', { params: { txHash } });
    return response.data;
  },
};