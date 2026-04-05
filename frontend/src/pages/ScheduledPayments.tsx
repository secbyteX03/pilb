import { useState, useEffect } from 'react';
import { useAuthStore } from '../hooks/useAuth';
import { paymentApi } from '../api/paymentApi';

interface ScheduledPayment {
  scheduledId: string;
  verificationCode?: string;
  amount: number;
  amountXLM?: string;
  recipientPhone: string;
  currency: string;
  scheduleDate: string;
  recurring: boolean;
  interval?: string;
  status: string;
}

export default function ScheduledPayments() {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [interval, setInterval] = useState('daily');
  const [supportedCurrencies, setSupportedCurrencies] = useState<Array<{ code: string; name: string; symbol: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);
  const [success, setSuccess] = useState(false);
  const [createdPayment, setCreatedPayment] = useState<ScheduledPayment | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currencies = await paymentApi.getSupportedCurrencies();
        setSupportedCurrencies(currencies);

        if (user) {
          const payments = await paymentApi.getScheduledPayments(user.publicKey);
          setScheduledPayments(payments.scheduledPayments);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Combine date and time
      const fullScheduleDate = new Date(`${scheduleDate}T${scheduleTime || '00:00'}`).toISOString();

      // If editing existing scheduled payment, update it
      if (editingId) {
        const payment = await paymentApi.updateScheduledPayment(editingId, {
          amount: Number(amount),
          recipientPhone,
          scheduleDate: fullScheduleDate,
          currency,
          recurring,
          interval: recurring ? interval : undefined,
        });
        setEditingId(null);
        // Refresh list
        const payments = await paymentApi.getScheduledPayments(user.publicKey);
        setScheduledPayments(payments.scheduledPayments);
        // Reset form after success
        setAmount('');
        setRecipientPhone('');
        setScheduleDate('');
        setScheduleTime('');
        setCurrency('KES');
        setRecurring(false);
        setSuccess(true);
        setCreatedPayment(payment as any);
        return;
      }

      const payment = await paymentApi.createScheduledPayment({
        amount: Number(amount),
        recipientPhone,
        senderPublicKey: user.publicKey,
        currency,
        scheduleDate: fullScheduleDate,
        recurring,
        interval: recurring ? interval : undefined,
      });

      setCreatedPayment(payment);
      setSuccess(true);

      // Refresh list
      const payments = await paymentApi.getScheduledPayments(user.publicKey);
      setScheduledPayments(payments.scheduledPayments);
    } catch (err: any) {
      setError(err.response?.data?.error || (editingId ? 'Failed to update scheduled payment' : 'Failed to create scheduled payment'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (scheduledId: string) => {
    try {
      await paymentApi.cancelScheduledPayment(scheduledId);
      // Refresh list
      if (user) {
        const payments = await paymentApi.getScheduledPayments(user.publicKey);
        setScheduledPayments(payments.scheduledPayments);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel scheduled payment');
    }
  };

  const handleDelete = async (scheduledId: string) => {
    if (!window.confirm('Are you sure you want to delete this scheduled payment?')) return;
    try {
      setDeletingId(scheduledId);
      await paymentApi.deleteScheduledPayment(scheduledId);
      // Refresh list
      if (user) {
        const payments = await paymentApi.getScheduledPayments(user.publicKey);
        setScheduledPayments(payments.scheduledPayments);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete scheduled payment');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (payment: ScheduledPayment) => {
    // Set form fields to payment values
    setEditingId(payment.scheduledId);
    setAmount(payment.amount.toString());
    setRecipientPhone(payment.recipientPhone);
    setCurrency(payment.currency);
    // Parse date and time
    const date = new Date(payment.scheduleDate);
    setScheduleDate(date.toISOString().split('T')[0]);
    setScheduleTime(date.toTimeString().slice(0, 5));
    setRecurring(payment.recurring);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Scheduled</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  if (!user) {
    return (
      <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
        <div className="max-w-xl mx-auto text-center py-16 px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Connect Your Wallet</h2>
          <p className="text-slate-600 mb-8">Please connect your Stellar wallet to schedule payments.</p>
        </div>
      </div>
    );
  }

  if (success && createdPayment) {
    return (
      <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
        <div className="max-w-xl mx-auto py-16 px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a8 8 0 11-16 0 8 8 0 0116 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Payment Scheduled!</h2>
              <p className="text-slate-600 mt-2">Your payment will be sent automatically</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <label className="text-sm text-slate-500 block mb-1">Verification Code</label>
                <p className="text-2xl font-mono font-bold text-primary-600">{createdPayment.verificationCode}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <label className="text-sm text-slate-500 block mb-1">Amount</label>
                  <p className="text-lg font-semibold text-slate-900">
                    {createdPayment.amount} {createdPayment.currency}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <label className="text-sm text-slate-500 block mb-1">In XLM</label>
                  <p className="text-lg font-semibold text-slate-900">{createdPayment.amountXLM} XLM</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <label className="text-sm text-slate-500 block mb-1">Recipient</label>
                <p className="text-lg font-semibold text-slate-900">{createdPayment.recipientPhone}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <label className="text-sm text-slate-500 block mb-1">Scheduled For</label>
                <p className="text-lg font-semibold text-slate-900">
                  {new Date(createdPayment.scheduleDate).toLocaleString()}
                </p>
              </div>

              {createdPayment.recurring && (
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                  <p className="text-sm text-primary-700">
                    <strong>Recurring:</strong> This payment will repeat {createdPayment.interval}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSuccess(false);
                setCreatedPayment(null);
                setAmount('');
                setRecipientPhone('');
                setScheduleDate('');
                setScheduleTime('');
              }}
              className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
            >
              Schedule Another Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#111", minHeight: "100vh" }}>
      <div className="max-w-4xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold font-display text-slate-900 mb-2">Scheduled Payments</h1>
        <p className="text-slate-600 mb-8">Set up payments to be sent automatically at a specific time</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Scheduled Payment Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Schedule New Payment</h2>
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Enter amount"
                    required
                    min="10"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Recipient Phone Number
                </label>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="07XXXXXXXX"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="w-4 h-4 text-primary-500 border-slate-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="recurring" className="text-sm text-slate-700">
                  Make this a recurring payment
                </label>
              </div>

              {recurring && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Repeat
                  </label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scheduling...' : 'Schedule Payment'}
              </button>
            </div>
          </form>

          {/* Scheduled Payments List */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Your Scheduled Payments</h2>
            {scheduledPayments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a8 8 0 11-16 0 8 8 0 0116 0z" />
                </svg>
                <p>No scheduled payments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledPayments.map((payment) => (
                  <div key={payment.scheduledId} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {payment.amount} {payment.currency}
                        </p>
                        <p className="text-sm text-slate-500">{payment.recipientPhone}</p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">
                        {new Date(payment.scheduleDate).toLocaleString()}
                      </span>
                      {payment.status === 'scheduled' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(payment)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCancel(payment.scheduledId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(payment.scheduledId)}
                            className="text-slate-500 hover:text-slate-700"
                            disabled={deletingId === payment.scheduledId}
                          >
                            {deletingId === payment.scheduledId ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}