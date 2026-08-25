import React from 'react';
import { FiChevronRight, FiMenu, FiUser } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const labels = { '360-tour': 'Panorama View', videos: 'Tour Video', images: 'Image Product', 'final-product': 'Final Product' };

const ClientAvatar = ({ logo, name }) => {
  if (logo) {
    return (
      <img
        src={logo}
        alt={name || 'Client'}
        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow-md"
      />
    );
  }
  if (name) {
    return (
      <div className="w-14 h-14 rounded-full bg-primaryDark text-white flex items-center justify-center font-bold text-xl shadow-md">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
      <FiUser className="text-gray-500 text-2xl" />
    </div>
  );
};

const Header = ({ siteName, onMenuToggle, clientLogo, clientName, userName }) => {
  const location = useLocation();
  const page = labels[location.pathname.split('/').pop()] || 'Project Dashboard';

  return (
    <header className="portal-header">
      <div className="portal-heading">
        <button onClick={onMenuToggle} className="mr-1 text-[#0b63f6] lg:hidden" aria-label="Open navigation">
          <FiMenu size={24} />
        </button>

        {/* ✅ Larger Logo */}
        <ClientAvatar logo={clientLogo} name={clientName} />

        <div>
          {/* ✅ Welcome Back with Username */}
          <h1 className="text-lg font-bold text-textPrimary">
            Welcome Back, {userName || 'User'}!
          </h1>
          <p className="text-sm text-textSecondary">
            {page}{siteName ? ` · ${siteName}` : ''}
          </p>
        </div>
      </div>
      <div className="portal-breadcrumb">
        <span>Dashboard</span>
        <FiChevronRight className="inline mx-1" />
        {page}
      </div>
    </header>
  );
};

export default Header;