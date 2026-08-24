import React, { useState } from 'react';
import { FiX, FiFilm, FiAlertCircle } from 'react-icons/fi';

const VideoPlayer = ({ videoUrl, title = 'Project Walkthrough Video', thumbnail, onClose }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!videoUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-md md:p-lg animate-fade-in"
      onClick={onClose}
    >
      {/* Header Bar */}
      <div
        className="w-full max-w-5xl flex justify-between items-center text-white mb-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-xs">
          <div className="p-xs bg-secondaryGray rounded text-white">
            <FiFilm size={18} />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg leading-tight">{title}</h3>
            <p className="text-xs text-textLight">Video Walkthrough & Progress Recording</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-sm bg-secondaryGray hover:bg-accentGray rounded-full text-white transition-colors duration-150 shadow-md"
          title="Close Player"
        >
          <FiX size={22} />
        </button>
      </div>

      {/* Video Container */}
      <div
        className="w-full max-w-5xl aspect-video bg-black rounded-card overflow-hidden border border-secondaryGray relative shadow-2xl flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 z-10">
            <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
            <p className="mt-sm text-xs text-gray-300">Loading video stream...</p>
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center p-lg text-center bg-zinc-900 text-white w-full h-full">
            <FiAlertCircle size={40} className="text-red-400 mb-sm" />
            <h4 className="font-bold text-base">Unable to play video</h4>
            <p className="text-xs text-gray-400 max-w-md mt-xs">
              The video stream could not be loaded or the URL format is unsupported.
            </p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-md btn-secondary text-xs py-xs px-md text-white border-gray-600 hover:bg-gray-800"
            >
              Open Direct Link in New Tab
            </a>
          </div>
        ) : (
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            poster={thumbnail}
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            className="w-full h-full object-contain bg-black"
          >
            Your browser does not support HTML5 video streaming.
          </video>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
