import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ReactPlayer from 'react-player';
import MonthlyCard from '../components/cards/MonthlyCard';
import EmptyState from '../components/common/EmptyState';
import { FiFilm, FiInfo, FiX } from 'react-icons/fi';

const TourVideo = () => {
  const { monthlyUpdates } = useOutletContext();
  const [activeVideo, setActiveVideo] = useState(null);

  // Compile list of videos from monthly updates
  const videos = monthlyUpdates.reduce((acc, update) => {
    if (update.videos && update.videos.length > 0) {
      update.videos.forEach((vid) => {
        acc.push({
          ...vid,
          month: update.month,
          year: update.year,
          progress: update.progress_percentage,
          notes: update.notes,
        });
      });
    }
    return acc;
  }, []);

  const handleOpenVideo = (video) => {
    setActiveVideo(video);
  };

  const handleCloseVideo = () => {
    setActiveVideo(null);
  };

  return (
    <div>
      <div className="section-title"><div className="section-title__icon"><FiFilm /></div><div><h2>Monthly Video</h2><p>Track progress with monthly walkthrough and flythrough videos.</p></div></div>

      {videos.length === 0 ? (
        <EmptyState message="No tracking videos have been uploaded for this site yet." />
      ) : (
        <div className="portal-grid portal-grid--three">
          {videos.map((vid) => (
            <MonthlyCard
              key={vid.video_id}
              month={vid.month}
              year={vid.year}
              title={vid.title}
              progress={vid.progress}
              notes={vid.notes}
              // Generate standard video screenshot placeholder or default construction background
              thumbnail="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800"
              type="video"
              onClick={() => handleOpenVideo(vid)}
            />
          ))}
        </div>
      )}
      {videos.length > 0 && <div className="info-bar"><FiInfo /> Select any monthly card to watch its walkthrough or flythrough video.</div>}

      {/* Video Streaming Lightbox Overlay */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-md">
          {/* Top Info Bar */}
          <div className="w-full max-w-5xl flex justify-between items-center text-white mb-md">
            <div>
              <div className="flex items-center gap-xs">
                <FiFilm className="text-textLight" />
                <span className="text-xs uppercase font-bold tracking-wider bg-secondaryGray px-xs py-[2px] rounded">
                  {activeVideo.video_type}
                </span>
              </div>
              <h3 className="font-bold text-base md:text-lg leading-tight mt-sm">{activeVideo.title}</h3>
            </div>
            <button
              onClick={handleCloseVideo}
              className="p-sm bg-secondaryGray hover:bg-accentGray rounded-full text-white transition-colors duration-150"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Video Player wrapper */}
          <div className="w-full max-w-5xl aspect-[16/9] bg-black rounded-card overflow-hidden border border-secondaryGray relative shadow-2xl">
            <ReactPlayer
              url={activeVideo.video_url}
              controls
              playing
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TourVideo;
