import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientSites } from '../services/siteService';
import SiteCard from '../components/cards/SiteCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { FiArrowLeft, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const SiteSelection = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const data = await getClientSites();
        setSites(data.sites || []);
      } catch (err) {
        console.error('Error fetching client sites:', err);
        setError(err.response?.data?.error || 'Failed to load project sites.');
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  const handleSiteClick = (siteId) => {
    // Navigate to default module for site: 360° Tour
    navigate(`/sites/${siteId}/360-tour`);
  };

  if (loading) return <div className="min-h-screen bg-bgLight flex items-center justify-center"><LoadingSpinner message="Retrieving your project sites..." /></div>;
  if (error) return <div className="min-h-screen bg-bgLight flex items-center justify-center"><ErrorMessage message={error} onRetry={() => window.location.reload()} /></div>;

  return (
    <div className="min-h-screen bg-bgLight flex flex-col justify-between">
      {/* Top Header */}
      <header className="h-[72px] bg-white border-b border-borderLight flex items-center justify-between px-md md:px-xl">
        <div className="flex items-center gap-md">
          <button
            onClick={() => navigate('/profile')}
            className="btn-ghost p-xs text-textSecondary hover:text-primaryDark flex items-center gap-xs text-sm font-semibold"
          >
            <FiArrowLeft size={16} />
            <span>Profile</span>
          </button>
          <span className="text-textLight font-light">|</span>
          <span className="font-bold text-base text-textPrimary">Select Construction Site</span>
        </div>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="btn-ghost text-sm font-semibold flex items-center gap-xs text-textSecondary hover:text-primaryDark"
        >
          <FiLogOut size={16} />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-md md:px-lg py-xl">
        <div className="mb-lg">
          <h1 className="text-2xl font-bold text-textPrimary">Project Workspace</h1>
          <p className="text-sm text-textSecondary mt-xs">Select any project site listed below to view real-time monthly tracking resources.</p>
        </div>

        {sites.length === 0 ? (
          <EmptyState message="No project sites have been registered for your company profile yet. Please contact support or upload data via Admin." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {sites.map((site) => (
              <SiteCard
                key={site.site_id}
                site={site}
                onClick={() => handleSiteClick(site.site_id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-lg text-center border-t border-borderLight bg-white text-xs text-textMuted">
        <p>© {new Date().getFullYear()} Aeroview 360. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SiteSelection;
