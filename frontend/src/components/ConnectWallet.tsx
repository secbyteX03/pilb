import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { authApi } from '../api/paymentApi';
import * as freighterApi from '@stellar/freighter-api';

export default function ConnectWallet() {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if Freighter is connected
      const isConnected = await freighterApi.isConnected();
      console.log('Freighter connected:', isConnected);
      
      if (!isConnected) {
        throw new Error('Please connect to Freighter wallet first. Open the Freighter extension and unlock it.');
      }

      // Get public key
      const publicKey = await freighterApi.getPublicKey();
      console.log('Public key:', publicKey);

      // Get challenge from backend
      const challenge = await authApi.getChallenge(publicKey);
      console.log('Challenge received:', challenge);

      // Sign the challenge transaction
      const signedTransaction = await freighterApi.signTransaction(challenge.transaction, {
        networkPassphrase: challenge.networkPassphrase,
      });
      console.log('Transaction signed');

      // Authenticate with backend
      const authResult = await authApi.authenticate(publicKey, signedTransaction);
      console.log('Authentication successful:', authResult);

      // Store token and user info
      localStorage.setItem('auth_token', authResult.token);
      setUser({
        publicKey: authResult.publicKey,
        address: authResult.publicKey,
      });
      
      // Show success and redirect to dashboard
      setError('Connected successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet. Make sure Freighter is unlocked.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        
        :root {
          --black: #0a0a0a;
          --white: #ffffff;
          --gold: #D4AF37;
          --gold-light: #FFD700;
          --gold-glow: rgba(212, 175, 55, 0.3);
        }

        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
        }

        .btn-connect {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          color: var(--black);
          padding: 16px 32px;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
          box-shadow: 0 4px 20px var(--gold-glow);
          animation: pulse-gold 2s ease-in-out infinite;
        }

        .btn-connect:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px var(--gold-glow);
        }

        .btn-connect:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          animation: none;
        }

        .error-msg {
          margin-top: 16px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          color: #ef4444;
          font-size: 13px;
        }

        .success-msg {
          margin-top: 16px;
          padding: 12px 16px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 10px;
          color: #22c55e;
          font-size: 13px;
        }

        .helper-text {
          margin-top: 20px;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
        }

        .helper-text a {
          color: var(--gold);
          text-decoration: none;
          transition: color 0.2s;
        }

        .helper-text a:hover {
          color: var(--gold-light);
        }

        .helper-note {
          margin-top: 8px;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }
      `}</style>
      
      <button
        onClick={handleConnect}
        disabled={loading}
        className="btn-connect"
      >
        {loading ? (
          <>
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            Connect Wallet
          </>
        )}
      </button>
      
      {error && (
        <div className={error.includes('success') ? 'success-msg' : 'error-msg'}>
          {error}
        </div>
      )}
      
      <p className="helper-text">
        Don't have Freighter?{' '}
        <a
          href="https://www.freighter.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install it here
        </a>
      </p>
      <p className="helper-note">
        Make sure your Freighter extension is unlocked
      </p>
    </div>
  );
}
