import React, { ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, logout, user } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-profile-dropdown')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  return (
    <div style={{ 
      fontFamily: "'Sora', sans-serif", 
      background: "#0a0a0a", 
      color: "#fff", 
      minHeight: "100vh" 
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
          --gold-glow: rgba(212, 175, 55, 0.3);
        }

        .layout-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-mark {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px var(--gold-glow);
        }

        .logo-text {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: var(--white);
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-link {
          padding: 10px 16px;
          color: var(--white-2);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .nav-link:hover {
          color: var(--white);
          background: rgba(255,255,255,0.05);
        }

        .nav-link-gold {
          color: var(--gold);
        }

        .nav-link-gold:hover {
          background: rgba(212, 175, 55, 0.1);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          color: var(--black);
          font-size: 14px;
          font-weight: 600;
          border-radius: 100px;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 16px var(--gold-glow);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--gold-glow);
        }

        .btn-logout {
          padding: 10px 16px;
          color: var(--white-2);
          font-size: 14px;
          font-weight: 500;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
        }

        .btn-logout:hover {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.1);
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          font-size: 13px;
          color: var(--white-2);
        }

        .user-key {
          font-family: monospace;
          color: var(--gold);
        }

        .user-profile-dropdown {
          position: relative;
        }

        .profile-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: var(--black-2);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px;
          min-width: 280px;
          z-index: 1000;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        .profile-header {
          padding: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 8px;
        }

        .profile-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--white-3);
          margin-bottom: 8px;
        }

        .profile-key {
          display: block;
          font-family: monospace;
          font-size: 12px;
          color: var(--white-2);
          word-break: break-all;
          background: rgba(255,255,255,0.03);
          padding: 8px;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .copy-btn {
          background: rgba(212, 175, 55, 0.1);
          color: var(--gold);
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
        }

        .copy-btn:hover {
          background: rgba(212, 175, 55, 0.2);
        }

        .profile-logout {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 12px;
          color: #ef4444;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
        }

        .profile-logout:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .hidden {
          display: none;
        }

        .layout-footer {
          background: var(--black-2);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 48px 24px 32px;
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-logo-text {
          font-size: 20px;
          font-weight: 700;
          color: var(--white);
        }

        .footer-desc {
          font-size: 14px;
          color: #111 !important;
          margin-top: 12px;
          line-height: 1.6;
          max-width: 280px;
        }

        .footer-tagline { font-size: 13px; color: #111 !important; margin-top: 12px; line-height: 1.6; max-width: 200px; }

        .footer-col h5 {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--white-3);
          margin-bottom: 16px;
        }

        .footer-col a {
          display: block;
          font-size: 14px;
          color: var(--white-2);
          text-decoration: none;
          margin-bottom: 10px;
          transition: color 0.2s;
        }

        .footer-col a:hover {
          color: var(--gold);
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 40px auto 0;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-bottom p {
          font-size: 13px;
          color: var(--white-3);
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #22c55e;
          font-weight: 500;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .header-inner {
            padding: 0 16px;
            height: 64px;
          }
          .logo-mark {
            width: 36px;
            height: 36px;
          }
          .logo-text {
            font-size: 18px;
          }
          .header-nav {
            gap: 4px;
          }
          .nav-link {
            padding: 8px 12px;
            font-size: 13px;
          }
          .footer-inner {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
        }
      `}</style>

      {/* Header */}
      <header className="layout-header">
        <div className="header-inner">
          <Link to="/" className="header-logo">
            <div className="logo-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2"/>
                <path d="M8 11V7a4 4 0 018 0v4"/>
              </svg>
            </div>
            <span className="logo-text">PILB</span>
          </Link>
          
          <nav className="header-nav">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/links" className="nav-link">
              Request Payment
            </Link>
            <Link to="/verify" className="nav-link">
              Verify
            </Link>
            <Link to="/scheduled" className="nav-link">
              Scheduled
            </Link>
            <Link to="/send" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              Send
            </Link>
            {isAuthenticated && (
              <div className="user-profile-dropdown">
                <button className="user-badge" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                  <span className="user-key">{(user?.publicKey || '').substring(0, 6)}...</span>
                </button>
                <div className={`profile-menu ${showProfileMenu ? '' : 'hidden'}`}>
                  <div className="profile-header">
                    <span className="profile-label">Wallet Address</span>
                    <code className="profile-key">{user?.publicKey}</code>
                    <button className="copy-btn" onClick={() => {
                      navigator.clipboard.writeText(user?.publicKey || '');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <button onClick={logout} className="profile-logout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ minHeight: "calc(100vh - 72px - 200px)" }}>
        {children}
      </main>

      {/* Footer */}
      <footer className="layout-footer">
        <div className="footer-inner">
          {/* Brand */}
          <div>
            <div className="footer-brand">
              <div className="logo-mark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="10" rx="2"/>
                  <path d="M8 11V7a4 4 0 018 0v4"/>
                </svg>
              </div>
              <span className="footer-logo-text">PILB</span>
            </div>
            <p className="footer-desc">
              Send money anonymously to anyone in Kenya via M-Pesa. Your privacy is our priority.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h5>Quick Links</h5>
            <Link to="/send">Send Money</Link>
            <Link to="/verify">Verify</Link>
            <Link to="/links">Request</Link>
            <Link to="/scheduled">Scheduled</Link>
          </div>

          {/* Resources */}
          <div className="footer-col">
            <h5>Resources</h5>
            <a href="#">Documentation</a>
            <a href="#">API</a>
            <a href="#">Status</a>
            <a href="#">Blog</a>
          </div>

          {/* Legal */}
          <div className="footer-col">
            <h5>Legal</h5>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">License</a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© 2024 PILB. All rights reserved.</p>
          <div className="footer-status">
            <span className="status-dot"></span>
            All Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
