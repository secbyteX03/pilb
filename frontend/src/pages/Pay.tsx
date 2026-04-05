import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';

interface PaymentLinkDetails {
  id: string;
  linkId: string;
  amount: number;
  currency: string;
  amountXLM: string;
  description: string;
  verificationCode: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  merchantId: string;
}

export default function Pay() {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [paymentLink, setPaymentLink] = useState<PaymentLinkDetails | null>(null);
  const [loadingLink, setLoadingLink] = useState(true); // Start with true to show loading initially
  const [errorMessage, setErrorMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (linkId) {
      fetchPaymentLink(linkId);
    }
  }, [linkId]);

  // Countdown for redirect after successful payment
  useEffect(() => {
    if (paymentSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (paymentSuccess && countdown === 0) {
      navigate('/dashboard');
    }
  }, [paymentSuccess, countdown, navigate]);

  const fetchPaymentLink = async (id: string) => {
    try {
      setLoadingLink(true);
      // Add timestamp to prevent cache
      const response = await fetch(`/api/payments/link/${id}?t=${Date.now()}`);
      const data = await response.json();
      
      console.log('Pay.tsx - API Response:', data);
      console.log('Pay.tsx - verificationCode:', data.verificationCode);
      
      if (!response.ok) {
        setErrorMessage(data.error || 'Payment link not found');
        setPaymentLink(null);
        return;
      }
      
      setPaymentLink(data);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage('Failed to load payment link');
      setPaymentLink(null);
    } finally {
      setLoadingLink(false);
    }
  };

  const handleReceivePayment = async () => {
    if (!paymentLink) return;
    
    setProcessing(true);
    setErrorMessage('');
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success state
      setPaymentSuccess(true);
    } catch (err) {
      setErrorMessage('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Success state after payment
  if (paymentSuccess && paymentLink) {
    return (
      <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
        <div className="max-w-md mx-auto py-16 px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 text-center" style={{ borderColor: '#D4AF37' }}>
            {/* Success icon with animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(212, 175, 55, 0.3)' }}></div>
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)' }}>
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a1a1a' }}>Payment Confirmed!</h2>
            <p className="text-slate-600 mb-6">The payment has been successfully processed</p>

            {/* Payment details */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Amount</label>
                  <p className="text-xl font-bold" style={{ color: '#D4AF37' }}>
                    {paymentLink.amount} {paymentLink.currency}
                  </p>
                </div>
                {paymentLink.amountXLM && (
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">In XLM</label>
                    <p className="text-xl font-bold" style={{ color: '#1a1a1a' }}>
                      {paymentLink.amountXLM} XLM
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification code */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <label className="text-xs text-slate-500 block mb-1">Payment Reference</label>
              <p className="text-2xl font-mono font-bold" style={{ color: '#D4AF37' }}>
                {paymentLink.verificationCode}
              </p>
            </div>

            {paymentLink.description && (
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <label className="text-xs text-slate-500 block mb-1">Payment For</label>
                <p className="text-slate-900">{paymentLink.description}</p>
              </div>
            )}

            <p className="text-sm text-slate-500 mt-6">
              Redirecting to dashboard in {countdown} seconds...
            </p>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 w-full px-6 py-3 text-white font-semibold rounded-xl transition-all"
              style={{ 
                background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
                border: '2px solid #D4AF37'
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loadingLink) {
    return (
      <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
        <div className="max-w-md mx-auto py-16 px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 text-center" style={{ borderColor: '#D4AF37' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)' }}>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600">Connecting to payment link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Payment link confirmation page - no wallet required for payer
  if (paymentLink) {
    return (
      <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
        <div className="max-w-md mx-auto py-16 px-4">
          <div className="bg-white rounded-2xl shadow-lg border-2 overflow-hidden" style={{ borderColor: '#D4AF37' }}>
            {/* Header */}
            <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)' }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Payment Summary</h1>
              <p className="text-slate-300 mt-1">Review payment details before sending</p>
            </div>
            
            <div className="p-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}
              
              {/* Amount display */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <label className="text-xs text-slate-500 block mb-1">Amount to Pay</label>
                <p className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
                  {paymentLink.amount} <span className="text-lg">{paymentLink.currency}</span>
                </p>
                {paymentLink.amountXLM && (
                  <p className="text-lg text-slate-500 mt-1">≈ {paymentLink.amountXLM} XLM</p>
                )}
              </div>
              
              {/* Payment For */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <label className="text-xs text-slate-500 block mb-1">Payment For</label>
                <p className="text-slate-900 font-medium">{paymentLink.description || 'No description provided'}</p>
              </div>
              
              {/* Merchant ID */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <label className="text-xs text-slate-500 block mb-1">Merchant/Recipient</label>
                <p className="text-sm font-mono text-slate-600 break-all">{paymentLink.merchantId || 'N/A'}</p>
              </div>
              
              {/* Payment Link */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <label className="text-xs text-slate-500 block mb-1">Payment Link</label>
                <p className="text-sm font-mono text-slate-600 break-all">{'http://localhost:3000/pay/' + paymentLink.linkId}</p>
              </div>
              
              {/* Receive button */}
              <button
                onClick={handleReceivePayment}
                disabled={processing}
                className="w-full px-6 py-4 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                style={{ 
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
                  border: '2px solid #D4AF37'
                }}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Pay Now'
                )}
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full mt-3 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                ← Cancel
              </button>
              
              <p className="mt-4 text-center text-xs text-slate-500">
                🔒 Secured by Stellar Blockchain
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Show error
  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2" style={{ borderColor: '#D4AF37' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1a1a1a' }}>Payment Link Not Found</h2>
          <p className="text-slate-600 mb-6">This payment link may have expired or is invalid</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 text-white font-semibold rounded-xl transition-all"
            style={{ 
              background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
              border: '2px solid #D4AF37'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
