import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ImageGallery from 'react-image-gallery';
import MonthlyCard from '../components/cards/MonthlyCard';
import EmptyState from '../components/common/EmptyState';
import { FiChevronLeft, FiDownload, FiMaximize2, FiFolder } from 'react-icons/fi';
import "react-image-gallery/styles/css/image-gallery.css";

const ImageProduct = () => {
  const { monthlyUpdates } = useOutletContext();
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(-1);

  // Group images by month, year, and folder name
  const folders = monthlyUpdates.reduce((acc, update) => {
    if (update.images && update.images.length > 0) {
      // Group by folder_name within this month
      const groupedByFolder = update.images.reduce((gAcc, img) => {
        const fName = img.folder_name || 'General';
        if (!gAcc[fName]) {
          gAcc[fName] = [];
        }
        gAcc[fName].push(img);
        return gAcc;
      }, {});

      Object.keys(groupedByFolder).forEach((folderName) => {
        acc.push({
          id: `${update.update_id}-${folderName}`,
          month: update.month,
          year: update.year,
          folderName: folderName,
          images: groupedByFolder[folderName],
          progress: update.progress_percentage,
          notes: update.notes,
        });
      });
    }
    return acc;
  }, []);

  const handleDownloadImage = (url, filename = 'site-photo.jpg') => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert folder images to format needed for react-image-gallery
  const getGalleryItems = (folder) => {
    if (!folder) return [];
    return folder.images.map((img) => ({
      original: img.image_url,
      thumbnail: img.image_url,
      description: folder.folderName,
    }));
  };

  if (selectedFolder) {
    const galleryItems = getGalleryItems(selectedFolder);

    return (
      <div>
        {/* Sub Header & Back link */}
        <div className="mb-lg">
          <button
            onClick={() => { setSelectedFolder(null); setActiveImageIndex(-1); }}
            className="btn-secondary py-sm px-md flex items-center gap-xs text-sm mb-md"
          >
            <FiChevronLeft />
            Back to Folders
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-textPrimary flex items-center gap-xs">
                <FiFolder className="text-textMuted" />
                {selectedFolder.folderName}
              </h1>
              <p className="text-sm text-textSecondary mt-xs">
                Photos for {selectedFolder.month}/{selectedFolder.year} | {selectedFolder.images.length} images
              </p>
            </div>
            <button
              onClick={() => setActiveImageIndex(0)}
              className="btn-primary flex items-center gap-xs py-sm text-sm"
            >
              <FiMaximize2 />
              Start Slideshow
            </button>
          </div>
        </div>

        {/* Thumbnail Image Grid with Lazy Loading */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
          {selectedFolder.images.map((img, idx) => (
            <div
              key={img.image_id}
              className="relative aspect-square rounded-card overflow-hidden border border-borderLight group bg-zinc-200 cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200"
              onClick={() => setActiveImageIndex(idx)}
            >
              <img
                src={img.image_url}
                alt={selectedFolder.folderName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-sm">
                  <span className="p-xs bg-white text-primaryDark rounded-full shadow hover:bg-bgLight">
                    <FiMaximize2 size={16} />
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadImage(img.image_url, `${selectedFolder.folderName}-${idx}.jpg`);
                    }}
                    className="p-xs bg-primaryDark text-white rounded-full shadow hover:bg-zinc-800"
                  >
                    <FiDownload size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fullscreen React Image Gallery Lightbox Overlay */}
        {activeImageIndex >= 0 && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-center items-center p-md">
            {/* Gallery Control Bar */}
            <div className="w-full max-w-4xl flex justify-between items-center text-white mb-sm">
              <span className="text-sm font-semibold">{selectedFolder.folderName} Slideshow</span>
              <div className="flex items-center gap-md">
                <button
                  onClick={() => {
                    const activeUrl = selectedFolder.images[activeImageIndex]?.image_url;
                    handleDownloadImage(activeUrl, `site-gallery-image-${activeImageIndex}.jpg`);
                  }}
                  className="btn-secondary text-sm py-xs px-sm text-white border-white hover:bg-secondaryGray flex items-center gap-xs"
                >
                  <FiDownload size={16} />
                  <span>Download Raw</span>
                </button>
                <button
                  onClick={() => setActiveImageIndex(-1)}
                  className="btn-primary text-sm py-xs px-sm"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Main Carousel Element */}
            <div className="w-full max-w-4xl aspect-[16/10] bg-black border border-secondaryGray rounded-card overflow-hidden shadow-2xl relative">
              <ImageGallery
                items={galleryItems}
                startIndex={activeImageIndex}
                showPlayButton={false}
                showFullscreenButton={false}
                onSlide={(index) => setActiveImageIndex(index)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Title Panel */}
      <div className="mb-lg">
        <h1 className="text-xl md:text-2xl font-bold text-textPrimary">Site Photo Folders</h1>
        <p className="text-sm text-textSecondary mt-xs">
          Browse image category folders capturing foundation pouring, structural steel framing, utilities, and exterior completion.
        </p>
      </div>

      {folders.length === 0 ? (
        <EmptyState message="No tracking images have been uploaded for this site yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {folders.map((folder) => (
            <MonthlyCard
              key={folder.id}
              month={folder.month}
              year={folder.year}
              title={folder.folderName}
              progress={folder.progress}
              notes={`${folder.images.length} images stored under this folder.`}
              type="image"
              onClick={() => setSelectedFolder(folder)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageProduct;
