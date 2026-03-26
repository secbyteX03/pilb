import { useState } from 'react';

interface VerificationResult {
  verified: boolean;
  amount?: string;
  timestamp?: string;
  transactionHash?: string;
}

export default function Verify() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/payments/verify?code=${code}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Failed to verify payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold font-display text-slate-900 mb-8 text-center">
        Verify Payment
      </h1>
      <p className="text-slate-600 text-center mb-8">
        Enter the verification code to check if a payment exists on the blockchain.
      </p>

      <form onSubmit={handleVerify} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-center text-2xl font-mono tracking-wider"
            placeholder="XXXX-XXXX"
            required
            maxLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !code}
          className="w-full px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Verify Payment'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}

      {result?.verified && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 animate-slide-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Verified!</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="text-sm text-slate-500 block mb-1">Amount</label>
              <p className="text-2xl font-bold text-slate-900">{result.amount} KES</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <label className="text-sm text-slate-500 block mb-1">Timestamp</label>
              <p className="text-slate-700">{new Date(result.timestamp!).toLocaleString()}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <label className="text-sm text-slate-500 block mb-1">Transaction Hash</label>
              <p className="text-sm font-mono text-slate-600 break-all">{result.transactionHash}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}