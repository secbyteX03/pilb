import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import {
  paymentApi,
  invoiceApi,
  escrowApi,
  verificationApi,
  stellarApi,
  PaymentMethod,
  Invoice,
  Escrow,
  PaymentVerification,
} from '../api/paymentApi';

// Types
interface Analytics {
  totalPayments: number;
  totalVolume: number;
  successRate: number;
  pendingPayments: number;
  totalInvoices: number;
  paidInvoices: number;
  totalEscrows: number;
  activeEscrows: 0;
}

type ChartMetric = 'volume' | 'transactions' | 'escrows';
type ChartPeriod = '7d' | '30d' | '90d';

interface ChartDataset {
  labels: string[];
  values: number[];
  total: string;
  avg: string;
  peak: string;
  trend: string;
}

// SVG Icons
const Icon = {
  Send: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  CreditCard: () => (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Dollar: () => (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Wallet: () => (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Box: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
};

export default function Dashboard() {
  const { user } = useAuthStore();
  
  // State
  const [loading, setLoading] = useState(true);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [accountBalance, setAccountBalance] = useState<string>('0');
  const [paymentHistory, setPaymentHistory] = useState<Array<{hash: string; from: string; to: string; amount: string; asset: string; timestamp: string}>>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalPayments: 0,
    totalVolume: 0,
    successRate: 0,
    pendingPayments: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    totalEscrows: 0,
    activeEscrows: 0,
  });
  
  // UI State
  const [showValues, setShowValues] = useState<boolean>(true);
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'KES'>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('7d');
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('volume');

  // Currency formatting helper
  const formatCurrency = (amount: number, currency: 'USD' | 'KES'): string => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }
    return `KSh ${(amount * exchangeRate).toFixed(0)}`;
  };

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user?.publicKey) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch payment methods - wrap in try-catch to allow other data to load
      try {
        const methods = await paymentApi.getAvailableMethods('USD');
        setAvailableMethods(methods);
      } catch (e) {
        console.log('Could not fetch payment methods', e);
        setAvailableMethods([]);
      }

      // Fetch exchange rate
      try {
        const rate = await paymentApi.getExchangeRate('USD', 'KES');
        setExchangeRate(rate);
      } catch (e) {
        console.log('Using default exchange rate');
        setExchangeRate(150); // Default fallback
      }

      // Fetch Stellar account data
      try {
        // Try using direct fetch to debug
        const response = await fetch(`http://localhost:3001/api/stellar/account/${user.publicKey}/balance?asset=XLM`);
        const data = await response.json();
        console.log('Direct API response:', data);
        const balance = data.data?.balance || data.balance;
        setAccountBalance(balance || '0');
      } catch (e) {
        console.log('Could not fetch balance', e);
      }

      try {
        const history = await stellarApi.getPaymentHistory(user.publicKey, 20);
        setPaymentHistory(history);
      } catch (e) {
        console.log('Could not fetch payment history');
      }

      // Fetch invoices
      try {
        const userInvoices = await invoiceApi.getUserInvoices(10, 0);
        setInvoices(userInvoices);
      } catch (e) {
        console.log('Could not fetch invoices');
      }

      // Fetch escrows
      try {
        const userEscrows = await escrowApi.getUserEscrows(10, 0);
        setEscrows(userEscrows);
      } catch (e) {
        console.log('Could not fetch escrows');
      }

      // Fetch verifications
      try {
        const merchantVerifications = await verificationApi.getMerchantVerifications();
        setVerifications(merchantVerifications);
      } catch (e) {
        console.log('Could not fetch verifications');
      }

      // Calculate analytics from fetched data
      const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
      const activeEscrows = escrows.filter(
        (esc) => esc.status === 'funded' || esc.status === 'created'
      );

      setAnalytics({
        totalPayments:
          paidInvoices.length +
          escrows.filter((e) => e.status === 'released').length,
        totalVolume:
          paidInvoices.reduce((s, inv) => s + inv.total, 0) +
          escrows
            .filter((e) => e.status === 'released')
            .reduce((s, e) => s + e.amount, 0),
        successRate:
          invoices.length > 0
            ? (paidInvoices.length / invoices.length) * 100
            : 0,
        pendingPayments:
          invoices.filter((inv) => inv.status === 'sent').length +
          activeEscrows.length,
        totalInvoices: invoices.length,
        paidInvoices: paidInvoices.length,
        totalEscrows: escrows.length,
        activeEscrows: activeEscrows.length,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  // Shared style tokens
  const GOLD = '#C9A84C';
  const INK = '#0E0E0E';

  // Chart data
  const chartData: Record<ChartMetric, Record<ChartPeriod, ChartDataset>> = {
    volume: {
      '7d': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: paymentHistory.length > 0 
          ? paymentHistory.slice(0, 7).map(p => parseFloat(p.amount))
          : [980, 1450, 1120, 2300, 3120, 1800, 1710],
        total: showValues ? formatCurrency(analytics.totalVolume || 12480, displayCurrency) : '••••',
        avg: showValues ? formatCurrency(1783, displayCurrency) : '••••',
        peak: showValues ? formatCurrency(3120, displayCurrency) : '••••',
        trend: '+8.4% vs last period',
      },
      '30d': {
        labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
        values: [11200, 14800, 9900, 16300],
        total: showValues ? formatCurrency(52200, displayCurrency) : '••••',
        avg: showValues ? formatCurrency(13050, displayCurrency) : '••••',
        peak: showValues ? formatCurrency(16300, displayCurrency) : '••••',
        trend: '+12.1% vs last period',
      },
      '90d': {
        labels: ['Jan', 'Feb', 'Mar'],
        values: [26000, 31000, 28000],
        total: showValues ? formatCurrency(85000, displayCurrency) : '••••',
        avg: showValues ? formatCurrency(28333, displayCurrency) : '••••',
        peak: showValues ? formatCurrency(31000, displayCurrency) : '••••',
        trend: '+5.3% vs last period',
      },
    },
    transactions: {
      '7d': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: paymentHistory.length > 0 
          ? paymentHistory.slice(0, 7).map(() => Math.floor(Math.random() * 50) + 20)
          : [24, 38, 29, 55, 72, 43, 41],
        total: String(paymentHistory.length || 302),
        avg: String(Math.floor((paymentHistory.length || 302) / 7)),
        peak: '72',
        trend: '+11.2% vs last period',
      },
      '30d': {
        labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
        values: [280, 340, 210, 370],
        total: '1,200',
        avg: '300',
        peak: '370',
        trend: '+9.7% vs last period',
      },
      '90d': {
        labels: ['Jan', 'Feb', 'Mar'],
        values: [820, 1010, 940],
        total: '2,770',
        avg: '923',
        peak: '1,010',
        trend: '+3.8% vs last period',
      },
    },
    escrows: {
      '7d': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [2, 5, 3, 8, 11, 6, 7],
        total: '42',
        avg: '6',
        peak: '11',
        trend: '+15.3% vs last period',
      },
      '30d': {
        labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
        values: [28, 42, 35, 51],
        total: '156',
        avg: '39',
        peak: '51',
        trend: '+22.1% vs last period',
      },
      '90d': {
        labels: ['Jan', 'Feb', 'Mar'],
        values: [85, 112, 98],
        total: '295',
        avg: '98',
        peak: '112',
        trend: '+8.7% vs last period',
      },
    },
  };

  const currentChart = chartData[selectedMetric][selectedPeriod];

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F3', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Heading */}
        <div className="mb-7">
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 600, color: INK }}>
                Dashboard
              </h1>
              <p className="mt-1 font-light" style={{ fontSize: 13, color: '#8A8780' }}>
                Manage your payments, invoices, and escrows
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Currency Toggle */}
              <button
                onClick={() => setDisplayCurrency(displayCurrency === 'USD' ? 'KES' : 'USD')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: '#F7F6F3', border: '1px solid #D8D5CE' }}
                title={`Switch to ${displayCurrency === 'USD' ? 'KES' : 'USD'}`}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>{displayCurrency}</span>
              </button>
              {/* Visibility Toggle */}
              <button
                onClick={() => setShowValues(!showValues)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: '#F7F6F3', border: '1px solid #D8D5CE' }}
                title={showValues ? 'Hide values' : 'Show values'}
              >
                {showValues ? <Icon.Eye /> : <Icon.EyeOff />}
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
          {[
            { 
              label: 'Wallet Balance', 
              value: showValues ? `${accountBalance || 0} XLM` : '••••', 
              sub: 'Stellar XLM Balance', 
              icon: <Icon.Wallet /> 
            },
            { 
              label: 'Total Volume', 
              value: showValues ? formatCurrency(analytics.totalVolume, displayCurrency) : '••••', 
              sub: 'All-time processed', 
              icon: <Icon.Dollar /> 
            },
            { 
              label: 'Success Rate', 
              value: showValues ? `${analytics.successRate.toFixed(1)}%` : '••••', 
              sub: 'Completed payments', 
              icon: <Icon.CheckCircle /> 
            },
            { 
              label: 'Pending', 
              value: showValues ? String(analytics.pendingPayments) : '••', 
              sub: 'Awaiting settlement', 
              icon: <Icon.Clock /> 
            },
            { 
              label: 'Total Payments', 
              value: showValues ? String(analytics.totalPayments) : '••', 
              sub: 'Lifetime transactions', 
              icon: <Icon.CreditCard /> 
            },
          ].map(({ label, value, sub, icon }) => (
            <div
              key={label}
              className="relative rounded-xl overflow-hidden"
              style={{ background: '#fff', border: '1px solid #D8D5CE' }}
            >
              {/* Gold left accent */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: GOLD }} />
              <div className="px-5 py-5">
                <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: '#8A8780' }}>
                  {label}
                </p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: INK, lineHeight: 1 }}>
                  {value}
                </p>
                <p className="mt-1 font-light" style={{ fontSize: 11, color: '#8A8780' }}>{sub}</p>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#D8D5CE' }}>
                {icon}
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { to: '/links', label: 'Payment Links', desc: 'Create & manage payment links', icon: <Icon.Link /> },
            { to: '/scheduled', label: 'Scheduled', desc: 'View scheduled payments', icon: <Icon.Calendar /> },
            { to: '/verify', label: 'Verify', desc: 'Verify transactions', icon: <Icon.Check /> },
            { to: '/send', label: 'Send', desc: 'Send money to anyone', icon: <Icon.Send /> },
          ].map(({ to, label, desc, icon }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-md"
              style={{ background: '#fff', border: '1px solid #D8D5CE' }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#F7F6F3', color: GOLD }}>
                {icon}
              </div>
              <div>
                <p className="font-medium" style={{ color: INK, fontSize: 14 }}>{label}</p>
                <p className="font-light" style={{ fontSize: 12, color: '#8A8780' }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Chart Section */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ background: '#fff', border: '1px solid #D8D5CE' }}>
          {/* Chart Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #EEECE8' }}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedMetric('volume')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedMetric === 'volume' ? 'shadow-sm' : ''}`}
                style={{ 
                  background: selectedMetric === 'volume' ? GOLD : 'transparent',
                  color: selectedMetric === 'volume' ? '#0a0a0a' : '#8A8780',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span className="text-sm font-medium">Volume</span>
              </button>
              <button
                onClick={() => setSelectedMetric('transactions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedMetric === 'transactions' ? 'shadow-sm' : ''}`}
                style={{ 
                  background: selectedMetric === 'transactions' ? GOLD : 'transparent',
                  color: selectedMetric === 'transactions' ? '#0a0a0a' : '#8A8780',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                <span className="text-sm font-medium">Transactions</span>
              </button>
              <button
                onClick={() => setSelectedMetric('escrows')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedMetric === 'escrows' ? 'shadow-sm' : ''}`}
                style={{ 
                  background: selectedMetric === 'escrows' ? GOLD : 'transparent',
                  color: selectedMetric === 'escrows' ? '#0a0a0a' : '#8A8780',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <span className="text-sm font-medium">Escrows</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              {(['7d', '30d', '90d'] as ChartPeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                  style={{ 
                    background: selectedPeriod === period ? GOLD : '#F7F6F3',
                    color: selectedPeriod === period ? '#0a0a0a' : '#8A8780',
                  }}
                >
                  {period === '7d' ? '7D' : period === '30d' ? '30D' : '90D'}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Bars */}
          <div className="px-5 py-5">
            <div className="flex items-end justify-between gap-2 h-40">
              {currentChart.values.map((value, index) => {
                const maxValue = Math.max(...currentChart.values);
                const height = (value / maxValue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full rounded-t-md transition-all"
                      style={{ 
                        height: `${height}%`, 
                        background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD}CC 100%)`,
                        minHeight: 4,
                      }}
                    />
                    <span className="text-xs" style={{ color: '#8A8780' }}>{currentChart.labels[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Stats */}
          <div className="flex gap-8 px-5 pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: '#8A8780' }}>This Period</p>
              <p className="font-semibold" style={{ color: INK, fontSize: 18 }}>{currentChart.total}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: '#8A8780' }}>Daily Avg</p>
              <p className="font-semibold" style={{ color: INK, fontSize: 18 }}>{currentChart.avg}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: '#8A8780' }}>Peak Day</p>
              <p className="font-semibold" style={{ color: INK, fontSize: 18 }}>{currentChart.peak}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: '#8A8780' }}>Trend</p>
              <p className="font-semibold" style={{ color: '#22c55e', fontSize: 18 }}>{currentChart.trend}</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ background: '#fff', border: '1px solid #D8D5CE' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #EEECE8' }}>
            <h3 className="font-semibold" style={{ color: INK, fontSize: 16 }}>Payment Methods</h3>
          </div>
          <div className="px-5 py-4">
            {availableMethods.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableMethods.map((method) => (
                  <span
                    key={method.id}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: '#F7F6F3', color: INK }}
                  >
                    {method.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#8A8780' }}>
                {showValues ? 'No payment methods available for USD' : '••••'}
              </p>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ background: '#fff', border: '1px solid #D8D5CE' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #EEECE8' }}>
            <h3 className="font-semibold" style={{ color: INK, fontSize: 16 }}>Recent Invoices</h3>
            <Link to="/invoices" className="text-sm" style={{ color: GOLD }}>View all</Link>
          </div>
          <div className="px-5 py-4">
            {invoices.length > 0 ? (
              <div className="space-y-3">
                {invoices.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: INK, fontSize: 14 }}>{inv.reference}</p>
                      <p className="text-xs" style={{ color: '#8A8780' }}>{new Date(inv.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium" style={{ color: INK }}>{showValues ? formatCurrency(inv.total, displayCurrency) : '••••'}</p>
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          background: inv.status === 'paid' ? '#dcfce7' : inv.status === 'sent' ? '#fef3c7' : '#f3f4f6',
                          color: inv.status === 'paid' ? '#166534' : inv.status === 'sent' ? '#92400e' : '#6b7280',
                        }}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#8A8780' }}>No invoices yet</p>
            )}
          </div>
        </div>

        {/* Recent Escrows */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ background: '#fff', border: '1px solid #D8D5CE' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #EEECE8' }}>
            <h3 className="font-semibold" style={{ color: INK, fontSize: 16 }}>Recent Escrows</h3>
            <Link to="/escrows" className="text-sm" style={{ color: GOLD }}>View all</Link>
          </div>
          <div className="px-5 py-4">
            {escrows.length > 0 ? (
              <div className="space-y-3">
                {escrows.slice(0, 5).map((esc) => (
                  <div key={esc.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: INK, fontSize: 14 }}>Escrow #{esc.id.slice(0, 8)}</p>
                      <p className="text-xs" style={{ color: '#8A8780' }}>{new Date(esc.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium" style={{ color: INK }}>{showValues ? formatCurrency(esc.amount, displayCurrency) : '••••'}</p>
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          background: esc.status === 'released' ? '#dcfce7' : esc.status === 'funded' ? '#fef3c7' : '#f3f4f6',
                          color: esc.status === 'released' ? '#166534' : esc.status === 'funded' ? '#92400e' : '#6b7280',
                        }}
                      >
                        {esc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#8A8780' }}>No escrows yet</p>
            )}
          </div>
        </div>

        {/* Recent Verifications */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ background: '#fff', border: '1px solid #D8D5CE' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #EEECE8' }}>
            <h3 className="font-semibold" style={{ color: INK, fontSize: 16 }}>Recent Verifications</h3>
            <Link to="/verify" className="text-sm" style={{ color: GOLD }}>View all</Link>
          </div>
          <div className="px-5 py-4">
            {verifications.length > 0 ? (
              <div className="space-y-3">
                {verifications.slice(0, 5).map((ver) => (
                  <div key={ver.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: INK, fontSize: 14 }}>{ver.reference}</p>
                      <p className="text-xs" style={{ color: '#8A8780' }}>{new Date(ver.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        background: ver.status === 'verified' ? '#dcfce7' : '#fef3c7',
                        color: ver.status === 'verified' ? '#166534' : '#92400e',
                      }}
                    >
                      {ver.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#8A8780' }}>No verifications yet</p>
            )}
          </div>
        </div>

        {/* All Transactions - Sent & Received */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ background: '#fff', border: '1px solid #D8D5CE' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #EEECE8' }}>
            <h3 className="font-semibold" style={{ color: INK, fontSize: 16 }}>All Transactions</h3>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#F7F6F3', color: '#8A8780' }}>
              {paymentHistory.length} total
            </span>
          </div>
          <div className="px-5 py-2">
            {paymentHistory.length > 0 ? (
              <div className="divide-y" style={{ borderColor: '#EEECE8' }}>
                {paymentHistory.map((tx, idx) => (
                  <div key={tx.hash || idx} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ 
                          background: tx.to === user?.publicKey ? '#dcfce7' : '#fef3c7',
                          color: tx.to === user?.publicKey ? '#166534' : '#92400e'
                        }}
                      >
                        {tx.to === user?.publicKey ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: INK, fontSize: 14 }}>
                          {tx.to === user?.publicKey ? 'Received' : 'Sent'}
                        </p>
                        <p className="text-xs" style={{ color: '#8A8780' }}>
                          {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: tx.to === user?.publicKey ? '#166534' : INK, fontSize: 15 }}>
                        {tx.to === user?.publicKey ? '+' : '-'}{tx.amount} {tx.asset || 'XLM'}
                      </p>
                      {tx.hash && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs font-mono" style={{ color: '#8A8780' }}>
                            {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                          </span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(tx.hash)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Copy hash"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: '#8A8780' }}>No transactions yet</p>
                <Link to="/send" className="text-sm mt-2 inline-block" style={{ color: GOLD }}>Send your first payment</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}