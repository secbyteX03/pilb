import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectWallet from '../components/ConnectWallet';
import { useAuthStore } from '../hooks/useAuth';

export default function Login() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div style={{ 
      fontFamily: "'Sora', sans-serif", 
      background: "#0a0a0a", 
      color: "#fff", 
      minHeight: "100vh",
      overflowX: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
          --black: #0a0a0a;
          --black-2: #1a1a1a;
          --black-3: #2a2a2a;
          --white: #ffffff;
          --white-2: rgba(255,255,255,0.7);
          --white-3: rgba(255,255,255,0.5);
          --gold: #D4AF37;
          --gold-light: #FFD700;
          --gold-dark: #B8962F;
          --gold-glow: rgba(212, 175, 55, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .bg-effects {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .effect-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, var(--gold-glow) 0%, transparent 70%);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
          bottom: -50px;
          right: -50px;
          animation-delay: -4s;
        }

        .orb-3 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, var(--gold-glow) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 48px 40px;
          position: relative;
          animation: fadeIn 0.6s ease both;
          box-shadow: 
            0 0 0 1px rgba(255,255,255,0.05) inset,
            0 20px 60px rgba(0,0,0,0.5);
        }

        .login-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, var(--gold) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 40px;
        }

        .logo-mark {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px var(--gold-glow);
        }

        .logo-text {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -1px;
          background: linear-gradient(90deg, var(--white) 0%, var(--gold) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-title {
          font-size: 24px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          font-size: 14px;
          color: var(--white-3);
          text-align: center;
          margin-bottom: 32px;
        }

        .wallet-section {
          text-align: center;
          padding: 32px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin-top: 32px;
        }

        .wallet-title {
          font-size: 12px;
          color: var(--white-3);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 20px;
        }

        .btn-connect {
          display: inline-flex;
          align-items: center;
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

        .btn-connect:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px var(--gold-glow);
        }

        .btn-connect:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          animation: none;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 28px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }

        .divider-text {
          font-size: 12px;
          color: var(--white-3);
        }

        .nav-back {
          position: absolute;
          top: 24px;
          left: 24px;
        }

        .nav-back a {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--white-3);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .nav-back a:hover {
          color: var(--gold);
        }

        /* Glass input styles */
        .glass-input {
          width: 100%;
          padding: 16px 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: var(--white);
          font-size: 15px;
          font-family: 'Sora', sans-serif;
          transition: all 0.2s;
          outline: none;
        }

        .glass-input::placeholder {
          color: var(--white-3);
        }

        .glass-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px var(--gold-glow);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 13px;
          color: var(--white-2);
          margin-bottom: 8px;
          font-weight: 500;
        }

        .btn-submit {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          color: var(--black);
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
          margin-top: 8px;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px var(--gold-glow);
        }

        .features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
          justify-content: center;
        }

        .feature-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 100px;
          font-size: 12px;
          color: var(--white-2);
        }

        .feature-tag svg {
          width: 14px;
          height: 14px;
          color: var(--gold);
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px;
          }
          .logo-text {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="login-container">
        {/* Background Effects */}
        <div className="bg-effects">
          <div className="effect-orb orb-1"></div>
          <div className="effect-orb orb-2"></div>
          <div className="effect-orb orb-3"></div>
        </div>

        {/* Back Nav */}
        <div className="nav-back">
          <a href="/">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </a>
        </div>

        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="logo-mark">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2"/>
                <path d="M8 11V7a4 4 0 018 0v4"/>
              </svg>
            </div>
            <span className="logo-text">PILB</span>
          </div>

          {/* Title */}
          <h1 className="login-title">Welcome</h1>
          <p className="login-subtitle">Connect your wallet to access your dashboard</p>

          {/* Wallet Connection Section */}
          <div className="wallet-section">
            <div className="wallet-title">Connect Your Wallet</div>
            <ConnectWallet />
            
            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">FOR</span>
              <div className="divider-line"></div>
            </div>

            {/* Feature Tags */}
            <div className="features-list">
              <div className="feature-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Instant Transfers
              </div>
              <div className="feature-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Private
              </div>
              <div className="feature-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                No KYC
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
