export default function Home() {
  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh", overflowX: "hidden" }}>
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
          --green: #00B85A;
          --green-light: #E6F9EF;
          --blue: #0071E3;
          --blue-light: #EAF3FF;
          --border: #E8E8E8;
          --border-strong: #D0D0D0;
          --radius: 18px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,184,90,0.4); }
          50%       { box-shadow: 0 0 0 6px rgba(0,184,90,0); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .u1 { animation: fadeUp 0.6s ease both; }
        .u2 { animation: fadeUp 0.6s 0.1s ease both; }
        .u3 { animation: fadeUp 0.6s 0.2s ease both; }
        .u4 { animation: fadeUp 0.6s 0.32s ease both; }
        .u5 { animation: fadeUp 0.6s 0.44s ease both; }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          background: rgba(250,250,250,0.82);
          backdrop-filter: saturate(180%) blur(24px);
          border-bottom: 1px solid var(--border);
          height: 56px; display: flex; align-items: center;
          padding: 0 40px; justify-content: space-between;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 9px;
          font-size: 17px; font-weight: 700; color: var(--ink);
          letter-spacing: -0.4px; text-decoration: none;
        }
        .nav-mark {
          width: 28px; height: 28px; border-radius: 8px;
          background: var(--ink);
          display: flex; align-items: center; justify-content: center;
        }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-links a {
          font-size: 14px; font-weight: 400; color: var(--ink-2);
          text-decoration: none; transition: color 0.15s;
        }
        .nav-links a:hover { color: var(--ink); }
        .nav-cta {
          background: var(--ink) !important; color: #fff !important;
          padding: 8px 18px; border-radius: 100px;
          font-size: 14px !important; font-weight: 500 !important;
          transition: background 0.2s !important;
        }
        .nav-cta:hover { background: #333 !important; }

        .hero {
          padding: 50px 40px 60px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 32px; align-items: center;
          max-width: 1160px; margin: 0 auto;
        }

        .hero-chip {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--green-light); border: 1px solid rgba(0,184,90,0.2);
          color: #008040; font-size: 12px; font-weight: 600;
          padding: 5px 12px; border-radius: 100px; margin-bottom: 24px;
        }
        .hero-chip-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--green); animation: pulseGreen 2s ease-in-out infinite;
        }

        .hero h1 {
          font-size: clamp(42px, 4.8vw, 64px); font-weight: 800;
          line-height: 1.06; letter-spacing: -2.5px; color: var(--ink); margin-bottom: 22px;
        }
        .hero h1 .accent { color: var(--blue); }

        .hero-sub {
          font-size: 17px; font-weight: 300; line-height: 1.72;
          color: var(--ink-2); max-width: 430px; margin-bottom: 36px;
        }

        .hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--ink); color: #fff;
          padding: 14px 26px; border-radius: 100px;
          font-size: 15px; font-weight: 500; text-decoration: none;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.18);
        }
        .btn-primary:hover { background: #1a1a1a; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.22); }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--white); color: var(--ink-2);
          padding: 14px 26px; border-radius: 100px;
          font-size: 15px; font-weight: 500; text-decoration: none;
          border: 1px solid var(--border-strong);
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .btn-secondary:hover { border-color: var(--ink-3); color: var(--ink); transform: translateY(-1px); }

        .hero-metrics {
          display: flex; gap: 0; margin-top: 48px;
          border-top: 1px solid var(--border); padding-top: 36px;
        }
        .metric { flex: 1; padding-right: 24px; border-right: 1px solid var(--border); }
        .metric:last-child { border-right: none; padding-right: 0; padding-left: 24px; }
        .metric:nth-child(2) { padding: 0 24px; }
        .metric-num { font-size: 26px; font-weight: 700; color: var(--ink); letter-spacing: -1px; line-height: 1; }
        .metric-label { font-size: 12px; color: var(--ink-3); margin-top: 5px; }

        .phone-scene {
          display: flex; justify-content: center; align-items: center;
          position: relative; padding: 40px 0;
          animation: float 7s ease-in-out infinite;
        }
        .phone-frame {
          width: 360px; height: 600px; background: var(--white);
          border-radius: 44px; border: 1px solid var(--border);
          box-shadow: 0 0 0 1px rgba(0,0,0,0.04), 0 24px 60px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06);
          overflow: hidden; position: relative;
        }
        .phone-island {
          width: 90px; height: 26px; background: #0D0D0D;
          border-radius: 0 0 18px 18px; margin: 0 auto;
        }
        .phone-body { padding: 12px 18px 18px; }
        .phone-header-row {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;
        }
        .phone-app-title { font-size: 17px; font-weight: 700; color: var(--ink); letter-spacing: -0.4px; }
        .phone-live { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--green); font-weight: 500; }
        .phone-live-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; animation: pulseGreen 2s ease-in-out infinite; }

        .balance-card { background: var(--ink); border-radius: 16px; padding: 18px; margin-bottom: 14px; }
        .balance-tag { font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px; }
        .balance-value { font-size: 28px; font-weight: 700; color: #fff; letter-spacing: -1px; line-height: 1; }
        .balance-sub { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 8px; display: flex; align-items: center; gap: 5px; }
        .balance-sub-dot { width: 5px; height: 5px; background: var(--green); border-radius: 50%; }

        .phone-section-label { font-size: 11px; font-weight: 600; color: var(--ink-3); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px; }

        .tx-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid var(--border);
        }
        .tx-row:last-of-type { border-bottom: none; }
        .tx-left { display: flex; align-items: center; gap: 10px; }
        .tx-av {
          width: 34px; height: 34px; border-radius: 50%;
          background: var(--bg); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: var(--ink-2); flex-shrink: 0;
        }
        .tx-name { font-size: 13px; font-weight: 500; color: var(--ink); }
        .tx-via { font-size: 10px; color: var(--ink-3); margin-top: 1px; }
        .tx-amount { font-size: 13px; font-weight: 600; color: var(--ink); }
        .tx-done { font-size: 10px; color: var(--green); font-weight: 500; text-align: right; margin-top: 2px; }

        .send-btn {
          width: 100%; padding: 13px; background: var(--ink); color: #fff;
          border: none; border-radius: 12px; font-size: 14px; font-weight: 600;
          cursor: pointer; margin-top: 14px; font-family: 'Sora', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }

        .pill {
          position: absolute; background: var(--white); border: 1px solid var(--border);
          border-radius: 12px; padding: 10px 14px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08); white-space: nowrap;
        }
        .pill-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pill-title { font-size: 12px; font-weight: 600; color: var(--ink); line-height: 1.3; }
        .pill-sub   { font-size: 10px; color: var(--ink-3); margin-top: 1px; }

        .trust-bar {
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          background: var(--ink); overflow: hidden; height: 52px; display: flex; align-items: center;
        }
        .trust-ticker { display: flex; animation: ticker 28s linear infinite; }
        .trust-item {
          display: flex; align-items: center; gap: 8px;
          padding: 0 40px; font-size: 13px; color: var(--ink-3); white-space: nowrap;
        }

        .section { padding: 100px 40px; max-width: 1160px; margin: 0 auto; }
        .section-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 1.4px; text-transform: uppercase; color: var(--blue); margin-bottom: 14px; text-align: center; }
        .section-heading { font-size: clamp(32px, 3.6vw, 48px); font-weight: 800; letter-spacing: -1.8px; color: var(--ink); line-height: 1.08; max-width: 560px; text-align: center; margin: 0 auto; }
        .section-sub { font-size: 16px; font-weight: 300; color: var(--ink-2); line-height: 1.7; max-width: 500px; margin-top: 14px; text-align: center; margin-left: auto; margin-right: auto; }

        .how-bg { background: var(--white); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }

        .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border-radius: 20px; overflow: hidden; margin-top: 56px; }
        .step-cell { background: var(--white); padding: 36px 28px; transition: background 0.2s; }
        .step-cell:hover { background: #F5F9FF; }
        .step-n { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; color: var(--blue); text-transform: uppercase; margin-bottom: 20px; }
        .step-icon-wrap { width: 44px; height: 44px; border-radius: 12px; background: var(--bg); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
        .step-cell h3 { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 8px; letter-spacing: -0.2px; }
        .step-cell p  { font-size: 13px; color: var(--ink-3); line-height: 1.65; }

        .bento { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 56px; }
        .bento-wide { grid-column: 1 / -1; }
        .bento-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 36px; transition: border-color 0.2s, box-shadow 0.2s; overflow: hidden; position: relative; }
        .bento-card:hover { border-color: var(--border-strong); box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .bento-chip { display: inline-flex; align-items: center; gap: 6px; background: var(--blue-light); color: var(--blue); font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px; margin-bottom: 16px; }
        .bento-chip.green { background: var(--green-light); color: #007a3d; }
        .bento-card h3 { font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: -0.6px; margin-bottom: 10px; }
        .bento-card p { font-size: 14px; color: var(--ink-3); line-height: 1.7; max-width: 360px; }
        .bento-visual { position: absolute; right: 32px; bottom: 32px; opacity: 0.08; font-size: 80px; line-height: 1; pointer-events: none; }

        .flow-row { display: flex; align-items: stretch; margin-top: 32px; background: var(--bg); border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
        .flow-node { flex: 1; padding: 18px 20px; text-align: center; border-right: 1px solid var(--border); }
        .flow-node:last-child { border-right: none; }
        .flow-node-label { font-size: 11px; font-weight: 600; color: var(--ink-3); letter-spacing: 0.4px; text-transform: uppercase; margin-bottom: 6px; }
        .flow-node-val { font-size: 14px; font-weight: 600; color: var(--ink); }
        .flow-sep { display: flex; align-items: center; padding: 0 2px; color: var(--ink-4); font-size: 18px; flex-shrink: 0; background: var(--bg); border-right: 1px solid var(--border); }

        .use-bg { background: var(--white); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .use-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 56px; }
        .use-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px; transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
        .use-card:hover { border-color: var(--border-strong); transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.06); }
        .use-emoji { font-size: 28px; margin-bottom: 18px; display: block; }
        .use-card h3 { font-size: 17px; font-weight: 700; color: var(--ink); margin-bottom: 8px; letter-spacing: -0.3px; }
        .use-card p  { font-size: 14px; color: var(--ink-3); line-height: 1.65; }

        .cta-section { padding: 120px 40px; text-align: center; background: var(--ink); position: relative; overflow: hidden; }
        .cta-chip { display: inline-flex; align-items: center; gap: 7px; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 500; padding: 5px 14px; border-radius: 100px; margin-bottom: 28px; }
        .cta-section h2 { font-size: clamp(36px, 4.5vw, 56px); font-weight: 800; color: #fff; letter-spacing: -2px; line-height: 1.07; max-width: 600px; margin: 0 auto 20px; }
        .cta-section h2 span { color: rgba(255,255,255,0.3); }
        .cta-sub { font-size: 16px; font-weight: 300; color: rgba(255,255,255,0.5); max-width: 420px; margin: 0 auto 44px; line-height: 1.7; }
        .cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn-white { background: #fff; color: var(--ink); padding: 14px 28px; border-radius: 100px; font-size: 15px; font-weight: 600; text-decoration: none; transition: background 0.2s, transform 0.15s; display: inline-block; }
        .btn-white:hover { background: #f0f0f0; transform: translateY(-2px); }
        .btn-ghost-dark { background: transparent; color: rgba(255,255,255,0.6); padding: 14px 28px; border-radius: 100px; font-size: 15px; font-weight: 400; text-decoration: none; border: 1px solid rgba(255,255,255,0.15); transition: border-color 0.2s, color 0.2s; display: inline-block; }
        .btn-ghost-dark:hover { border-color: rgba(255,255,255,0.4); color: #fff; }

        footer { background: var(--white); border-top: 1px solid var(--border); padding: 64px 40px 40px; }
        .footer-inner { max-width: 1160px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; }
        .footer-tagline { font-size: 13px; color: var(--ink-3); margin-top: 12px; line-height: 1.6; max-width: 200px; }
        .footer-col h5 { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--ink-3); margin-bottom: 16px; }
        .footer-col a { display: block; font-size: 14px; color: var(--ink-2); text-decoration: none; margin-bottom: 10px; transition: color 0.15s; }
        .footer-col a:hover { color: var(--ink); }
        .footer-bottom { max-width: 1160px; margin: 48px auto 0; padding-top: 24px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .footer-bottom p { font-size: 12px; color: var(--ink-4); }
        .status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--green); font-weight: 500; }
        .status-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; animation: pulseGreen 2s ease-in-out infinite; }

        @media (max-width: 860px) {
          .hero { grid-template-columns: 1fr; gap: 48px; padding: 100px 24px 60px; }
          .steps { grid-template-columns: 1fr 1fr; }
          .bento { grid-template-columns: 1fr; }
          .bento-wide { grid-column: 1; }
          .use-grid { grid-template-columns: 1fr; }
          .footer-inner { grid-template-columns: 1fr 1fr; gap: 32px; }
          nav { padding: 0 20px; }
          .nav-links { display: none; }
          .section { padding: 72px 24px; }
          .cta-section { padding: 80px 24px; }
          footer { padding: 48px 24px 32px; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <a href="/" className="nav-logo">
          <div className="nav-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2"/>
              <path d="M8 11V7a4 4 0 018 0v4"/>
            </svg>
          </div>
          PILB
        </a>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#uses">Use cases</a>
          <a href="/send" className="nav-cta">Send money</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "var(--bg)" }}>
        <div className="hero">
          <div>
            <div className="hero-chip u1">
              <span className="hero-chip-dot"></span>
              Now live in Kenya
            </div>
            <h1 className="u2">
              Private money<br />
              transfers.<br />
              <span className="accent">Instant.</span>
            </h1>
            <p className="hero-sub u3">
              Send from Stellar to any M-Pesa number — anonymously. No identity shared. No KYC. Recipients receive cash in seconds.
            </p>
            <div className="hero-actions u4">
              <a href="/send" className="btn-primary">
                Send money
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="#how" className="btn-secondary">How it works</a>
            </div>
            <div className="hero-metrics u5">
              <div className="metric">
                <div className="metric-num">~3s</div>
                <div className="metric-label">Settlement time</div>
              </div>
              <div className="metric">
                <div className="metric-num">0 KYC</div>
                <div className="metric-label">No identity required</div>
              </div>
              <div className="metric">
                <div className="metric-num">256-bit</div>
                <div className="metric-label">Encryption standard</div>
              </div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="phone-scene u3">
            <div className="pill" style={{ top: 8, left: -24 }}>
              <div className="pill-icon" style={{ background: "var(--green-light)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00B85A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <div className="pill-title">Payment sent</div>
                <div className="pill-sub">KES 5,000 · 2s ago</div>
              </div>
            </div>

            <div className="phone-frame">
              <div className="phone-island"></div>
              <div className="phone-body">
                <div className="phone-header-row">
                  <span className="phone-app-title">PILB</span>
                  <div className="phone-live"><span className="phone-live-dot"></span> Live</div>
                </div>
                <div className="balance-card">
                  <div className="balance-tag">Stellar balance</div>
                  <div className="balance-value">KES 45,200</div>
                  <div className="balance-sub"><span className="balance-sub-dot"></span> Ready to send</div>
                </div>
                <div className="phone-section-label">Recent</div>
                {[
                  { av: "JK", name: "J. Kamau", via: "M-Pesa · anonymous", amt: "2,500", time: "2m" },
                  { av: "AW", name: "A. Wanjiku", via: "M-Pesa · anonymous", amt: "10,000", time: "1h" },
                  { av: "MO", name: "M. Odhiambo", via: "M-Pesa · anonymous", amt: "750", time: "3h" },
                ].map((tx, i) => (
                  <div className="tx-row" key={i}>
                    <div className="tx-left">
                      <div className="tx-av">{tx.av}</div>
                      <div>
                        <div className="tx-name">{tx.name}</div>
                        <div className="tx-via">{tx.via}</div>
                      </div>
                    </div>
                    <div>
                      <div className="tx-amount">KES {tx.amt}</div>
                      <div className="tx-done">✓ {tx.time} ago</div>
                    </div>
                  </div>
                ))}
                <button className="send-btn">
                  Send anonymously
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            <div className="pill" style={{ bottom: 24, right: -28 }}>
              <div className="pill-icon" style={{ background: "var(--blue-light)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
              </div>
              <div>
                <div className="pill-title">Anonymous</div>
                <div className="pill-sub">No identity stored</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST TICKER */}
      <div className="trust-bar">
        <div className="trust-ticker">
          {[...Array(2)].map((_, r) =>
            ["Powered by Stellar", "M-Pesa integrated", "Open source · MIT", "AES-256 encrypted", "No KYC required", "Blockchain verified", "Built for Kenya", "Instant settlement", "Zero identity stored", "Privacy by design"].map((t, i) => (
              <div className="trust-item" key={`${r}-${i}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
                {t}
              </div>
            ))
          )}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="how-bg" id="how">
        <div className="section">
          <div className="section-eyebrow u1">The process</div>
          <h2 className="section-heading u2">Four steps.<br />Completely private.</h2>
          <p className="section-sub u3">From Stellar wallet to M-Pesa cash — your identity never enters the equation.</p>
          <div className="steps">
            {[
              { n: "Step 01", title: "Enter details", desc: "Amount and recipient's M-Pesa number. Nothing else needed.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg> },
              { n: "Step 02", title: "Generate code", desc: "A cryptographic hash is created and bound to your transaction.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 17h3v4M17 14h4"/></svg> },
              { n: "Step 03", title: "Broadcast on Stellar", desc: "Payment goes on-chain with the code hash as memo. Immutable.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> },
              { n: "Step 04", title: "M-Pesa delivers", desc: "Funds are automatically sent to the recipient's M-Pesa wallet.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
            ].map(s => (
              <div className="step-cell" key={s.n}>
                <div className="step-n">{s.n}</div>
                <div className="step-icon-wrap">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES BENTO */}
      <div id="features">
        <div className="section">
          <div className="section-eyebrow">Why PILB</div>
          <h2 className="section-heading">Engineered for<br />trust and speed.</h2>
          <div className="bento">
            {/* Wide card */}
            <div className="bento-card bento-wide">
              <div className="bento-chip">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Instant settlement
              </div>
              <h3>Stellar to M-Pesa in ~3 seconds</h3>
              <p>No banks, no intermediaries, no waiting. Stellar settles in under 5 seconds — M-Pesa delivers the cash immediately after.</p>
              <div className="flow-row">
                {[
                  { label: "You", val: "Stellar Wallet" },
                  { label: "Network", val: "Stellar Ledger" },
                  { label: "Bridge", val: "PILB Protocol" },
                  { label: "Recipient", val: "M-Pesa Cash" },
                ].map((node, i, arr) => (
                  <div key={i} style={{ display: "contents" }}>
                    <div className="flow-node">
                      <div className="flow-node-label">{node.label}</div>
                      <div className="flow-node-val">{node.val}</div>
                    </div>
                    {i < arr.length - 1 && <div className="flow-sep">→</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bento-card">
              <div className="bento-chip green">Privacy</div>
              <h3>Zero identity.<br />Zero trace.</h3>
              <p>Your name, phone, and details never touch the transaction. Only a cryptographic hash links sender to payment.</p>
              <div className="bento-visual">🔒</div>
            </div>

            <div className="bento-card">
              <div className="bento-chip">Frictionless</div>
              <h3>No app for<br />recipients.</h3>
              <p>Anyone with M-Pesa can receive funds. They get a standard notification — no wallets, no setup, no learning curve.</p>
              <div className="bento-visual">📲</div>
            </div>

            <div className="bento-card">
              <div className="bento-chip">Blockchain</div>
              <h3>Immutable on-chain<br />proof.</h3>
              <p>Every transaction is permanently recorded on Stellar. Tamper-proof, auditable, and verifiable by anyone.</p>
              <div className="bento-visual">⛓️</div>
            </div>

            <div className="bento-card">
              <div className="bento-chip green">🇰🇪 Kenya</div>
              <h3>Made for Kenya,<br />by Kenyans.</h3>
              <p>Built around M-Pesa — the payment method 97% of Kenyans already trust and use every single day.</p>
              <div className="bento-visual">🌍</div>
            </div>
          </div>
        </div>
      </div>

      {/* USE CASES */}
      <div className="use-bg" id="uses">
        <div className="section">
          <div className="section-eyebrow">Use cases</div>
          <h2 className="section-heading">Built for<br />real life.</h2>
          <div className="use-grid">
            {[
              { 
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00B85A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
                title: "Remittances", 
                desc: "Send money home without exposing your financial details to family or third parties. Private, but instant." 
              },
              { 
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
                title: "Anonymous donations", 
                desc: "Support causes you believe in with no permanent trail connecting you to your giving." 
              },
              { 
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00B85A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
                title: "Business payments", 
                desc: "Pay freelancers and contractors without revealing company bank details or creating paper trails." 
              },
              { 
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>,
                title: "Emergency aid", 
                desc: "Get money to someone in crisis immediately. No delays, no questions, no bureaucracy." 
              },
            ].map(u => (
              <div className="use-card" key={u.title}>
                <span className="use-emoji">{u.icon}</span>
                <h3>{u.title}</h3>
                <p>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-chip">
          <span style={{ width: 6, height: 6, background: "var(--green)", borderRadius: "50%", animation: "pulseGreen 2s ease-in-out infinite", display: "inline-block" }}></span>
          Ready when you are
        </div>
        <h2>Your money.<br /><span>Your privacy.</span></h2>
        <p className="cta-sub">No credit card. No KYC. No identity stored. Just Stellar, M-Pesa, and your phone.</p>
        <div className="cta-actions">
          <a href="/send" className="btn-white">Launch app →</a>
          <a href="/verify" className="btn-ghost-dark">Read the docs</a>
        </div>
      </section>



    </div>
  );
}
