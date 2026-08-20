import React from 'react';
import { FiLock, FiShield, FiUser } from 'react-icons/fi';
import BrandMark from './BrandMark';

const AuthPageShell = ({ children }) => <div className="portal-page"><div className="portal-shell auth-shell"><aside className="portal-sidebar auth-brand"><BrandMark /><div className="portal-rule" /><div className="auth-founder"><strong>AEROVIEW<br /><span>360</span></strong><p>Construction intelligence, presented clearly.</p></div><div className="auth-features"><p><FiShield /> Secure project access</p><p><FiUser /> Client-specific dashboards</p><p><FiLock /> Protected media & deliverables</p></div><div className="portal-client"><span>Precision in Data.</span><strong>Perfection in Visualization.</strong><small>© {new Date().getFullYear()} Aeroview 360</small></div></aside><main className="portal-main auth-main">{children}</main></div></div>;

export default AuthPageShell;
