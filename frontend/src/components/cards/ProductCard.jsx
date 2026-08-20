import React from 'react';
import { FiDownload, FiMaximize2, FiImage } from 'react-icons/fi';

const ProductCard = ({ product, onPreview }) => {
  const { title, product_type, preview_url, file_url } = product;

  const handleDownload = (e) => {
    e.stopPropagation();
    // Fetch and download helper
    if (!file_url) return;
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = file_url;
    link.download = title || 'blueprint';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="custom-card flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Preview Frame */}
        <div
          onClick={onPreview}
          className="relative h-48 bg-primaryDark rounded-button overflow-hidden mb-md cursor-pointer border border-borderLight flex items-center justify-center"
        >
          {preview_url ? (
            <img
              src={preview_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="text-textLight flex flex-col items-center gap-sm">
              <FiImage size={32} />
              <span className="text-xs">No Blueprint Preview</span>
            </div>
          )}
          
          {/* Glassmorphic hover overlay */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <FiMaximize2 size={28} className="text-white drop-shadow-md" />
          </div>

          {/* Product Type Label */}
          <span className="absolute bottom-sm right-sm bg-primaryDark/80 backdrop-blur-sm text-white px-sm py-[2px] rounded text-xs font-semibold uppercase tracking-wider">
            {product_type === 'top-view' ? 'Aerial / Top View' : 'Elevation View'}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-textPrimary mb-sm group-hover:text-primaryDark transition-colors duration-200">
          {title}
        </h4>
      </div>

      {/* Action panel */}
      <div className="mt-md border-t border-borderLight pt-md flex items-center justify-between gap-sm">
        <button
          onClick={onPreview}
          className="btn-secondary text-sm flex-1 py-sm flex items-center justify-center gap-xs"
        >
          <FiMaximize2 size={16} />
          View Blueprint
        </button>
        
        <button
          onClick={handleDownload}
          title="Download File"
          className="btn-primary text-sm p-sm rounded-button inline-flex items-center justify-center"
        >
          <FiDownload size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
