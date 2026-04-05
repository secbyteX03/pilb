import { useState, useCallback } from 'react';
import { paymentApi, PaymentRequest, PaymentResponse } from '../api/paymentApi';

interface InitiatePaymentResponse {
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

interface UsePaymentState {
  loading: boolean;
  error: string | null;
  payment: InitiatePaymentResponse | null;
}

export function usePayment() {
  const [state, setState] = useState<UsePaymentState>({
    loading: false,
    error: null,
    payment: null,
  });

  const initiatePayment = useCallback(async (data: { amount: number; recipientPhone: string; senderPublicKey: string }) => {
    setState({ loading: true, error: null, payment: null });
    
    try {
      const response = await paymentApi.initiate(data);
      setState({ loading: false, error: null, payment: response });
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to initiate payment';
      setState({ loading: false, error: errorMessage, payment: null });
      throw new Error(errorMessage);
    }
  }, []);

  const confirmPayment = useCallback(async (paymentId: string, stellarTxHash: string) => {
    setState({ loading: true, error: null, payment: null });
    
    try {
      await paymentApi.confirm(paymentId, stellarTxHash);
      setState({ loading: false, error: null, payment: null });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to confirm payment';
      setState({ loading: false, error: errorMessage, payment: null });
      throw new Error(errorMessage);
    }
  }, []);

  const clearPayment = useCallback(() => {
    setState({ loading: false, error: null, payment: null });
  }, []);

  return {
    ...state,
    initiatePayment,
    confirmPayment,
    clearPayment,
  };
}