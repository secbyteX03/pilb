import { useState, useEffect } from 'react';
import { useAuthStore } from '../hooks/useAuth';
import { usePayment } from '../hooks/usePayment';
import ConnectWallet from '../components/ConnectWallet';
import { paymentApi } from '../api/paymentApi';

// Country codes with flags
const COUNTRY_CODES = [
  { code: '+254', country: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: '+256', country: 'UG', flag: '🇺🇬', name: 'Uganda' },
  { code: '+255', country: 'TZ', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+233', country: 'GH', flag: '🇬🇭', name: 'Ghana' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+352', country: 'EU', flag: '🇪🇺', name: 'EU' },
];

// Cross-border fees by country (percentage + fixed fee)
const CROSS_BORDER_FEES: Record<string, { percentage: number; fixed: number; currency: string }> = {
  'KE': { percentage: 2.5, fixed: 0, currency: 'KES' },
  'UG': { percentage: 3.0, fixed: 100, currency: 'KES' },
  'TZ': { percentage: 3.0, fixed: 150, currency: 'KES' },
  'NG': { percentage: 4.5, fixed: 500, currency: 'KES' },
  'GH': { percentage: 4.0, fixed: 400, currency: 'KES' },
  'ZA': { percentage: 5.0, fixed: 600, currency: 'KES' },
  'IN': { percentage: 5.5, fixed: 800, currency: 'KES' },
  'US': { percentage: 6.0, fixed: 1000, currency: 'KES' },
  'GB': { percentage: 5.5, fixed: 900, currency: 'KES' },
  'EU': { percentage: 5.5, fixed: 900, currency: 'KES' },
};

