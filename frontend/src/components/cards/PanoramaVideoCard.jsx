import React from 'react';
import { FiCalendar, FiPlay, FiCompass } from 'react-icons/fi';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const PanoramaVideoCard = ({ month, year, title, progress = 0, notes, thumbnail, videoSource, onClick }) => {
  const monthName = months[month - 1] || `Month ${month}`;
  const label = `${monthName} ${year}`;
  // Default construction 360 video thumbnail if none provided
  const bgThumbnail = thumbnail || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800';

  return (
    <article className="data-card media-card cursor-pointer group" onClick={onClick}>
      <div className="media-card__label flex justify-between items-center">
        <span>{label}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white px-2 py-0.5 rounded flex items-center gap-1">
          <FiCompass size={11} className="animate-spin-slow" />
          360° Video
        </span>
      </div>

      <div className="media-card__image relative aspect-video bg-zinc-900 overflow-hidden">
        <img
          src={bgThumbnail}
          alt={title || `360 Video ${label}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 text-primaryDark flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <FiPlay size={22} className="ml-1" />
          </div>
        </div>
      </div>

      <div className="media-card__body p-sm">
        <strong className="text-sm font-bold text-textPrimary block truncate">{title || `360° Video Tour`}</strong>
        <p className="text-xs text-textSecondary mt-0.5">Work Progress</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="progress-blue flex-1 bg-zinc-200 h-2 rounded-full overflow-hidden">
            <i className="bg-primaryDark h-full block rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <b className="text-xs text-textPrimary">{progress}%</b>
        </div>
      </div>

      <footer className="px-sm py-xs border-t border-borderLight text-xs text-textMuted flex items-center justify-between">
        <span className="flex items-center gap-1"><FiCalendar size={13} /> {label}</span>
        {videoSource && <span className="capitalize text-[11px] font-medium text-textSecondary">{videoSource}</span>}
      </footer>
    </article>
  );
};

export default PanoramaVideoCard;
