import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  FiBox, FiCompass, FiImage, FiLogOut, FiPlayCircle, FiX, FiMap, FiMapPin, FiArrowLeft,
  FiUser, FiBriefcase, FiActivity, FiCheckCircle
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

// ✅ Company Logo Component - Rounded with proper styling
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
    ['Site Map', 'View Location on Map', `/sites/${siteId}/map`, FiMap],
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

        {/* ✅ Company Logo - Rounded with glow */}
        <CompanyLogo />
        <div className="portal-rule" />

        {/* Client Profile Card */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
            {user?.client?.company_logo ? (
              <img
                src={user.client.company_logo}
                alt={user.client.client_name}
                className="w-16 h-16 rounded-xl object-cover border border-white/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primaryDark text-white flex items-center justify-center font-bold text-lg">
                {(user?.client?.client_name || user?.name || 'C').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-blue-400 uppercase tracking-wider">Client</p>
              <p className="font-semibold text-white truncate text-sm">
                {user?.client?.client_name || user?.name || 'Aeroview Client'}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <FiUser size={12} /> {user?.name || 'User'}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
              <FiActivity className="text-blue-400 mx-auto text-sm" />
              <span className="block text-[10px] text-slate-400">Active</span>
              <span className="font-bold text-white text-sm">
                {user?.client?.active_sites || user?.stats?.active_sites || 0}
              </span>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
              <FiCheckCircle className="text-green-400 mx-auto text-sm" />
              <span className="block text-[10px] text-slate-400">Completed</span>
              <span className="font-bold text-white text-sm">
                {user?.client?.completed_sites || user?.stats?.completed_sites || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="portal-rule" />

        {/* Back to Sites Button */}
        <div className="px-4 py-2">
          <button
            onClick={() => navigate('/sites')}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all duration-200 group"
          >
            <FiArrowLeft className="text-blue-400 group-hover:-translate-x-1 transition-transform" size={16} />
            <span>Back to All Sites</span>
          </button>
        </div>

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
                `portal-nav__item ${isActive ? 'active' : ''} group`
              }
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                  <Icon className={`portal-nav__icon ${({ isActive }) => isActive ? 'text-blue-400' : 'text-slate-400'} group-hover:text-blue-400 transition-colors`} />
                </div>
                <span>
                  <strong className="text-sm text-white">{name}</strong>
                  <small className="text-xs text-slate-400 block">{description}</small>
                </span>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="portal-rule" />

        {/* User & Logout */}
        <div className="portal-client px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <FiUser className="text-slate-400 text-sm" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Signed in as</span>
          </div>
          <strong className="text-sm block text-white truncate">
            {user?.name || 'User'}
          </strong>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            <FiLogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;