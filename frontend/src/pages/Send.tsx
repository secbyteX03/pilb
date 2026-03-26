import { useState } from 'react';
import { useAuthStore } from '../hooks/useAuth';

export default function Send() {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    code: string;
    stellarTxHash: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Call backend API to initiate payment
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          recipientPhone,
          senderPublicKey: user.publicKey,
        }),
      });
      
      const data = await response.json();
      setPaymentDetails({
        code: data.verificationCode,
        stellarTxHash: data.stellarTxHash,
      });
    } catch (error) {
      console.error('Payment initiation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Connect Your Wallet</h2>
        <p className="text-slate-600 mb-8">Please connect your Stellar wallet to send money.</p>
        <button className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all">
          Connect Wallet
        </button>
      </div>
    );
  }

  if (paymentDetails) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-slate-100 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Initiated!</h2>
          <p className="text-slate-600 mt-2">Share these details with the recipient</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <label className="text-sm text-slate-500 block mb-1">Verification Code</label>
            <p className="text-3xl font-mono font-bold text-primary-600">{paymentDetails.code}</p>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-4">
            <label className="text-sm text-slate-500 block mb-1">Transaction Hash</label>
            <p className="text-sm font-mono text-slate-600 break-all">{paymentDetails.stellarTxHash}</p>
          </div>
          
          <div className="bg-accent-50 rounded-xl p-4 border border-accent-100">
            <p className="text-sm text-accent-700">
              <strong>Important:</strong> Share only the verification code with your recipient. 
              Don't share your transaction hash publicly.
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setPaymentDetails(null)}
          className="mt-6 w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all"
        >
          Send Another Payment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold font-display text-slate-900 mb-8">Send Money</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount (KES)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="Enter amount"
              required
              min="10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Recipient Phone Number
            </label>
            <input
              type="tel"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="07XXXXXXXX"
              required
            />
            <p className="text-sm text-slate-500 mt-2">
              Enter the recipient's M-Pesa phone number (without +254)
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Send Money'}
          </button>
        </div>
      </form>
    </div>
  );
}