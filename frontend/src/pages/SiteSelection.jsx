import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBriefcase, FiLogOut, FiMapPin, FiUser } from 'react-icons/fi';
import BrandMark from '../components/common/BrandMark';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { getClientSites, getClientProfile } from '../services/siteService'; // ✅ Added getClientProfile

const SiteSelection = () => {
  const [sites, setSites] = useState([]);
  const [profile, setProfile] = useState(null); // ✅ NEW: profile state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      // ✅ Fetch both sites and profile
      const [sitesData, profileData] = await Promise.all([
        getClientSites(),
        getClientProfile()
      ]);
      setSites(sitesData.sites || []);
      setProfile(profileData.client || null); // ✅ Store profile
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
          <BrandMark />
          <div className="portal-rule" />

          <div className="selection-person">
            <strong>{user?.name || 'Client User'}</strong>
            <span>{user?.client_name || 'Aeroview Client'}</span>
            <p><FiBriefcase /> Secure client workspace</p>
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
            <div className='profile-company'>{profile.company_logo ? <img src={profile.company_logo} alt="Company logo" /> : <div>{profile.client_name.slice(0, 2)}</div>}</div>
            <h1>Welcome Back, {user?.name?.split(' ')[0]}!</h1>
            <p>Here is your project portfolio at a glance</p>
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