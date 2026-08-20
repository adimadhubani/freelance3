import React, { useState } from 'react';
import { useParams, Outlet, useLocation } from 'react-router-dom';
import { useSiteData } from '../../hooks/useSiteData';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const DashboardLayout = () => {
  const { siteId } = useParams();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
    <div className="min-h-screen bg-bgLight flex overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative">
        {/* Dashboard Top Header */}
        <Header
          siteName={site?.site_name}
          siteLocation={site?.location}
          onMenuToggle={toggleSidebar}
        />

        {/* Dynamic Outlet Component Grid */}
        <main className="flex-grow p-md md:p-lg">
          <Outlet context={{ site, monthlyUpdates, finalProducts, refetch }} />
        </main>

        {/* Footer */}
        <footer className="py-md text-center border-t border-borderLight bg-white text-xs text-textMuted mt-auto">
          <p>© {new Date().getFullYear()} Aeroview 360. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
