import React from 'react';
import { FiPlay, FiCompass } from 'react-icons/fi';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const PanoramaVideoCard = ({ month, year, title, thumbnail, videoSource, onClick }) => {
  const monthName = months[month - 1] || `Month ${month}`;
  const label = `${monthName} ${year}`;
  // Default construction 360 video thumbnail if none provided
  const bgThumbnail = thumbnail || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800';

  return (
    <article className="data-card media-card cursor-pointer group overflow-hidden rounded-xl" onClick={onClick}>
      {/* ✅ Month/Year + 360° Badge - Overlay on image */}
      <div className="relative aspect-video bg-zinc-900">
        <img
          src={bgThumbnail}
          alt={title || `360 Video ${label}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Overlay Content */}
        <div className="absolute inset-0">
          {/* Top: Month/Year + Badge */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">
              {label}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primaryDark text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <FiCompass size={11} />
              360°
            </span>
          </div>

          {/* Center: Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 text-primaryDark flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:bg-white">
              <FiPlay size={24} className="ml-1" />
            </div>
          </div>

          {/* Bottom: Title */}
          {/* <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm truncate">
              {title || `360° Video Tour`}
            </p>
          </div> */}
        </div>
      </div>
      {/* ❌ Footer completely removed */}
    </article>
  );
};

export default PanoramaVideoCard;