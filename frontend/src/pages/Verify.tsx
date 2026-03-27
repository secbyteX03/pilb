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
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

        :root {
          --bg: #FAFAFA;
          --white: #FFFFFF;
          --ink: #0D0D0D;
          --ink-2: #3A3A3A;
          --ink-3: #888;
          --ink-4: #BDBDBD;
          --green: #00B85A;
          --green-light: #E6F9EF;
          --blue: #0071E3;
          --blue-light: #EAF3FF;
          --border: #E8E8E8;
          --border-strong: #D0D0D0;
          --radius: 18px;
        }

        .verify-container {
          max-width: 560px;
          margin: 0 auto;
          padding: 100px 40px 80px;
        }

        .verify-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .verify-eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: var(--blue);
          margin-bottom: 14px;
        }

        .verify-heading {
          font-size: clamp(32px, 3.6vw, 48px);
          font-weight: 800;
          letter-spacing: -1.8px;
          color: var(--ink);
          line-height: 1.08;
          margin-bottom: 14px;
        }

        .verify-sub {
          font-size: 16px;
          font-weight: 300;
          color: var(--ink-2);
          line-height: 1.7;
        }

        .verify-form {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 36px;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--ink-2);
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 14px 18px;
          border: 1px solid var(--border-strong);
          border-radius: 12px;
          font-size: 16px;
          font-family: 'Sora', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--blue);
          box-shadow: 0 0 0 3px var(--blue-light);
        }

        .form-input::placeholder {
          color: var(--ink-4);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: var(--ink);
          color: #fff;
          padding: 14px 26px;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.18);
          border: none;
          cursor: pointer;
          width: 100%;
          font-family: 'Sora', sans-serif;
        }

        .btn-primary:hover {
          background: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.22);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          color: #DC2626;
          font-size: 14px;
          text-align: center;
        }

        .result-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 36px;
          animation: fadeUp 0.6s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .result-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .result-icon {
          width: 64px;
          height: 64px;
          background: var(--green-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .result-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 8px;
        }

        .result-item {
          background: var(--bg);
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 12px;
        }

        .result-item:last-child {
          margin-bottom: 0;
        }

        .result-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .result-value {
          font-size: 16px;
          font-weight: 600;
          color: var(--ink);
          word-break: break-all;
        }

        .result-value.amount {
          font-size: 24px;
          font-weight: 700;
          color: var(--green);
        }
      `}</style>

      <div className="verify-container">
        <div className="verify-header">
          <div className="verify-eyebrow">Verification</div>
          <h1 className="verify-heading">Verify Payment</h1>
          <p className="verify-sub">
            Enter the verification code to confirm a payment on the Stellar blockchain.
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
              placeholder="Enter 8-character code"
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Verifying...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00B85A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="result-title">Payment Verified!</h2>
            </div>

            <div className="result-item">
              <div className="result-label">Amount</div>
              <div className="result-value amount">{result.amount} KES</div>
            </div>

            {result.timestamp && (
              <div className="result-item">
                <div className="result-label">Timestamp</div>
                <div className="result-value">{new Date(result.timestamp).toLocaleString()}</div>
              </div>
            )}

            {result.transactionHash && (
              <div className="result-item">
                <div className="result-label">Transaction Hash</div>
                <div className="result-value">{result.transactionHash}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
