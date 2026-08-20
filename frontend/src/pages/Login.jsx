import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiShield, FiUser } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import BrandMark from '../components/common/BrandMark';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [rememberMe, setRememberMe] = useState(false); const [formError, setFormError] = useState('');
  const { login, isAuthenticated, loading, user } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  useEffect(() => { if (isAuthenticated && user) navigate(user.role === 'admin' ? '/admin' : '/profile', { replace: true }); }, [isAuthenticated, user, navigate]);
  useEffect(() => { if (new URLSearchParams(location.search).get('expired') === 'true') toast.error('Your session expired. Please sign in again.'); }, [location]);
  const submit = async (event) => { event.preventDefault(); setFormError(''); if (!email || !password) return setFormError('Enter your email and password to continue.'); const result = await login(email, password, rememberMe); if (!result.success) return setFormError(result.error); navigate(result.user?.role === 'admin' ? '/admin' : '/profile', { replace: true }); };
  return <div className="portal-page"><Toaster position="top-right" /><div className="portal-shell auth-shell">
    <aside className="portal-sidebar auth-brand"><BrandMark /><div className="portal-rule" /><div className="auth-founder"><strong>AEROVIEW<br /><span>360</span></strong><p>Construction intelligence, presented clearly.</p></div><div className="auth-features"><p><FiShield /> Secure project access</p><p><FiUser /> Client-specific dashboards</p><p><FiLock /> Protected media & deliverables</p></div><div className="portal-client"><span>Precision in Data.</span><strong>Perfection in Visualization.</strong><small>© {new Date().getFullYear()} Aeroview 360</small></div></aside>
    <main className="portal-main auth-main"><form onSubmit={submit} className="auth-form"><div className="portal-heading__avatar mx-auto"><FiUser /></div><h1>Welcome Back!</h1><p>Sign in to access your project dashboard</p><div className="portal-rule" />{formError && <div className="auth-error">{formError}</div>}<label>Login ID / Email<div className="auth-input"><FiUser /><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your login ID or email" disabled={loading} /></div></label><label>Password<div className="auth-input"><FiLock /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" disabled={loading} /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FiEyeOff /> : <FiEye />}</button></div></label><div className="auth-options"><label><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember me</label><button type="button" onClick={() => navigate('/forgot-password')}>Forgot password?</button></div><button className="auth-submit" disabled={loading}>{loading ? 'SIGNING IN…' : 'LOGIN'}</button><div className="auth-or"><span /> OR <span /></div><button type="button" className="auth-otp-button" onClick={() => navigate('/login-otp')}>Login with OTP</button><p className="auth-help">Your account is created by an Aeroview administrator.</p></form></main>
  </div></div>;
};
export default Login;
