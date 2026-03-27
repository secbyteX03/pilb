import { useState } from 'react';
import { useAuthStore } from '../hooks/useAuth';
import { usePayment } from '../hooks/usePayment';

export default function Send() {
  const { user } = useAuthStore();
  const { initiatePayment, loading, error, payment, clearPayment } = usePayment();
  const [amount, setAmount] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await initiatePayment({
        amount: Number(amount),
        recipientPhone,
        senderPublicKey: user.publicKey,
      });
    } catch (err) {
      // Error is already handled by the hook
      console.error('Payment initiation failed:', err);
    }
  };

  if (!user) {
    return (
      <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
        <div className="max-w-xl mx-auto text-center py-16 px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Connect Your Wallet</h2>
          <p className="text-slate-600 mb-8">Please connect your Stellar wallet to send money.</p>
          <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (payment) {
    return (
      <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
        <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-slate-100 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Initiated!</h2>
            <p className="text-slate-600 mt-2">Share these details with the recipient</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="text-sm text-slate-500 block mb-1">Verification Code</label>
              <p className="text-3xl font-mono font-bold text-cyan-600">{payment.verificationCode}</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="text-sm text-slate-500 block mb-1">Amount</label>
              <p className="text-lg font-semibold text-slate-900">{payment.amount} KES ({payment.amountXLM} XLM)</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="text-sm text-slate-500 block mb-1">Recipient</label>
              <p className="text-lg font-semibold text-slate-900">{payment.recipientPhone}</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="text-sm text-slate-500 block mb-1">Stellar Transaction Details</label>
              <div className="space-y-2 mt-2">
                <div>
                  <span className="text-xs text-slate-400">Destination:</span>
                  <p className="text-sm font-mono text-slate-600 break-all">{payment.stellarTransaction.destination}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Amount:</span>
                  <p className="text-sm font-mono text-slate-600">{payment.stellarTransaction.amount} XLM</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Memo:</span>
                  <p className="text-sm font-mono text-slate-600 break-all">{payment.stellarTransaction.memo}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-sm text-emerald-700">
                <strong>Important:</strong> Share only the verification code with your recipient. 
                Don't share your transaction details publicly.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              clearPayment();
              setAmount('');
              setRecipientPhone('');
            }}
            className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg"
          >
            Send Another Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
      <div className="max-w-xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold font-display text-slate-900 mb-8">Send Money</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount (KES)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
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
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                placeholder="07XXXXXXXX"
                required
              />
              <p className="text-sm text-slate-500 mt-2">
                Enter the recipient's M-Pesa phone number (without +254)
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Send Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
