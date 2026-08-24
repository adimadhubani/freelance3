import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import MonthlyCard from '../components/cards/MonthlyCard';
import PanoramaVideoCard from '../components/cards/PanoramaVideoCard';
import SiteMap from '../components/common/SiteMap';
import EmptyState from '../components/common/EmptyState';
import { FiCalendar, FiInfo, FiX, FiMaximize2, FiDownload, FiCompass } from 'react-icons/fi';

const ThreeSixtyTour = () => {
  // Extract context fetched in DashboardLayout
  const { site, monthlyUpdates = [] } = useOutletContext() || {};
  const [selectedTour, setSelectedTour] = useState(null);

  // Extract all panoramas from monthly updates
  const panoramas = monthlyUpdates.reduce((acc, update) => {
    if (update.panoramas && update.panoramas.length > 0) {
      update.panoramas.forEach((pano) => {
        acc.push({
          ...pano,
          month: update.month,
          year: update.year,
          progress: update.progress_percentage,
          notes: update.notes,
          update_date: update.update_date,
        });
      });
    }
    return acc;
  }, []);

  // Extract 360° videos from monthly updates
  const videos360 = monthlyUpdates.reduce((acc, update) => {
    if (update.videos && update.videos.length > 0) {
      update.videos.forEach((vid) => {
        if (vid.video_type === '360' || vid.is_360) {
          acc.push({
            ...vid,
            month: update.month,
            year: update.year,
            progress: update.progress_percentage,
            notes: update.notes,
            update_date: update.update_date,
          });
        }
      });
    }
    return acc;
  }, []);

  const handleOpenTour = (pano) => {
    setSelectedTour(pano);
  };

  const handleCloseTour = () => {
    setSelectedTour(null);
  };

  const handleOpen360VideoTab = (videoUrl) => {
    if (videoUrl) {
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getMonthName = (month) => {
    const names = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return names[month - 1] || `Month ${month}`;
  };

  return (
    <div className="relative space-y-xl">
      {/* 360° Panoramas Section */}
      <div>
        <div className="section-title">
          <div className="section-title__icon">
            <FiCalendar />
          </div>
          <div>
            <h2>Monthly 360° Panorama Tour</h2>
            <p>Track site progress through monthly 360° virtual panoramas.</p>
          </div>
        </div>

        {panoramas.length === 0 ? (
          <EmptyState message="No 360° panoramas have been uploaded for this site yet." />
        ) : (
          <div className="portal-grid portal-grid--two">
            {panoramas.map((pano) => (
              <MonthlyCard
                key={pano.panorama_id}
                month={pano.month}
                year={pano.year}
                title={pano.title}
                progress={pano.progress}
                notes={pano.notes}
                thumbnail={pano.thumbnail_url || pano.tour_url}
                type="360"
                onClick={() => handleOpenTour(pano)}
              />
            ))}
          </div>
        )}

        {panoramas.length > 0 && (
          <div className="info-bar mt-md">
            <FiInfo /> Select any month to view the 360° panorama image and project progress.
          </div>
        )}
      </div>

      {/* 360° Video Tours Section (Clicking opens video URL in a new browser tab) */}
      <div className="pt-lg border-t border-borderLight">
        <div className="section-title">
          <div className="section-title__icon">
            <FiCompass />
          </div>
          <div>
            <h2>360° Interactive Video Tours</h2>
            <p>Select any 360° video tour to launch interactive player in a new browser tab.</p>
          </div>
        </div>

        {videos360.length === 0 ? (
          <EmptyState message="No 360° video tours uploaded for this site yet." />
        ) : (
          <div className="portal-grid portal-grid--two">
            {videos360.map((vid) => (
              <PanoramaVideoCard
                key={vid.video_id}
                month={vid.month}
                year={vid.year}
                title={vid.title}
                progress={vid.progress}
                notes={vid.notes}
                thumbnail={vid.thumbnail_url}
                videoSource={vid.video_source}
                onClick={() => handleOpen360VideoTab(vid.video_url)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Embedded Google Map Section */}
      <div className="pt-lg border-t border-borderLight">
        <SiteMap
          latitude={site?.latitude}
          longitude={site?.longitude}
          siteName={site?.site_name}
          googleMapsUrl={site?.google_maps_url}
        />
      </div>

      {/* 360 Panorama Lightbox Overlay */}
      {selectedTour && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={handleCloseTour}
        >
          <div
            className="w-full max-w-6xl flex justify-between items-center text-white mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-bold text-base md:text-xl leading-tight">
                {selectedTour.title || `Panorama ${getMonthName(selectedTour.month)} ${selectedTour.year}`}
              </h3>
              <p className="text-sm text-gray-400">
                {getMonthName(selectedTour.month)} {selectedTour.year} • Progress: {selectedTour.progress}%
              </p>
              {selectedTour.notes && (
                <p className="text-xs text-gray-500 mt-1 max-w-lg">
                  📝 {selectedTour.notes}
                </p>
              )}
            </div>
            <button
              onClick={handleCloseTour}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors duration-150"
              title="Close"
            >
              <FiX size={24} />
            </button>
          </div>

          <div
            className="w-full max-w-6xl bg-zinc-900 rounded-lg overflow-hidden border border-gray-700 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedTour.tour_url || selectedTour.thumbnail_url}
                alt={selectedTour.title || `Panorama ${selectedTour.month}/${selectedTour.year}`}
                className="w-full h-auto max-h-[75vh] object-contain bg-zinc-900"
                loading="lazy"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => window.open(selectedTour.tour_url || selectedTour.thumbnail_url, '_blank')}
                  className="p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white transition-colors duration-150"
                  title="Open in new tab"
                >
                  <FiMaximize2 size={18} />
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedTour.tour_url || selectedTour.thumbnail_url;
                    link.download = `${selectedTour.title || 'panorama'}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white transition-colors duration-150"
                  title="Download image"
                >
                  <FiDownload size={18} />
                </button>
              </div>
            </div>

            <div className="px-4 py-3 bg-zinc-800 border-t border-gray-700">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progress</span>
                <span>{selectedTour.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${selectedTour.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeSixtyTour;