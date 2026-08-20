import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientProfile } from '../services/siteService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { FiLayers, FiCheckCircle, FiClock, FiChevronRight, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const ClientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getClientProfile();
        setProfile(data.client);
      } catch (err) {
        console.error('Error fetching client profile:', err);
        setError(err.response?.data?.error || 'Failed to load client profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="min-h-screen bg-bgLight flex items-center justify-center"><LoadingSpinner message="Loading client profile..." /></div>;
  if (error) return <div className="min-h-screen bg-bgLight flex items-center justify-center"><ErrorMessage message={error} onRetry={() => window.location.reload()} /></div>;

  return (
    <div className="min-h-screen bg-bgLight flex flex-col justify-between">
      {/* Top Simple Bar */}
      <header className="h-[72px] bg-white border-b border-borderLight flex items-center justify-between px-md md:px-xl">
        <span className="font-bold text-lg text-textPrimary tracking-tight">Aeroview 360</span>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="btn-ghost text-sm font-semibold flex items-center gap-xs text-textSecondary hover:text-primaryDark"
        >
          <FiLogOut size={16} />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Profile Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-md md:px-lg py-xl">
        {/* Welcome Section */}
        <div className="bg-white rounded-card border border-borderLight shadow-card p-lg mb-xl flex flex-col md:flex-row items-center gap-lg">
          {profile.company_logo ? (
            <img
              src={profile.company_logo}
              alt="Company Logo"
              className="w-24 h-24 rounded-full object-cover bg-bgLight border border-borderLight shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primaryDark text-white font-black text-3xl flex items-center justify-center border border-borderLight">
              {profile.client_name.slice(0, 2).toUpperCase()}
            </div>
          )}
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl font-bold text-textPrimary">{profile.client_name}</h1>
            <p className="text-sm text-textSecondary mt-xs">Company Management Dashboard</p>
            <span className="inline-flex items-center gap-xs px-sm py-[2px] bg-green-50 text-successGreen border border-green-200 rounded-full text-xs font-semibold uppercase mt-md">
              Active Client Profile
            </span>
          </div>

          <button
            onClick={() => navigate('/sites')}
            className="btn-primary py-md px-lg w-full md:w-auto flex items-center justify-center gap-xs text-base"
          >
            <span>View Sites</span>
            <FiChevronRight size={18} />
          </button>
        </div>

        {/* Stats Grid */}
        <h3 className="text-base font-bold text-textMuted uppercase tracking-wider mb-md">Portfolio Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {/* Active Projects Card */}
          <div className="custom-card flex items-center gap-md">
            <div className="bg-orange-50 text-warningOrange p-md rounded-card border border-orange-100">
              <FiLayers size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-textPrimary leading-none">{profile.stats.active_sites}</p>
              <p className="text-xs font-bold text-textSecondary mt-[4px] uppercase tracking-wide">Active Sites</p>
            </div>
          </div>

          {/* Completed Projects Card */}
          <div className="custom-card flex items-center gap-md">
            <div className="bg-blue-50 text-infoBlue p-md rounded-card border border-blue-100">
              <FiCheckCircle size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-textPrimary leading-none">{profile.stats.completed_sites}</p>
              <p className="text-xs font-bold text-textSecondary mt-[4px] uppercase tracking-wide">Completed Sites</p>
            </div>
          </div>

          {/* Latest Update Card */}
          <div className="custom-card flex items-center gap-md">
            <div className="bg-green-50 text-successGreen p-md rounded-card border border-green-100">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-lg font-bold text-textPrimary leading-none">{profile.stats.latest_update}</p>
              <p className="text-xs font-bold text-textSecondary mt-[6px] uppercase tracking-wide">Latest Upload</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-lg text-center border-t border-borderLight bg-white text-xs text-textMuted">
        <p>© {new Date().getFullYear()} Aeroview 360. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ClientProfile;
