import React, { useState } from 'react';
import { FiDownload, FiMaximize2, FiImage } from 'react-icons/fi';
import ImageGallery from 'react-image-gallery';
import PDFViewer from './PDFViewer';
import 'react-image-gallery/styles/css/image-gallery.css';

const MediaGallery = ({ folderName, month, year, items = [], onBack }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'images', 'pdfs'
  const [activeImageIndex, setActiveImageIndex] = useState(-1);

  const images = items.filter((item) => item.file_type !== 'pdf');
  const pdfs = items.filter((item) => item.file_type === 'pdf');

  const filteredItems = items.filter((item) => {
    if (filter === 'images') return item.file_type !== 'pdf';
    if (filter === 'pdfs') return item.file_type === 'pdf';
    return true;
  });

  const handleDownloadImage = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'photo.jpg';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const galleryItems = images.map((img) => ({
    original: img.image_url,
    thumbnail: img.image_url,
    description: folderName,
  }));

  return (
    <div className="space-y-md">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-borderLight pb-md">
        <div>
          <h2 className="text-xl font-bold text-textPrimary flex items-center gap-xs">
            <FiImage className="text-textMuted" />
            {folderName}
          </h2>
          <p className="text-xs text-textSecondary mt-0.5">
            {month}/{year} • {images.length} Photos, {pdfs.length} PDF Documents
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-bgLight p-1 rounded-lg border border-borderLight text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-sm py-xs rounded-md font-medium transition-colors ${
              filter === 'all' ? 'bg-primaryDark text-white shadow-xs' : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter('images')}
            className={`px-sm py-xs rounded-md font-medium transition-colors ${
              filter === 'images' ? 'bg-primaryDark text-white shadow-xs' : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Photos ({images.length})
          </button>
          <button
            onClick={() => setFilter('pdfs')}
            className={`px-sm py-xs rounded-md font-medium transition-colors ${
              filter === 'pdfs' ? 'bg-primaryDark text-white shadow-xs' : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            PDFs ({pdfs.length})
          </button>
        </div>
      </div>

      {/* Grid View */}
      {filteredItems.length === 0 ? (
        <div className="p-xl text-center text-textMuted bg-bgLight rounded-card border border-dashed border-borderLight">
          No files found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
          {filteredItems.map((item, idx) => {
            const isPdf = item.file_type === 'pdf';

            if (isPdf) {
              return (
                <PDFViewer
                  key={item.image_id || idx}
                  pdfUrl={item.image_url}
                  fileName={item.original_name}
                  title={item.original_name || `${folderName} PDF ${idx + 1}`}
                />
              );
            }

            // Image Thumbnail Item
            const imgIndexInImages = images.findIndex((img) => img.image_id === item.image_id);
            const fileName = item.original_name || `photo-${idx + 1}.jpg`;

            return (
              <div
                key={item.image_id || idx}
                className="relative aspect-square rounded-card overflow-hidden border border-borderLight group bg-zinc-100 cursor-pointer shadow-xs hover:shadow-md transition-shadow"
                onClick={() => setActiveImageIndex(imgIndexInImages >= 0 ? imgIndexInImages : 0)}
              >
                <img
                  src={item.image_url}
                  alt={folderName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-xs">
                    <span className="p-xs bg-white text-primaryDark rounded-full shadow hover:bg-bgLight" title="View full size">
                      <FiMaximize2 size={16} />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadImage(item.image_url, fileName);
                      }}
                      className="p-xs bg-primaryDark text-white rounded-full shadow hover:bg-zinc-800"
                      title="Download photo"
                    >
                      <FiDownload size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal for Images */}
      {activeImageIndex >= 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-center items-center p-md">
          <div className="w-full max-w-4xl flex justify-between items-center text-white mb-sm">
            <span className="text-sm font-semibold">{folderName} Photo View</span>
            <div className="flex items-center gap-md">
              <button
                onClick={() => {
                  const currentImg = images[activeImageIndex];
                  if (currentImg) handleDownloadImage(currentImg.image_url, currentImg.original_name || `photo-${activeImageIndex + 1}.jpg`);
                }}
                className="btn-secondary text-sm py-xs px-sm text-white border-white hover:bg-secondaryGray flex items-center gap-xs"
              >
                <FiDownload size={16} />
                <span>Download</span>
              </button>
              <button
                onClick={() => setActiveImageIndex(-1)}
                className="btn-primary text-sm py-xs px-sm"
              >
                Close
              </button>
            </div>
          </div>

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
};

export default MediaGallery;
