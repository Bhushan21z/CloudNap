import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SetupAWS from './components/SetupAWS';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import api from './lib/api';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [role, setRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(false);

  const fetchRole = async () => {
    if (!user) return;
    setCheckingRole(true);
    try {
      const { data } = await api.get('/role');
      setRole(data);
    } catch (err) {
      console.error('Failed to fetch role');
    } finally {
      setCheckingRole(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#030712] text-white selection:bg-primary-500/30">
        <Header user={user} onLogout={handleLogout} />

        <main className="pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/signup"
              element={!user ? <Signup /> : <Navigate to="/dashboard" />}
            />

            <Route
              path="/setup"
              element={
                user ? (
                  <SetupAWS onComplete={() => { fetchRole(); }} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/dashboard"
              element={
                user ? (
                  checkingRole ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                      <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                    </div>
                  ) : !role ? (
                    <Navigate to="/setup" />
                  ) : (
                    <Dashboard onResetConfig={() => setRole(null)} />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </main>

        {/* Decorative background elements */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full" />
        </div>
      </div>
    </Router>
  );
}

export default App;
