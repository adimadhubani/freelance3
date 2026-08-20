import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import MonthlyCard from '../components/cards/MonthlyCard';
import EmptyState from '../components/common/EmptyState';
import { FiCalendar, FiInfo, FiX, FiMaximize2, FiDownload } from 'react-icons/fi';

const ThreeSixtyTour = () => {
  // Extract monthly updates fetched in DashboardLayout context
  const { monthlyUpdates } = useOutletContext();
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

  const handleOpenTour = (pano) => {
    setSelectedTour(pano);
  };

  const handleCloseTour = () => {
    setSelectedTour(null);
  };

  // Get month name
  const getMonthName = (month) => {
    const names = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return names[month - 1];
  };

  return (
    <div className="relative">
      <div className="section-title">
        <div className="section-title__icon">
          <FiCalendar />
        </div>
        <div>
          <h2>Monthly Tour</h2>
          <p>Track site progress through monthly 360° virtual tours.</p>
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
        <div className="info-bar">
          <FiInfo /> Select any month to view the 360° panorama image and project progress.
        </div>
      )}

      {/* ✅ Simple Image Lightbox Overlay (No Pannellum) */}
      {selectedTour && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={handleCloseTour}
        >
          {/* Header Panel */}
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

          {/* ✅ Simple Image Container */}
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
              
              {/* Image Actions */}
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

            {/* Progress Bar */}
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
              {selectedTour.update_date && (
                <p className="text-xs text-gray-500 mt-2">
                  📅 Updated: {new Date(selectedTour.update_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div 
            className="mt-4 text-center text-xs text-gray-500 max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p>Click outside the image to close. Click the maximize icon to open in new tab.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeSixtyTour;