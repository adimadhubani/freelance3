import React from 'react';
import { FiMapPin, FiExternalLink, FiNavigation } from 'react-icons/fi';

const SiteMap = ({ latitude, longitude, siteName = 'Site Location', googleMapsUrl }) => {
  const hasCoordinates = latitude !== null && latitude !== undefined && latitude !== '' &&
                         longitude !== null && longitude !== undefined && longitude !== '';

  const mapsUrl = googleMapsUrl || (hasCoordinates ? `https://www.google.com/maps?q=${latitude},${longitude}` : null);
  const embedUrl = hasCoordinates ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed` : null;

  return (
    <div className="bg-white rounded-card border border-borderLight p-md md:p-lg shadow-sm mt-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm mb-md pb-xs border-b border-borderLight">
        <div className="flex items-center gap-xs">
          <div className="p-xs bg-bgLight text-primaryDark rounded-md">
            <FiMapPin size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-textPrimary">Site Location Map</h3>
            <p className="text-xs text-textSecondary">
              {hasCoordinates ? `${siteName} (${latitude}, ${longitude})` : 'Geographic position & map view'}
            </p>
          </div>
        </div>

        {hasCoordinates && mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-xs px-sm text-xs flex items-center justify-center gap-xs text-primaryDark border-borderDark hover:bg-bgLight transition-colors"
          >
            <FiExternalLink size={14} />
            <span>Open in Google Maps</span>
          </a>
        )}
      </div>

      {!hasCoordinates ? (
        <div className="flex flex-col items-center justify-center p-xl bg-bgLight rounded-lg border border-dashed border-borderDark/30 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-200/60 flex items-center justify-center text-textMuted mb-xs">
            <FiNavigation size={22} />
          </div>
          <p className="text-sm font-semibold text-textPrimary">Location not set for this site</p>
          <p className="text-xs text-textSecondary mt-1">
            Latitude and longitude coordinates have not been assigned to this project site yet.
          </p>
        </div>
      ) : (
        <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden border border-borderLight shadow-inner relative bg-zinc-100">
          <iframe
            title={`Map view for ${siteName}`}
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
};

export default SiteMap;
