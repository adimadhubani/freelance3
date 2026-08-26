import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBriefcase, FiLogOut, FiMapPin, FiUser } from 'react-icons/fi';
import BrandMark from '../components/common/BrandMark';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { getClientSites, getClientProfile } from '../services/siteService';

// ✅ Company Logo Component - 28x28 (w-28 h-28)
const CompanyLogo = () => {
  return (
    <div className="flex items-center justify-center px-4 py-4">
      <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-blue-400/30 shadow-lg shadow-blue-500/20 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <img
          src="/com.jpeg"
          alt="Aeroview 360"
          className="w-full h-full object-cover scale-110"
        />
      </div>
    </div>
  );
};

const SiteSelection = () => {
  const [sites, setSites] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [sitesData, profileData] = await Promise.all([
        getClientSites(),
        getClientProfile()
      ]);
      setSites(sitesData.sites || []);
      setProfile(profileData.client || null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load project sites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return (
    <div className="portal-page grid place-items-center">
      <LoadingSpinner message="Loading your projects…" />
    </div>
  );

  if (error) return (
    <div className="portal-page grid place-items-center">
      <ErrorMessage message={error} onRetry={load} />
    </div>
  );

  return (
    <div className="portal-page">
      <div className="portal-shell selection-shell">

        {/* ========== SIDEBAR ========== */}
        <aside className="portal-sidebar selection-sidebar">

          {/* ✅ Company Logo - 28x28 */}
          <CompanyLogo />
          <div className="portal-rule" />

          <div className="selection-person">
            <strong>{user?.name || 'Client User'}</strong>
            <span>{user?.client_name || 'Aeroview Client'}</span>
            <p><FiBriefcase /> Secure client workspace</p>
          </div>

          {/* Office Location */}
          <div className="my-3 px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-left">
            <p className="text-[11px] text-blue-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <FiMapPin size={13} /> Office Location
            </p>
            <p className="text-xs text-slate-200 mt-1 truncate" title={profile?.office_location || user?.office_location || 'Office location not set'}>
              {profile?.office_location || user?.office_location || 'Office location not set'}
            </p>
          </div>

          <div className="auth-features">
            <p><FiBriefcase /> Project progress records</p>
            <p><FiMapPin /> Site-specific access</p>
          </div>

          <div className="portal-client">
            <span>Precision in Data.</span>
            <strong>Perfection in Visualization.</strong>
            <button onClick={() => { logout(); navigate('/login'); }}>
              <FiLogOut className="inline mr-1" /> Sign out
            </button>
          </div>
        </aside>

        {/* ========== MAIN CONTENT ========== */}
        <main className="portal-main selection-main">

          {/* Avatar: client logo → initials → icon fallback */}
          <div className="selection-head">
            <div className='profile-company'>
              {profile?.company_logo ? (
                <img
                  src={profile.company_logo}
                  alt="Company logo"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primaryDark text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {profile?.client_name?.slice(0, 2).toUpperCase() || 'C'}
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-textPrimary">Welcome Back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-sm text-textSecondary">Here is your project portfolio at a glance</p>
            <div className="portal-rule" />
          </div>

          {/* Site List */}
          {sites.length === 0 ? (
            <EmptyState message="No project sites are available for your client account yet." />
          ) : (
            <div className="site-list">
              {sites.map((site, index) => (
                <button
                  key={site.site_id}
                  onClick={() => navigate(`/sites/${site.site_id}/360-tour`)}
                  className="site-choice"
                >
                  <span className="site-choice__icon"><FiBriefcase /></span>
                  <span>
                    <strong>{site.site_name || `Site ${index + 1}`}</strong>
                    <small>{site.location || 'Click to access dashboard'} · {site.status || 'Active'}</small>
                  </span>
                  <FiArrowRight />
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SiteSelection;