import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const { login, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated - based on role
  useEffect(() => {
    if (isAuthenticated && user) {
      // Admin goes to /admin, client goes to /profile
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Check for expired token alerts
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      toast.error('Session expired. Please log in again.', { id: 'expired' });
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      toast.success('Successfully logged in!');

      // Redirect based on role after successful login
      if (res.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    } else {
      setFormError(res.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgLight p-md">
      <Toaster position="top-right" />
      <div className="w-full max-w-[420px]">
        {/* Core Logo Panel */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primaryDark text-white font-black text-xl rounded-card shadow-card mb-md">
            A
          </div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Aeroview 360</h1>
          <p className="text-sm text-textSecondary mt-xs font-medium">Construction Management Portal</p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-card shadow-card border border-borderLight p-lg">
          <h2 className="text-lg font-bold text-textPrimary mb-lg">Sign In</h2>

          {formError && (
            <div className="mb-lg p-sm bg-red-50 border border-red-200 text-errorRed rounded-button flex items-center gap-xs text-xs font-semibold">
              <FiAlertCircle className="flex-shrink-0" size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-md flex items-center text-textLight">
                  <FiMail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="form-input pl-[44px]"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-md flex items-center text-textLight">
                  <FiLock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input pl-[44px]"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-[12px] mt-md"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Help / Mock Credentials Panel */}
        <div className="mt-lg bg-zinc-200/50 border border-borderLight rounded-card p-md text-xs text-textSecondary">
          <p className="font-bold text-textPrimary mb-sm uppercase tracking-wider">Demo Access Accounts</p>
          <div className="space-y-sm">
            <div>
              <p className="font-semibold text-textSecondary">Client Viewer:</p>
              <p className="font-mono text-textMuted">Email: <span className="text-textPrimary">client@aeroview.com</span> / Pass: <span className="text-textPrimary">client123</span></p>
            </div>
            <div>
              <p className="font-semibold text-textSecondary">Admin Upload Manager:</p>
              <p className="font-mono text-textMuted">Email: <span className="text-textPrimary">admin@aeroview.com</span> / Pass: <span className="text-textPrimary">admin123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;