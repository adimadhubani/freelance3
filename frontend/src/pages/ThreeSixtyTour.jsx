import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import MonthlyCard from '../components/cards/MonthlyCard';
import EmptyState from '../components/common/EmptyState';
import { FiX, FiMaximize } from 'react-icons/fi';

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

  return (
    <div className="relative">
      {/* Page Title & Details */}
      <div className="mb-lg">
        <h1 className="text-xl md:text-2xl font-bold text-textPrimary">360° Site Walkthroughs</h1>
        <p className="text-sm text-textSecondary mt-xs">
          Select a month to inspect the project site dynamically in fully interactive 360° high-resolution views.
        </p>
      </div>

      {panoramas.length === 0 ? (
        <EmptyState message="No 360° panoramas have been uploaded for this site yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {panoramas.map((pano) => (
            <MonthlyCard
              key={pano.panorama_id}
              month={pano.month}
              year={pano.year}
              title={pano.title}
              progress={pano.progress}
              notes={pano.notes}
              thumbnail={pano.thumbnail_url}
              type="360"
              onClick={() => handleOpenTour(pano)}
            />
          ))}
        </div>
      )}

      {/* Pannellum Interactive 360 Lightbox Overlay */}
      {selectedTour && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-md animate-fade-in">
          {/* Header Panel */}
          <div className="w-full max-w-6xl flex justify-between items-center text-white mb-md">
            <div>
              <h3 className="font-bold text-base md:text-lg leading-tight">{selectedTour.title}</h3>
              <p className="text-xs text-textLight">
                Progress: {selectedTour.progress}% | Month: {selectedTour.month}/{selectedTour.year}
              </p>
            </div>
            <button
              onClick={handleCloseTour}
              className="p-sm bg-secondaryGray hover:bg-accentGray rounded-full text-white transition-colors duration-150"
              title="Close Tour"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Panoramic iFrame container */}
          <div className="w-full max-w-6xl aspect-[16/9] bg-zinc-900 rounded-card overflow-hidden border border-secondaryGray relative shadow-2xl">
            <iframe
              title={selectedTour.title}
              width="100%"
              height="100%"
              allowFullScreen
              style={{ border: 'none' }}
              src={`https://pannellum.org/js/pannellum.htm?panorama=${encodeURIComponent(
                selectedTour.tour_url
              )}&title=${encodeURIComponent(
                selectedTour.title
              )}&autoLoad=true&author=Aeroview360`}
            />
          </div>

          <div className="mt-md text-center text-xs text-textLight max-w-lg">
            <p>Drag the mouse or swipe left/right to rotate the panorama. Use scroll wheel or pinch gestures to zoom.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeSixtyTour;
