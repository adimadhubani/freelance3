import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiClock, FiGrid, FiLogOut, FiUser } from 'react-icons/fi';
import BrandMark from '../components/common/BrandMark';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { getClientProfile } from '../services/siteService';

const ClientProfile = () => {
  const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const { user, logout } = useAuth(); const navigate = useNavigate();
  const load = async () => { setLoading(true); try { const data = await getClientProfile(); setProfile(data.client); setError(''); } catch (err) { setError(err.response?.data?.error || 'Unable to load your client workspace.'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  if (loading) return <div className="portal-page grid place-items-center"><LoadingSpinner message="Preparing your workspace…" /></div>;
  if (error) return <div className="portal-page grid place-items-center"><ErrorMessage message={error} onRetry={load} /></div>;
  const stats = [{ label: 'Active sites', value: profile.stats.active_sites, icon: FiGrid }, { label: 'Completed sites', value: profile.stats.completed_sites, icon: FiCheckCircle }, { label: 'Latest update', value: profile.stats.latest_update, icon: FiClock }];
  return <div className="portal-page"><div className="portal-shell profile-shell"><aside className="portal-sidebar"><BrandMark /><div className="portal-rule" /><div className="profile-company">{profile.company_logo ? <img src={profile.company_logo} alt="Company logo" /> : <div>{profile.client_name.slice(0, 2)}</div>}<strong>{profile.client_name}</strong><span>Client workspace</span></div><div className="portal-client"><span>Signed in as</span><strong>{user?.name}</strong><button onClick={() => { logout(); navigate('/login'); }}><FiLogOut className="inline mr-1" /> Sign out</button></div></aside><main className="portal-main"><header className="portal-header"><div className="portal-heading"><div className="portal-heading__avatar"><FiUser /></div><div><h1>Welcome Back, {user?.name?.split(' ')[0]}!</h1><p>Here is your project portfolio at a glance.</p></div></div></header><div className="portal-content"><section className="profile-hero"><div><span>Client dashboard</span><h2>Everything about your project, in one clear view.</h2><p>Select a site to access progress tours, videos, image folders, and final deliverables.</p><button onClick={() => navigate('/sites')}>View project sites <FiArrowRight /></button></div></section><div className="portal-grid portal-grid--three">{stats.map(({ label, value, icon: Icon }) => <div className="data-card stat-card" key={label}><span><Icon /></span><strong>{value}</strong><small>{label}</small></div>)}</div><div className="info-bar"><FiCheckCircle /> Your account only displays sites and project content assigned to {profile.client_name}.</div></div></main></div></div>;
};
export default ClientProfile;
