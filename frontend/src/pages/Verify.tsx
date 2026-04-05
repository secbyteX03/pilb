import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface VerificationResult {
  id?: string;
  verified: boolean;
  amount?: string;
  currency?: string;
  status?: string;
  sender?: string;
  recipient?: string;
  timestamp?: string;
  transactionHash?: string;
  externalId?: string;
  description?: string;
}

export default function Verify() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [recentVerifications, setRecentVerifications] = useState<VerificationResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('recent_verifications');
    if (saved) {
      try {
        setRecentVerifications(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/payments/verify?code=${code.trim()}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        const updated = [data, ...recentVerifications.filter(v => v.id !== data.id)].slice(0, 5);
        setRecentVerifications(updated);
        localStorage.setItem('recent_verifications', JSON.stringify(updated));
      } else {
        setError(data.message || 'Verification failed. Please check the code and try again.');
      }
    } catch (err) {
      setError('Failed to verify payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickVerify = (verificationCode: string) => {
    if (!verificationCode) return;
    setCode(verificationCode);
    setIsLoading(true);
    setError('');
    setResult(null);

    fetch(`/api/payments/verify?code=${verificationCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.verified) {
          setResult(data);
        } else {
          setError(data.message || 'Verification failed');
        }
      })
      .catch(() => {
        setError('Failed to verify payment');
      })
      .finally(() => setIsLoading(false));
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#0D0D0D", color: "#FFFFFF", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg: #0D0D0D;
          --bg-2: #151515;
          --bg-3: #1A1A1A;
          --white: #FFFFFF;
          --white-2: #E5E5E5;
          --white-3: #999;
          --gold: #D4AF37;
          --gold-light: #F5E6B3;
          --gold-glow: rgba(212, 175, 55, 0.15);
          --border: #2A2A2A;
          --border-2: #333;
          --radius: 18px;
        }

        .verify-page {
          min-height: 100vh;
          background: 
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(212, 175, 55, 0.05) 0%, transparent 40%),
            var(--bg);
        }

        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          background: rgba(13, 13, 13, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          z-index: 100;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
          color: var(--white);
          text-decoration: none;
          letter-spacing: -0.5px;
        }

        .nav-logo-mark {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--gold) 0%, #B8962E 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-logo-mark svg {
          width: 18px;
          height: 18px;
          stroke: #000;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-links a {
          color: var(--white-2);
          text-decoration: none;
          font-size: 14px;
          font-weight: 400;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: var(--gold);
        }

        .verify-container {
          max-width: 520px;
          margin: 0 auto;
          padding: 140px 24px 80px;
        }

        .verify-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .verify-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--gold-glow);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 100px;
          padding: 8px 16px;
          margin-bottom: 24px;
        }

        .verify-badge-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .verify-badge-icon svg {
          width: 12px;
          height: 12px;
          stroke: #000;
        }

        .verify-badge-text {
          font-size: 12px;
          font-weight: 600;
          color: var(--gold);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .verify-heading {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          letter-spacing: -1px;
          color: var(--white);
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .verify-heading span {
          background: linear-gradient(135deg, var(--gold) 0%, #F5D98E 50%, var(--gold) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .verify-sub {
          font-size: 15px;
          font-weight: 400;
          color: var(--white-3);
          line-height: 1.7;
        }

        .verify-form {
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 32px;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--white-2);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          width: 100%;
          padding: 16px 20px;
          background: var(--bg);
          border: 1px solid var(--border-2);
          border-radius: 12px;
          font-size: 18px;
          font-family: 'Sora', sans-serif;
          font-weight: 500;
          color: var(--white);
          letter-spacing: 4px;
          text-align: center;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--gold);
          box-shadow: 0 0 0 4px var(--gold-glow);
        }

        .form-input::placeholder {
          color: var(--white-3);
          letter-spacing: 2px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, var(--gold) 0%, #C9A227 100%);
          color: #000;
          padding: 16px 28px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
          border: none;
          cursor: pointer;
          width: 100%;
          font-family: 'Sora', sans-serif;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(212, 175, 55, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          color: #F87171;
          font-size: 14px;
          text-align: center;
        }

        .result-card {
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 40px 32px;
          animation: fadeUp 0.5s ease both;
          margin-bottom: 24px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .result-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .result-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, var(--gold) 0%, #C9A227 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.4);
        }

        .result-icon svg {
          width: 36px;
          height: 36px;
          stroke: #000;
          stroke-width: 2.5;
        }

        .result-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 8px;
        }

        .result-title span {
          color: var(--gold);
        }

        .result-desc {
          font-size: 14px;
          color: var(--white-3);
        }

        .result-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .result-item {
          background: var(--bg);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .result-item-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--white-3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .result-item-value {
          font-size: 16px;
          font-weight: 600;
          color: var(--white);
          text-align: right;
        }

        .result-item-value.amount {
          font-size: 22px;
          font-weight: 700;
          color: var(--gold);
        }

        .result-item-value.hash {
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .result-item.clickable {
          cursor: pointer;
          transition: background 0.2s;
        }

        .result-item.clickable:hover {
          background: var(--bg-3);
        }

        .result-item.full-width {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .result-item.full-width .result-item-value {
          text-align: left;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .status-badge.completed {
          background: rgba(34, 197, 94, 0.15);
          color: #4ADE80;
        }

        .status-badge.pending {
          background: rgba(251, 191, 36, 0.15);
          color: #FBBF24;
        }

        .status-badge.failed {
          background: rgba(239, 68, 68, 0.15);
          color: #F87171;
        }

        .help-section {
          text-align: center;
          padding: 24px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }

        .help-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--white-2);
          margin-bottom: 8px;
        }

        .help-text {
          font-size: 13px;
          color: var(--white-3);
          line-height: 1.6;
        }

        .help-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 16px;
        }

        .help-links a {
          color: var(--gold);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .help-links a:hover {
          text-decoration: underline;
        }

        .help-links .separator {
          color: var(--white-3);
        }

        .recent-section {
          margin-top: 24px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
        }

        .recent-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--white-2);
          margin-bottom: 16px;
        }

        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .recent-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .recent-item:hover {
          background: var(--bg-3);
          transform: translateX(4px);
        }

        .recent-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--gold-glow);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .recent-icon svg {
          width: 18px;
          height: 18px;
          stroke: var(--gold);
        }

        .recent-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .recent-amount {
          font-size: 14px;
          font-weight: 600;
          color: var(--white);
        }

        .recent-time {
          font-size: 12px;
          color: var(--white-3);
        }

        .recent-arrow {
          width: 20px;
          height: 20px;
          opacity: 0.3;
        }

        .recent-arrow svg {
          width: 100%;
          height: 100%;
          stroke: var(--white);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <nav className="nav">
        <Link to="/" className="nav-logo">
          <div className="nav-logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          PILB
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/docs">Docs</Link>
        </div>
      </nav>

      <div className="verify-page">
        <div className="verify-container">
          <div className="verify-header">
            <div className="verify-badge">
              <div className="verify-badge-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="verify-badge-text">Payment Verification</span>
            </div>
            <h1 className="verify-heading">
              Verify <span>Payment</span>
            </h1>
            <p className="verify-sub">
              Enter the 8-character code to verify any incoming payment. Verification confirms the transaction has been recorded on the Stellar blockchain.
            </p>
          </div>

          <form onSubmit={handleVerify} className="verify-form">
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="form-input"
                placeholder="XXXXXXXX"
                maxLength={8}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              disabled={isLoading || code.length !== 8}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Verifying Payment...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify Payment
                </>
              )}
            </button>
          </form>

          {result && (
            <div className="result-card">
              <div className="result-header">
                <div className="result-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="result-title">Payment <span>Verified!</span></h2>
                <p className="result-desc">Your transaction has been confirmed on the Stellar network.</p>
              </div>

              <div className="result-details">
                <div className="result-item">
                  <span className="result-item-label">Amount</span>
                  <span className="result-item-value amount">{result.amount} {result.currency || 'KES'}</span>
                </div>

                {result.status && (
                  <div className="result-item">
                    <span className="result-item-label">Status</span>
                    <span className={`status-badge ${result.status.toLowerCase()}`}>{result.status}</span>
                  </div>
                )}

                {result.sender && (
                  <div className="result-item">
                    <span className="result-item-label">From</span>
                    <span className="result-item-value">{result.sender.substring(0, 8)}...{result.sender.substring(result.sender.length - 4)}</span>
                  </div>
                )}

                {result.recipient && (
                  <div className="result-item">
                    <span className="result-item-label">To</span>
                    <span className="result-item-value">{result.recipient.substring(0, 8)}...{result.recipient.substring(result.recipient.length - 4)}</span>
                  </div>
                )}

                {result.timestamp && (
                  <div className="result-item">
                    <span className="result-item-label">Transaction Time</span>
                    <span className="result-item-value">{formatDate(result.timestamp)}</span>
                  </div>
                )}

                {result.transactionHash && (
                  <div className="result-item clickable" onClick={() => copyToClipboard(result.transactionHash || '')}>
                    <span className="result-item-label">Transaction Hash</span>
                    <span className="result-item-value hash">{result.transactionHash.substring(0, 12)}...{result.transactionHash.substring(result.transactionHash.length - 8)}</span>
                  </div>
                )}

                {result.externalId && (
                  <div className="result-item">
                    <span className="result-item-label">External ID</span>
                    <span className="result-item-value">{result.externalId}</span>
                  </div>
                )}

                {result.description && (
                  <div className="result-item full-width">
                    <span className="result-item-label">Description</span>
                    <span className="result-item-value">{result.description}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="help-section">
            <div className="help-title">How verification works</div>
            <p className="help-text">
              When someone sends you money through PILB, you receive an 8-character verification code. Enter this code to verify the payment has been recorded on the Stellar blockchain.
            </p>
            <div className="help-links">
              <a onClick={() => navigate('/docs')}>Learn more about verification</a>
              <span className="separator">•</span>
              <a onClick={() => navigate('/send')}>Send money</a>
            </div>
          </div>

          {recentVerifications.length > 0 && !result && (
            <div className="recent-section">
              <div className="recent-title">Recent Verifications</div>
              <div className="recent-list">
                {recentVerifications.map((v, i) => (
                  <div key={v.id || i} className="recent-item" onClick={() => handleQuickVerify(v.id || '')}>
                    <div className="recent-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="recent-details">
                      <span className="recent-amount">{v.amount} {v.currency || 'KES'}</span>
                      <span className="recent-time">{formatDate(v.timestamp)}</span>
                    </div>
                    <div className="recent-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
