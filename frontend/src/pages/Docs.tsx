import { Link } from 'react-router-dom';

export default function Docs() {
  return (
    <div style={{ 
      fontFamily: "'Sora', sans-serif", 
      background: "#FAFAFA", 
      color: "#111", 
      minHeight: "100vh",
      overflowX: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
          --bg: #FAFAFA;
          --white: #FFFFFF;
          --ink: #0D0D0D;
          --ink-2: #3A3A3A;
          --ink-3: #888;
          --ink-4: #BDBDBD;
          --gold: #D4AF37;
          --border: #E8E8E8;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .docs-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 60px 24px;
          animation: fadeIn 0.5s ease;
        }

        .docs-header {
          margin-bottom: 48px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }

        .docs-header h1 {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: -1px;
        }

        .docs-header p {
          font-size: 16px;
          color: var(--ink-2);
          line-height: 1.6;
        }

        .docs-nav {
          position: sticky;
          top: 24px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 40px;
        }

        .docs-nav h3 {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--ink-3);
          margin-bottom: 16px;
        }

        .docs-nav a {
          display: block;
          padding: 8px 0;
          color: var(--ink-2);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .docs-nav a:hover {
          color: var(--gold);
        }

        .docs-section {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 32px;
        }

        .docs-section h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }

        .docs-section p {
          font-size: 15px;
          color: var(--ink-2);
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .docs-section ul {
          margin-left: 20px;
          margin-bottom: 16px;
        }

        .docs-section li {
          font-size: 14px;
          color: var(--ink-2);
          line-height: 1.7;
          margin-bottom: 8px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }

        .feature-card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
        }

        .feature-card h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .feature-card p {
          font-size: 14px;
          color: var(--ink-3);
          margin-bottom: 0;
        }

        .code-block {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          overflow-x: auto;
        }

        .code-block code {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 13px;
          color: #e0e0e0;
          line-height: 1.6;
        }

        .step {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: var(--gold);
          color: var(--white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .step-content h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .step-content p {
          font-size: 14px;
          color: var(--ink-2);
          margin-bottom: 0;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--ink-3);
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 32px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: var(--gold);
        }

        @media (max-width: 768px) {
          .docs-container {
            padding: 40px 16px;
          }
          .docs-header h1 {
            font-size: 28px;
          }
          .docs-section {
            padding: 24px;
          }
        }
      `}</style>

      <div className="docs-container">
        <a href="/" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </a>

        <div className="docs-header">
          <h1>PILB Documentation</h1>
          <p>Learn how to send and receive money anonymously using Stellar and M-Pesa</p>
        </div>

        <nav className="docs-nav">
          <h3>Navigation</h3>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/send">Send Money</Link>
          <Link to="/links">Request Payment</Link>
          <Link to="/verify">Verify</Link>
          <Link to="/scheduled">Scheduled</Link>
          <Link to="/login">Login</Link>
          <h3 style={{ marginTop: '24px' }}>Contents</h3>
          <a href="#overview">Overview</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#getting-started">Getting Started</a>
          <a href="#security">Security & Privacy</a>
          <a href="#faq">FAQ</a>
        </nav>

        <section id="overview" className="docs-section">
          <h2>Overview</h2>
          <p>
            PILB (Private Instant Ledger Bridge) is a decentralized payment platform that enables 
            anonymous money transfers to and from Kenya via M-Pesa. Built on 
            the Stellar blockchain, PILB ensures fast, secure, and private transactions without 
            requiring identity verification.
          </p>
          <p>
            Whether you're sending money to family, friends, receiving payments from clients, 
            or making business payments, PILB provides a seamless experience with complete privacy protection.
          </p>
        </section>

        <section id="features" className="docs-section">
          <h2>Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h4>⚡ Instant Transfers</h4>
              <p>Transactions settle in seconds, not days. Recipients receive money almost immediately.</p>
            </div>
            <div className="feature-card">
              <h4>🔒 Complete Privacy</h4>
              <p>No KYC required. Your identity is never stored or shared with anyone.</p>
            </div>
            <div className="feature-card">
              <h4>💱 Send & Receive</h4>
              <p>Send or receive money anonymously. Create payment links to receive payments from anyone globally.</p>
            </div>
            <div className="feature-card">
              <h4>💰 Multi-Currency Support</h4>
              <p>Send using XLM, USDC, or other Stellar tokens. Recipients get M-Pesa in KES.</p>
            </div>
            <div className="feature-card">
              <h4>🌍 Global Reach</h4>
              <p>Send from anywhere in the world to any M-Pesa number in Kenya.</p>
            </div>
            <div className="feature-card">
              <h4>📱 Easy to Use</h4>
              <p>Simple wallet connection. No complex setups or technical knowledge needed.</p>
            </div>
            <div className="feature-card">
              <h4>💎 Low Fees</h4>
              <p>Competitive exchange rates and minimal transaction fees.</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="docs-section">
          <h2>How It Works</h2>
          <p>Sending money through PILB is simple:</p>
          
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Connect Your Wallet</h4>
              <p>Connect your Freighter wallet (Stellar wallet extension) to the PILB platform.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Enter Recipient Details</h4>
              <p>Enter the recipient's M-Pesa phone number and the amount you want to send.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Review & Confirm</h4>
              <p>Review the exchange rate and fees, then confirm the transaction in your wallet.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Instant Delivery</h4>
              <p>The recipient receives the money in their M-Pesa account within seconds.</p>
            </div>
          </div>
          
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '24px 0 16px' }}>Receiving Payments</h3>
          <p style={{ marginBottom: '20px' }}>You can also receive anonymous payments by creating a payment link:</p>
          
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Create Payment Link</h4>
              <p>Go to Request Payment and create a payment link with your desired amount and description.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Share Link</h4>
              <p>Share your payment link with anyone who needs to pay you - locally or internationally.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Get Paid</h4>
              <p>When someone pays through the link, the funds are converted and sent to your M-Pesa instantly.</p>
            </div>
          </div>
        </section>

        <section id="getting-started" className="docs-section">
          <h2>Getting Started</h2>
          <p>Before you can send or receive money, you'll need a Stellar wallet. Here's how to get started:</p>
          
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '12px' }}>1. Install Freighter Wallet</h4>
          <p>Freighter is a browser extension wallet for Stellar. Download it from <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37', textDecoration: 'none' }}>freighter.app</a> and install it in your browser.</p>
          
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '12px' }}>2. Create Your Wallet</h4>
          <p>Open Freighter, create a new wallet, and securely store your recovery phrase. This is the only way to recover your account.</p>
          
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '12px' }}>3. Fund Your Wallet</h4>
          <p>You need XLM (Stellar's native currency) to send transactions. You can buy XLM from exchanges like Binance, Coinbase, or Kraken, then transfer to your Freighter address.</p>
          
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '12px' }}>4. Start Sending & Receiving</h4>
          <p>Return to PILB, connect your wallet, and start sending money to Kenya or create payment links to receive payments!</p>
        </section>

        <section id="security" className="docs-section">
          <h2>Security & Privacy</h2>
          <p>Your security and privacy are our top priorities:</p>
          
          <ul>
            <li><strong>No Identity Storage:</strong> PILB does not store any personal identification information. Your identity remains completely private.</li>
            <li><strong>No KYC Required:</strong> Unlike traditional remittance services, we don't require identity verification documents.</li>
            <li><strong>Non-Custodial:</strong> Your funds remain in your control. We never hold your money.</li>
            <li><strong>Blockchain Transparency:</strong> All transactions are recorded on the Stellar blockchain, providing transparency while maintaining privacy.</li>
            <li><strong>Secure Wallet Connection:</strong> We use Stellar's SEP-10 authentication for secure wallet verification.</li>
          </ul>
        </section>

        <section id="faq" className="docs-section">
          <h2>Frequently Asked Questions</h2>
          
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>How long does a transfer take?</h4>
          <p>Transfers are typically completed within seconds. In rare cases, it may take a few minutes.</p>
          
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '8px' }}>What cryptocurrencies can I use?</h4>
          <p>You can send using XLM (Stellar's native token) or USDC. More currencies coming soon.</p>
          
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '8px' }}>How much does it cost?</h4>
          <p>Our fees are competitive and transparent. You'll see the exact amount you'll pay before confirming your transaction.</p>
          
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '8px' }}>Is there a limit on how much I can send?</h4>
          <p>There are no artificial limits. However, very large transactions may require additional processing time.</p>
          
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '8px' }}>What if I sent money to the wrong number?</h4>
          <p>Please double-check the recipient number before confirming. Once a transaction is on the blockchain, it cannot be reversed.</p>
          
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '8px' }}>How do I get support?</h4>
          <p>If you need help, please reach out through our official channels. We're here to assist you.</p>
        </section>

        <div className="docs-section" style={{ textAlign: 'center' }}>
          <h2>Ready to Get Started?</h2>
          <p style={{ marginBottom: '24px' }}>Connect your wallet and start sending money to Kenya instantly.</p>
          <a href="/login" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            background: '#D4AF37', 
            color: '#fff', 
            padding: '14px 28px', 
            borderRadius: '100px', 
            fontSize: '15px', 
            fontWeight: '600', 
            textDecoration: 'none',
            transition: 'transform 0.2s'
          }}>
            Connect Wallet
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
