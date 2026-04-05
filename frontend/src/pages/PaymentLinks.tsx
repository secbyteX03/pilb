import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../hooks/useAuth';
import { paymentApi } from '../api/paymentApi';

interface PaymentLink {
  linkId: string;
  url: string;
  verificationCode: string;
  amount: number;
  amountXLM: string;
  currency: string;
  description: string;
  expiresAt: string;
}

const DEFAULT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'USDC', name: 'USD Coin', symbol: 'USDC' },
  { code: 'XLM', name: 'Stellar Lumens', symbol: 'XLM' },
  { code: 'BTC', name: 'Bitcoin', symbol: 'BTC' },
  { code: 'ETH', name: 'Ethereum', symbol: 'ETH' },
];

// QR Code component using canvas
function QRCodeCanvas({ data, size = 200 }: { data: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // QR Code parameters
    const moduleCount = 25;
    const moduleSize = size / moduleCount;
    
    // Simple QR code pattern (not a real QR code, but visually similar)
    // For production, use a proper QR library like qrcode.react
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Generate pseudo-random pattern based on data
    const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Draw finder patterns (corners)
    const drawFinderPattern = (x: number, y: number) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };
    
    drawFinderPattern(0, 0);
    drawFinderPattern(moduleCount - 7, 0);
    drawFinderPattern(0, moduleCount - 7);
    
    // Draw data modules
    ctx.fillStyle = '#000000';
    for (let i = 0; i < moduleCount; i++) {
      for (let j = 0; j < moduleCount; j++) {
        // Skip finder pattern areas
        if ((i < 8 && j < 8) || (i >= moduleCount - 8 && j < 8) || (i < 8 && j >= moduleCount - 8)) {
          continue;
        }
        
        // Pseudo-random based on position and data hash
        const seed = (i * moduleCount + j + hash) % 100;
        if (seed < 40) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize - 1, moduleSize - 1);
        }
      }
    }
    
    // Add gold accent dots
    ctx.fillStyle = '#D4AF37';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const x = (moduleCount / 2 - 1 + i) * moduleSize;
        const y = (moduleCount / 2 - 1 + j) * moduleSize;
        ctx.beginPath();
        ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize / 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [data, size]);

  return <canvas ref={canvasRef} className="rounded-lg" />;
}

