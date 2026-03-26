import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './hooks/useAuth';
import Home from './pages/Home';
import Send from './pages/Send';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        {isAuthenticated && (
          <>
            <Route path="/send" element={<Send />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </>
        )}
      </Routes>
    </Layout>
  );
}

export default App;