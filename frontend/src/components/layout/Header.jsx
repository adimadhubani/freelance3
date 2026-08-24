import React from 'react';
import { FiChevronRight, FiMenu, FiUser } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const labels = { '360-tour': '360° Panorama View', videos: 'Tour Video', images: 'Image Product', 'final-product': 'Final Product' };

const ClientAvatar = ({ logo, name }) => {
  if (logo) {
    return (
      <img
        src={logo}
        alt={name || 'Client'}
        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
      />
    );
  }
  if (name) {
    return (
      <div className="w-10 h-10 rounded-full bg-primaryDark text-white flex items-center justify-center font-bold text-sm shadow-sm">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <div className="portal-heading__avatar">
      <FiUser />
    </div>
  );
};

const Header = ({ siteName, onMenuToggle, clientLogo, clientName }) => {
  const location = useLocation();
  const page = labels[location.pathname.split('/').pop()] || 'Project Dashboard';

  return (
    <header className="portal-header">
      <div className="portal-heading">
        <button onClick={onMenuToggle} className="mr-1 text-[#0b63f6] lg:hidden" aria-label="Open navigation">
          <FiMenu size={24} />
        </button>
        <ClientAvatar logo={clientLogo} name={clientName} />
        <div>
          <h1>Welcome Back!</h1>
          <p>{page}{siteName ? ` · ${siteName}` : ''}</p>
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