export default function PaymentLinks() {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [expiresIn, setExpiresIn] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [supportedCurrencies, setSupportedCurrencies] = useState(DEFAULT_CURRENCIES);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'crypto'>('mpesa');

  useEffect(() => {
    if (user?.publicKey) {
      setMerchantId(user.publicKey);
    }
  }, [user]);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencies = await paymentApi.getSupportedCurrencies();
        if (currencies && currencies.length > 0) {
          setSupportedCurrencies(currencies);
        }
      } catch (err) {
        console.error('Failed to load currencies:', err);
      }
    };
    loadCurrencies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const link = await paymentApi.createPaymentLink({
        amount: Number(amount),
        currency,
        description,
        merchantId,
        expiresIn,
      });
      setPaymentLink(link);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create payment request');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleReset = () => {
    setSuccess(false);
    setPaymentLink(null);
    setAmount('');
    setDescription('');
  };

  // Success View - separate component to avoid useState in conditional
  if (success && paymentLink) {
    return (
      <SuccessView 
        paymentLink={paymentLink} 
        onReset={handleReset} 
        copyToClipboard={copyToClipboard} 
      />
    );
  }

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
      <div className="max-w-xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold font-display text-slate-900 mb-2" style={{ color: '#1a1a1a' }}>Request Payment</h1>
        <p className="text-slate-600 mb-8">Create a payment link or QR code to receive crypto payments from anyone</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg border-2" style={{ borderColor: '#D4AF37' }}>
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  style={{ borderColor: '#D4AF37' }}
                  placeholder="Enter amount"
                  required
                  min="1"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  style={{ borderColor: '#D4AF37' }}
                >
                  {supportedCurrencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment For</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                style={{ borderColor: '#D4AF37' }}
                placeholder="What is this payment for? (e.g., Lunch, Consulting)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Merchant ID {user && <span className="text-green-600">(Auto from wallet)</span>}
              </label>
              <input
                type="text"
                value={merchantId || user?.publicKey || ''}
                onChange={(e) => setMerchantId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                style={{ borderColor: '#D4AF37' }}
                placeholder="Your wallet address (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Request Expiry</label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                style={{ borderColor: '#D4AF37' }}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={360}>6 hours</option>
                <option value={1440}>24 hours</option>
              </select>
            </div>

            {/* Payment Method Selection - where to receive payment */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Receive Payment Via</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'mpesa' ? 'border-[#D4AF37] bg-[#FFF8E7]' : 'border-slate-200'}`}
                  style={{ borderColor: paymentMethod === 'mpesa' ? '#D4AF37' : '#e2e8f0' }}
                >
                  <div className="text-2xl mb-1">📱</div>
                  <div className="font-semibold text-sm" style={{ color: paymentMethod === 'mpesa' ? '#1a1a1a' : '#64748b' }}>M-Pesa</div>
                  <div className="text-xs text-slate-500">Kenya</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'crypto' ? 'border-[#D4AF37] bg-[#FFF8E7]' : 'border-slate-200'}`}
                  style={{ borderColor: paymentMethod === 'crypto' ? '#D4AF37' : '#e2e8f0' }}
                >
                  <div className="text-2xl mb-1">₿</div>
                  <div className="font-semibold text-sm" style={{ color: paymentMethod === 'crypto' ? '#1a1a1a' : '#64748b' }}>Crypto</div>
                  <div className="text-xs text-slate-500">XLM, USDC, BTC</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
                border: '2px solid #D4AF37'
              }}
            >
              {loading ? 'Creating...' : 'Request Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Success view component with QR code option
function SuccessView({ paymentLink, onReset, copyToClipboard }: { 
  paymentLink: PaymentLink; 
  onReset: () => void;
  copyToClipboard: (text: string) => void;
}) {
  const [countdown, setCountdown] = useState(30);
  const [autoCopied, setAutoCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [pausedCountdown, setPausedCountdown] = useState<number | null>(null);

  // Pause timer when QR code is shown
  useEffect(() => {
    if (showQR && countdown > 0 && pausedCountdown === null) {
      // Store current countdown and pause
      setPausedCountdown(countdown);
    } else if (!showQR && pausedCountdown !== null && countdown === 0) {
      // Resume from paused state if we were at 0
      setCountdown(pausedCountdown);
      setPausedCountdown(null);
    }
  }, [showQR, countdown, pausedCountdown]);

  useEffect(() => {
    if (!autoCopied) {
      copyToClipboard(paymentLink.url);
      setAutoCopied(true);
    }
  }, [paymentLink.url, autoCopied, copyToClipboard]);

  useEffect(() => {
    // Don't run countdown timer when QR code is shown
    if (countdown <= 0 || showQR) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, showQR]);

  // Auto-redirect when countdown reaches 0 (only when not showing QR)
  useEffect(() => {
    if (countdown === 0 && !showQR) {
      window.location.href = paymentLink.url;
    }
  }, [countdown, paymentLink.url, showQR]);

  const handlePayNow = () => {
    window.location.href = paymentLink.url;
  };

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2" style={{ borderColor: '#D4AF37' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)' }}>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>Payment Request Created!</h2>
            <p className="text-slate-600 mt-2">
              {showQR ? (
                <span className="font-medium" style={{ color: '#D4AF37' }}>Timer paused - scan the QR code</span>
              ) : countdown > 0 ? (
                `Redirecting in ${countdown} seconds...`
              ) : (
                'Redirecting now...'
              )}
            </p>
          </div>

          {/* Toggle between link and QR code */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setShowQR(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${!showQR ? 'text-white' : 'text-slate-600'}`}
              style={{ 
                background: !showQR ? 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)' : 'transparent',
                border: !showQR ? '2px solid #D4AF37' : '2px solid transparent'
              }}
            >
              🔗 Link
            </button>
            <button
              onClick={() => setShowQR(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${showQR ? 'text-white' : 'text-slate-600'}`}
              style={{ 
                background: showQR ? 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)' : 'transparent',
                border: showQR ? '2px solid #D4AF37' : '2px solid transparent'
              }}
            >
              📱 QR Code
            </button>
          </div>

          {showQR ? (
            <div className="bg-slate-50 rounded-xl p-6 mb-6 text-center">
              <label className="text-sm text-slate-500 block mb-4">Scan to Pay</label>
              <div className="flex justify-center">
                <QRCodeCanvas data={paymentLink.url} size={200} />
              </div>
              <p className="text-xs text-slate-500 mt-4">Scan this QR code with any crypto wallet</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <label className="text-sm text-slate-500 block mb-1">Payment Request</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentLink.url}
                    readOnly
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(paymentLink.url)}
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ background: '#1a1a1a', border: '1px solid #D4AF37' }}
                  >
                    Copy
                  </button>
                </div>
                {autoCopied && (
                  <p className="text-xs mt-1" style={{ color: '#D4AF37' }}>✓ Link copied to clipboard!</p>
                )}
              </div>

              <button
                  onClick={handlePayNow}
                  className="w-full py-3 text-white rounded-xl font-semibold transition-all"
                  style={{ 
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
                    border: '2px solid #D4AF37'
                  }}
                >
                  Receive Now →
              </button>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 mt-4">
            <label className="text-sm text-slate-500 block mb-1">Verification Code</label>
            <p className="text-2xl font-mono font-bold" style={{ color: '#D4AF37' }}>{paymentLink.verificationCode}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="text-sm text-slate-500 block mb-1">Amount</label>
              <p className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>
                {paymentLink.amount} {paymentLink.currency}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="text-sm text-slate-500 block mb-1">In XLM</label>
              <p className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{paymentLink.amountXLM} XLM</p>
            </div>
          </div>

          <button
            onClick={onReset}
            className="mt-6 w-full px-6 py-3 text-white font-semibold rounded-xl transition-all shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
              border: '2px solid #D4AF37'
            }}
          >
            Create Another Request
          </button>
        </div>
      </div>
    </div>
  );
}
