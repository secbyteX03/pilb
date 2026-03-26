export default function Home() {
  return (
    <div className="space-y-16 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
          <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
          Send Money, Keep Your Identity
        </div>
        <h1 className="text-5xl md:text-6xl font-bold font-display text-slate-900 mb-6">
          Anonymous M-Pesa
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
            Payments via Stellar
          </span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Send money to anyone in Kenya without exposing your identity. 
          Your details stay private, only the amount and a verification code are shared.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/send"
            className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
          >
            Start Sending
          </a>
          <a
            href="/verify"
            className="px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-primary-500 hover:text-primary-600 transition-all"
          >
            Verify Payment
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Complete Privacy</h3>
          <p className="text-slate-600">
            Your name, phone number, and Stellar address never reach the recipient. 
            Only the amount and a shared verification code are visible.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Instant Delivery</h3>
          <p className="text-slate-600">
            Payments are processed within seconds on Stellar blockchain, 
            then immediately disbursed to the recipient's M-Pesa account.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Blockchain Verified</h3>
          <p className="text-slate-600">
            Every transaction is recorded on the immutable Stellar blockchain. 
            Recipients can independently verify payments.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold font-display text-slate-900 text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Enter Details', desc: 'Enter amount and recipient phone number' },
            { step: '02', title: 'Generate Code', desc: 'App creates a unique verification code' },
            { step: '03', title: 'Send to Stellar', desc: 'Payment sent with code hash as memo' },
            { step: '04', title: 'Auto Disbursement', desc: 'M-Pesa delivers money to recipient' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">{item.step}</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}