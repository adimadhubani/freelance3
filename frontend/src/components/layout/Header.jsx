import React from 'react';
import { FiMenu, FiLayers } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ siteName, siteLocation, onMenuToggle }) => {
  const { user } = useAuth();

  return (
    <header className="h-[72px] bg-white border-b border-borderLight flex items-center justify-between px-md md:px-lg sticky top-0 z-30">
      <div className="flex items-center gap-md">
        {/* Toggle Button for mobile/tablet */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-sm -ml-sm text-textSecondary hover:text-primaryDark hover:bg-bgLight rounded"
        >
          <FiMenu size={22} />
        </button>

        {/* Site Details (Headline) */}
        <div>
          {siteName ? (
            <div className="flex flex-col md:flex-row md:items-center md:gap-sm">
              <h2 className="text-base md:text-lg font-bold text-textPrimary leading-none md:leading-tight">
                {siteName}
              </h2>
              {siteLocation && (
                <>
                  <span className="hidden md:inline text-textLight font-light">|</span>
                  <span className="text-xs md:text-sm text-textSecondary font-medium">
                    {siteLocation}
                  </span>
                </>
              )}
            </div>
          ) : (
            <h2 className="text-base md:text-lg font-bold text-textPrimary leading-none">
              Aeroview 360 Workspace
            </h2>
          )}
        </div>
      </div>

      {/* Right side stats or branding */}
      <div className="flex items-center gap-md">
        {/* Client Name indicator */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-bold text-textMuted uppercase tracking-wide">
            Project Dashboard
          </span>
          <span className="text-sm font-semibold text-textSecondary">
            {user?.client_name || 'BuildCorp'}
          </span>
        </div>
        
        {/* Logo Icon */}
        <div className="w-10 h-10 rounded bg-bgLight border border-borderLight flex items-center justify-center text-primaryDark">
          <FiLayers size={20} />
        </div>
      </div>
    </header>
  );
};

export default Header;
