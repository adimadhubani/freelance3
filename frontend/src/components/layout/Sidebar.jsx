import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { FiBox, FiCompass, FiImage, FiLogOut, FiPlayCircle, FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import BrandMark from '../common/BrandMark';

const Sidebar = ({ isOpen, onClose }) => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const navItems = [
    ['360° Tour', 'Explore 360° Panorama', `/sites/${siteId}/360-tour`, FiCompass],
    ['Tour Video', 'Walkthrough & Flythrough', `/sites/${siteId}/videos`, FiPlayCircle],
    ['Image Product', 'Project Images & Captures', `/sites/${siteId}/images`, FiImage],
    ['Final Product', 'Deliverables & Reports', `/sites/${siteId}/final-product`, FiBox],
  ];

  return <>
    {isOpen && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-50 bg-slate-950/50 lg:hidden" />}
    <aside className={`portal-sidebar ${isOpen ? 'is-open' : ''}`}>
      <button onClick={onClose} className="absolute right-4 top-4 z-10 text-white lg:hidden"><FiX size={22} /></button>
      <BrandMark />
      <div className="portal-rule" />
      <nav className="portal-nav" aria-label="Project modules">
        {navItems.map(([name, description, path, Icon]) => <NavLink key={name} to={path} onClick={onClose} className={({ isActive }) => `portal-nav__item ${isActive ? 'active' : ''}`}>
          <Icon className="portal-nav__icon" />
          <span><strong>{name}</strong><small>{description}</small></span>
        </NavLink>)}
      </nav>
      <div className="portal-client">
        <span>Builder / Client</span>
        <strong>{user?.client_name || user?.name || 'Aeroview Client'}</strong>
        <button onClick={() => { logout(); navigate('/login'); }}><FiLogOut className="inline mr-1" /> Sign out</button>
      </div>
    </aside>
  </>;
};

export default Sidebar;
