import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiGrid, FiCompass, FiPlayCircle, FiImage, FiCompass as FiLayers, FiLogOut, FiArrowLeft, FiX, FiShield } from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav Items
  const navItems = [
    {
      name: '360° Tour',
      path: `/sites/${siteId}/360-tour`,
      icon: <FiCompass size={18} />,
    },
    {
      name: 'Tour Video',
      path: `/sites/${siteId}/videos`,
      icon: <FiPlayCircle size={18} />,
    },
    {
      name: 'Image Product',
      path: `/sites/${siteId}/images`,
      icon: <FiImage size={18} />,
    },
    {
      name: 'Final Product',
      path: `/sites/${siteId}/final-product`,
      icon: <FiLayers size={18} />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-200"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] bg-primaryDark text-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:flex-shrink-0 border-r border-secondaryGray`}
      >
        {/* Header (Company Logo) */}
        <div className="flex items-center justify-between h-[72px] px-lg border-b border-secondaryGray bg-primaryDark">
          <div className="flex items-center gap-sm">
            {user?.company_logo ? (
              <img
                src={user.company_logo}
                alt="Client Logo"
                className="w-8 h-8 rounded-full bg-white object-cover border border-secondaryGray"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-secondaryGray flex items-center justify-center font-bold text-white text-xs">
                A
              </div>
            )}
            <span className="font-bold text-base tracking-wider truncate max-w-[150px]">
              {user?.client_name || 'Aeroview 360'}
            </span>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-xs text-textLight hover:text-white rounded"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Back to Sites CTA */}
        <div className="p-md">
          <button
            onClick={() => {
              onClose();
              navigate('/sites');
            }}
            className="w-full flex items-center justify-center gap-xs bg-secondaryGray/50 border border-secondaryGray text-textLight hover:text-white py-[10px] px-md rounded-button text-sm font-semibold transition-all duration-200"
          >
            <FiArrowLeft size={16} />
            <span>Back to Sites</span>
          </button>
        </div>

        {/* Navigation Modules list */}
        <nav className="flex-1 px-sm space-y-[4px] py-xs overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-md px-md py-[12px] text-sm font-semibold rounded-button transition-all duration-200 border-l-[3px] ${
                  isActive
                    ? 'bg-primaryGray text-white border-white'
                    : 'text-textLight border-transparent hover:bg-primaryGray hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}

          {/* Admin Tools link */}
          {isAdmin && (
            <div className="pt-md mt-md border-t border-secondaryGray">
              <span className="px-md text-xs font-bold text-textMuted uppercase tracking-wider block mb-sm">
                Administrative
              </span>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-md px-md py-[12px] text-sm font-semibold rounded-button transition-all duration-200 border-l-[3px] ${
                    isActive
                      ? 'bg-primaryGray text-white border-white'
                      : 'text-textLight border-transparent hover:bg-primaryGray hover:text-white'
                  }`
                }
              >
                <FiShield size={18} />
                <span>Upload Dashboard</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Footer (User Details & Logout) */}
        <div className="p-md border-t border-secondaryGray bg-primaryDark">
          <div className="flex items-center gap-sm mb-md px-sm">
            <div className="w-9 h-9 rounded-full bg-secondaryGray flex items-center justify-center font-bold text-white text-sm uppercase">
              {user?.name?.slice(0, 2) || 'US'}
            </div>
            <div className="truncate flex-1">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-textMuted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-xs bg-red-950/40 border border-red-900/60 text-red-300 hover:bg-red-900 hover:text-white py-[10px] rounded-button text-sm font-semibold transition-all duration-200"
          >
            <FiLogOut size={16} />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
