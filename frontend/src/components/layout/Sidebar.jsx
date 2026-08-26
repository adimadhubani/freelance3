import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { FiBox, FiCompass, FiImage, FiLogOut, FiPlayCircle, FiX, FiMap, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import BrandMark from '../common/BrandMark';

const Sidebar = ({ isOpen, onClose, officeLocation }) => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const currentOfficeLocation = officeLocation !== undefined ? officeLocation : user?.office_location;

  const navItems = [
    ['360° Virtual Tour', 'Explore 360° Panorama', `/sites/${siteId}/360-tour`, FiCompass],
    ['Site Videos', 'Explore Site Videos', `/sites/${siteId}/videos`, FiPlayCircle],
    ['Site Images', 'Project Images & Captures', `/sites/${siteId}/images`, FiImage],
    ['Final Product', 'Deliverables & Reports', `/sites/${siteId}/final-product`, FiBox],
    ['Site Map', 'View Location on Map', `/sites/${siteId}/map`, FiMap], // ✅ NEW
  ];

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside className={`portal-sidebar ${isOpen ? 'is-open' : ''}`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-white lg:hidden"
        >
          <FiX size={22} />
        </button>

        <BrandMark />
        <div className="portal-rule" />

        {/* Office Location Section */}
        <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10">
          <p className="text-[11px] text-blue-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
            <FiMapPin size={13} /> Office Location
          </p>
          <p className="text-xs text-slate-200 mt-1 truncate" title={currentOfficeLocation || 'Office location not set'}>
            {currentOfficeLocation || 'Office location not set'}
          </p>
        </div>

        <nav className="portal-nav" aria-label="Project modules">
          {navItems.map(([name, description, path, Icon]) => (
            <NavLink
              key={name}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `portal-nav__item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="portal-nav__icon" />
              <span>
                <strong>{name}</strong>
                <small>{description}</small>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="portal-client">
          <span>Builder / Client</span>
          <strong>{user?.client_name || user?.name || 'Aeroview Client'}</strong>
          <button onClick={() => { logout(); navigate('/login'); }}>
            <FiLogOut className="inline mr-1" /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;