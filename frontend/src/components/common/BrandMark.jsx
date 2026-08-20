import React from 'react';
import { FiAperture } from 'react-icons/fi';

const BrandMark = ({ compact = false }) => (
  <div className={`brand-mark ${compact ? 'brand-mark--compact' : ''}`}>
    <div className="brand-mark__icon"><FiAperture /></div>
    <div className="brand-mark__wordmark">AERO<span>VIEW</span><small>360</small></div>
    {!compact && <p>Precision in <span>Data.</span> Perfection in Visualization.</p>}
  </div>
);

export default BrandMark;
