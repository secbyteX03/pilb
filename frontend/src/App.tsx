import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './hooks/useAuth';
import { authApi } from './api/paymentApi';
import Home from './pages/Home';
import Login from './pages/Login';
import Send from './pages/Send';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import PaymentLinks from './pages/PaymentLinks';
import ScheduledPayments from './pages/ScheduledPayments';
import Pay from './pages/Pay';
import Docs from './pages/Docs';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated, setUser, logout } = useAuthStore();

  // Check for existing auth token on app initialization
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const result = await authApi.verifyToken(token);
          setUser({
            publicKey: result.publicKey,
            address: result.publicKey,
          });
        } catch (error) {
          // Token is invalid or expired - don't redirect, just clear token
          // The user will be logged out but stay on current page
          localStorage.removeItem('auth_token');
        }
      }
    };
    checkAuth();
  }, [setUser, logout]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/verify" element={<Layout><Verify /></Layout>} />
      <Route path="/docs" element={<Layout><Docs /></Layout>} />
      <Route path="/send" element={<Layout><Send /></Layout>} />
      <Route path="/links" element={<Layout><PaymentLinks /></Layout>} />
      <Route path="/scheduled" element={<Layout><ScheduledPayments /></Layout>} />
      <Route path="/pay" element={<Layout><Pay /></Layout>} />
      <Route path="/pay/:linkId" element={<Layout><Pay /></Layout>} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
    </Routes>
  );
}

export default App;
