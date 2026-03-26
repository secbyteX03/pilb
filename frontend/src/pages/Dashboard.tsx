import { useAuthStore } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuthStore();

  // Mock data for demo
  const payments = [
    { id: '1', amount: 500, recipient: '07XXX XXXX', status: 'completed', date: '2024-01-15' },
    { id: '2', amount: 1000, recipient: '07XXX XXXX', status: 'completed', date: '2024-01-14' },
    { id: '3', amount: 250, recipient: '07XXX XXXX', status: 'pending', date: '2024-01-13' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Manage your anonymous payments</p>
      </div>

      {/* Wallet Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">Connected Wallet</p>
            <p className="font-mono text-slate-700">{user?.publicKey?.slice(0, 10)}...</p>
          </div>
          <button className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            Disconnect
          </button>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Payments</h2>
        
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
            >
              <div>
                <p className="font-semibold text-slate-900">{payment.amount} KES</p>
                <p className="text-sm text-slate-500">{payment.recipient}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    payment.status === 'completed'
                      ? 'bg-accent-100 text-accent-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {payment.status}
                </span>
                <p className="text-sm text-slate-500 mt-1">{payment.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}