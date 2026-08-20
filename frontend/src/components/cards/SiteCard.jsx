import React from 'react';
import { FiMapPin, FiCalendar, FiChevronRight } from 'react-icons/fi';
import { STATUS_COLORS } from '../../utils/constants';

const SiteCard = ({ site, onClick }) => {
  const { site_name, location, status, start_date, completion_date } = site;

  // Retrieve custom tailwind colors for status
  const badgeClass = STATUS_COLORS[status] || 'text-textSecondary bg-gray-50 border-borderLight';

  return (
    <div
      onClick={onClick}
      className="custom-card flex flex-col justify-between cursor-pointer group transition-all duration-200"
    >
      <div>
        {/* Status Badge & Icon */}
        <div className="flex justify-between items-start mb-md">
          <span className={`px-sm py-[2px] rounded-full border text-xs font-semibold uppercase tracking-wider ${badgeClass}`}>
            {status}
          </span>
          <div className="text-textLight group-hover:text-primaryDark transition-colors duration-200">
            <FiChevronRight size={20} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-textPrimary mb-sm group-hover:text-primaryDark transition-colors duration-200">
          {site_name}
        </h3>

        {/* Details */}
        <div className="space-y-xs text-sm text-textSecondary mt-md">
          <div className="flex items-center gap-xs">
            <FiMapPin className="text-textMuted flex-shrink-0" />
            <span className="truncate">{location || 'Address not set'}</span>
          </div>
          {start_date && (
            <div className="flex items-center gap-xs">
              <FiCalendar className="text-textMuted flex-shrink-0" />
              <span>
                {start_date} {completion_date ? `to ${completion_date}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Visual bottom indicator bar */}
      <div className="mt-lg pt-sm border-t border-borderLight flex justify-end text-xs font-semibold text-textMuted group-hover:text-primaryDark transition-colors duration-200">
        Open Site Dashboard
      </div>
    </div>
  );
};

export default SiteCard;
