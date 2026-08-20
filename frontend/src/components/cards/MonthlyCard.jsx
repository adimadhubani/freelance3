import React from 'react';
import { FiPlayCircle, FiEye, FiFolder } from 'react-icons/fi';
import ProgressBar from '../common/ProgressBar';

const MonthlyCard = ({
  month,
  year,
  title,
  progress,
  notes,
  thumbnail,
  type, // '360', 'video', 'image'
  onClick,
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthLabel = monthNames[month - 1] || `Month ${month}`;

  // Icon mapping
  const renderIcon = () => {
    switch (type) {
      case 'video':
        return <FiPlayCircle size={36} className="text-white drop-shadow-md" />;
      case 'image':
        return <FiFolder size={32} className="text-primaryDark" />;
      default:
        return <FiEye size={36} className="text-white drop-shadow-md" />;
    }
  };

  return (
    <div className="custom-card flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Thumbnail Layer for Panoramas/Videos */}
        {type !== 'image' && (
          <div
            onClick={onClick}
            className="relative h-44 bg-primaryDark rounded-button overflow-hidden mb-md cursor-pointer border border-borderLight"
          >
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-textLight">
                No Preview Image
              </div>
            )}
            
            {/* Dark glassmorphism overlay on hover */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center">
              {renderIcon()}
            </div>
            
            {/* Media Type Badge */}
            <span className="absolute bottom-sm right-sm bg-primaryDark/80 backdrop-blur-sm text-white px-sm py-[2px] rounded text-xs font-semibold">
              {type === 'video' ? 'Video' : '360° Panorama'}
            </span>
          </div>
        )}

        {/* Header Details */}
        <div className="flex justify-between items-start mb-sm">
          <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
            {monthLabel} {year}
          </span>
          {type === 'image' && (
            <span className="text-xs font-semibold px-sm py-[2px] bg-bgLight text-textSecondary rounded border border-borderLight flex items-center gap-xs">
              {renderIcon()} Folder
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-textPrimary mb-sm truncate group-hover:text-primaryDark transition-colors duration-200">
          {title}
        </h4>

        {/* Notes (Muted text) */}
        {notes && (
          <p className="text-sm text-textSecondary line-clamp-2 mb-md">
            {notes}
          </p>
        )}
      </div>

      {/* Progress & CTAs */}
      <div className="mt-md space-y-md border-t border-borderLight pt-md">
        {progress !== undefined && (
          <ProgressBar percentage={progress} showText={true} height="h-2" />
        )}
        
        <button
          onClick={onClick}
          className="w-full btn-primary text-sm py-sm mt-sm"
        >
          {type === '360' && 'Launch 360° Tour'}
          {type === 'video' && 'Stream Walkthrough'}
          {type === 'image' && 'Browse Photo Gallery'}
        </button>
      </div>
    </div>
  );
};

export default MonthlyCard;
