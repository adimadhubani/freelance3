import React, { useState } from 'react';
import { useParams, Outlet, useLocation } from 'react-router-dom';
import { useSiteData } from '../../hooks/useSiteData';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const DashboardLayout = () => {
  const { siteId } = useParams();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Custom hook fetches site, monthlyUpdates, and finalProducts
  const { site, monthlyUpdates, finalProducts, loading, error, refetch } = useSiteData(siteId);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgLight flex items-center justify-center">
        <LoadingSpinner message="Syncing construction site database..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bgLight flex items-center justify-center p-md">
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-shell">
        {/* Navigation Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        <div className="portal-main flex flex-col min-w-0 relative">
          {/* Dashboard Top Header - passes client logo from auth context */}
          <Header
            siteName={site?.site_name}
            siteLocation={site?.location}
            onMenuToggle={toggleSidebar}
            clientLogo={user?.company_logo}
            clientName={user?.client_name}
            userName={user?.name}  // ✅ Added
          />

          {/* Dynamic Outlet Component Grid */}
          <main className="portal-content flex-grow">
            <Outlet context={{ site, monthlyUpdates, finalProducts, refetch }} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
