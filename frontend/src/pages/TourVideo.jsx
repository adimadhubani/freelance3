import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import MonthlyCard from '../components/cards/MonthlyCard';
import EmptyState from '../components/common/EmptyState';
import { FiFilm, FiInfo } from 'react-icons/fi';

const TourVideo = () => {
  const { monthlyUpdates = [] } = useOutletContext() || {};

  // Compile list of regular (non-360) videos from monthly updates
  const videos = monthlyUpdates.reduce((acc, update) => {
    if (update.videos && update.videos.length > 0) {
      update.videos.forEach((vid) => {
        if (vid.video_type !== '360' && !vid.is_360) {
          acc.push({
            ...vid,
            month: update.month,
            year: update.year,
            progress: update.progress_percentage,
            notes: update.notes,
          });
        }
      });
    }
    return acc;
  }, []);

  // ✅ Direct open in new tab
  const handleOpenVideo = (video) => {
    if (video.video_url) {
      window.open(video.video_url, '_blank');
    }
  };

  return (
    <div>
      <div className="section-title">
        <div className="section-title__icon">
          <FiFilm />
        </div>
        <div>
          <h2>Project Videos</h2>
          <p>Watch site progress recordings using native HTML5 streaming video player.</p>
        </div>
      </div>

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
              thumbnail={vid.thumbnail_url || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800"}
              type="video"
              onClick={() => handleOpenVideo(vid)}
            />
          ))}
        </div>
      )}

      {videos.length > 0 && (
        <div className="info-bar mt-md">
          <FiInfo /> Click any video card to open it in a new tab.
        </div>
      )}
    </div>
  );
};

export default TourVideo;