export default function Send() {
  const { user } = useAuthStore();
  const { initiatePayment, loading, error, payment, clearPayment } = usePayment();
  const [amount, setAmount] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState(COUNTRY_CODES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [currency, setCurrency] = useState('KES');
  const [recipientCountry, setRecipientCountry] = useState('KE');
  const [supportedCurrencies, setSupportedCurrencies] = useState<Array<{ code: string; name: string; symbol: string }>>([]);
  const [isCrossBorder, setIsCrossBorder] = useState(false);
  const [transactionCost, setTransactionCost] = useState<{ fee: number; total: number } | null>(null);

  useEffect(() => {
    // Load supported currencies
    const loadCurrencies = async () => {
      try {
        const currencies = await paymentApi.getSupportedCurrencies();
        setSupportedCurrencies(currencies);
      } catch (err) {
        console.error('Failed to load currencies:', err);
      }
    };
    loadCurrencies();
  }, []);

  // Calculate transaction cost when amount or recipient country changes
  useEffect(() => {
    if (!amount || Number(amount) <= 0) {
      setTransactionCost(null);
      return;
    }

    if (isCrossBorder && recipientCountry) {
      const feeInfo = CROSS_BORDER_FEES[recipientCountry];
      if (feeInfo) {
        const amountNum = Number(amount);
        const percentageFee = amountNum * (feeInfo.percentage / 100);
        const totalFee = percentageFee + feeInfo.fixed;
        setTransactionCost({
          fee: totalFee,
          total: amountNum + totalFee
        });
      }
    } else {
      // Local Kenya payment - minimal fee
      const amountNum = Number(amount);
      const fee = amountNum * 0.015; // 1.5% for local
      setTransactionCost({
        fee: fee,
        total: amountNum + fee
      });
    }
  }, [amount, recipientCountry, isCrossBorder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      if (isCrossBorder) {
        await paymentApi.initiateCrossBorder({
          amount: Number(amount),
          recipientPhone: selectedCountryCode.code + recipientPhone.replace(/^\+/, ''),
          senderPublicKey: user.publicKey,
          currency,
          recipientCountry,
        });
      } else {
        await initiatePayment({
          amount: Number(amount),
          recipientPhone: selectedCountryCode.code + recipientPhone.replace(/^\+/, ''),
          senderPublicKey: user.publicKey,
        });
      }
    } catch (err) {
      // Error is already handled by the hook
      console.error('Payment initiation failed:', err);
    }
  };

  if (!user) {
    return (
      <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
        <div className="max-w-xl mx-auto text-center py-16 px-4">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>Connect Your Wallet</h2>
          <p className="text-slate-600 mb-8">Please connect your Stellar wallet to send money.</p>
          <ConnectWallet />
        </div>
      </div>
    );
  }

  if (payment) {
    return (
      <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
        <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-lg border-2" style={{ borderColor: '#D4AF37' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)' }}>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>Payment Initiated!</h2>
            <p className="text-slate-600 mt-2">Share these details with the recipient</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="text-sm text-slate-500 block mb-1">Verification Code</label>
              <p className="text-3xl font-mono font-bold" style={{ color: '#D4AF37' }}>{payment.verificationCode}</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="text-sm text-slate-500 block mb-1">Amount</label>
              <p className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{payment.amount} KES ({payment.amountXLM} XLM)</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="text-sm text-slate-500 block mb-1">Recipient</label>
              <p className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{payment.recipientPhone}</p>
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
            
            <div className="rounded-xl p-4 border-2" style={{ borderColor: '#D4AF37', background: 'rgba(212, 175, 55, 0.1)' }}>
              <p className="text-sm" style={{ color: '#1a1a1a' }}>
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
            className="mt-6 w-full px-6 py-3 text-white font-semibold rounded-xl transition-all shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
              border: '2px solid #D4AF37'
            }}
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
        <h1 className="text-3xl font-bold font-display mb-8" style={{ color: '#1a1a1a' }}>Send Money</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg border-2" style={{ borderColor: '#D4AF37' }}>
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  style={{ borderColor: '#D4AF37' }}
                  placeholder="Enter amount"
                  required
                  min="10"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  style={{ borderColor: '#D4AF37' }}
                >
                  {supportedCurrencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Recipient Phone Number
              </label>
              <div className="relative flex gap-2">
                {/* Country code selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-2 px-3 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 transition-all"
                    style={{ 
                      borderColor: '#D4AF37',
                      background: 'white',
                      minWidth: '100px'
                    }}
                  >
                    <span>{selectedCountryCode.flag}</span>
                    <span className="text-sm font-medium">{selectedCountryCode.code}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Country dropdown */}
                  {showCountryDropdown && (
                    <div className="absolute z-50 mt-1 w-64 bg-white rounded-xl shadow-lg border-2" style={{ borderColor: '#D4AF37' }}>
                      {COUNTRY_CODES.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountryCode(country);
                            setRecipientCountry(country.country);
                            setIsCrossBorder(country.country !== 'KE');
                            setShowCountryDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${selectedCountryCode.code === country.code ? 'bg-slate-100' : ''}`}
                        >
                          <span className="text-xl">{country.flag}</span>
                          <span className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{country.name}</span>
                          <span className="text-xs text-slate-500 ml-auto">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => {
                    setRecipientPhone(e.target.value);
                    // Auto-detect country when user enters phone number
                    const enteredCode = COUNTRY_CODES.find(c => 
                      e.target.value.startsWith(c.code.replace('+', ''))
                    );
                    if (enteredCode) {
                      setSelectedCountryCode(enteredCode);
                      setRecipientCountry(enteredCode.country);
                      setIsCrossBorder(enteredCode.country !== 'KE');
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  style={{ borderColor: '#D4AF37' }}
                  placeholder="XXXXXXXXX"
                  required
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Select country code and enter phone number
              </p>
            </div>

            {/* Cross-border payment toggle */}
            <div className="flex items-center gap-2 p-4 rounded-xl border-2" style={{ borderColor: '#D4AF37' }}>
              <input
                type="checkbox"
                id="crossBorder"
                checked={isCrossBorder}
                onChange={(e) => setIsCrossBorder(e.target.checked)}
                className="w-5 h-5"
                style={{ accentColor: '#D4AF37' }}
              />
              <label htmlFor="crossBorder" className="text-sm font-medium" style={{ color: '#1a1a1a' }}>
                Cross-border payment (send to another country)
              </label>
            </div>

            {isCrossBorder && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Recipient Country
                </label>
                <div className="w-full px-4 py-3 rounded-xl border-2" style={{ 
                  borderColor: '#1a1a1a', 
                  background: '#1a1a1a',
                  color: '#fff'
                }}>
                  <span className="flex items-center gap-2">
                    <span>{selectedCountryCode.flag}</span>
                    <span>{selectedCountryCode.name}</span>
                    <span className="text-slate-400">({selectedCountryCode.code})</span>
                  </span>
                </div>
              </div>
            )}
            
            {/* Transaction cost display */}
            {transactionCost && (
              <div className="rounded-xl p-4 border-2" style={{ borderColor: '#D4AF37', background: 'rgba(212, 175, 55, 0.05)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Transaction Fee:</span>
                  <span className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>
                    {transactionCost.fee.toFixed(2)} KES
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Total Amount:</span>
                  <span className="text-lg font-bold" style={{ color: '#D4AF37' }}>
                    {transactionCost.total.toFixed(2)} KES
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {isCrossBorder 
                    ? `Cross-border fee: ${CROSS_BORDER_FEES[recipientCountry]?.percentage || 0}% + ${CROSS_BORDER_FEES[recipientCountry]?.fixed || 0} KES`
                    : 'Local payment fee: 1.5%'
                  }
                </p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
                border: '2px solid #D4AF37'
              }}
            >
              {loading ? 'Processing...' : 'Send Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
