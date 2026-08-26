import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProductCard from '../components/cards/ProductCard';
import EmptyState from '../components/common/EmptyState';
import { FiBox, FiDownload, FiInfo, FiX } from 'react-icons/fi';

const FinalProduct = () => {
  const { finalProducts } = useOutletContext();
  const [activeTab, setActiveTab] = useState('all'); // all, elevation, top-view
  const [previewProduct, setPreviewProduct] = useState(null);

  // Filters
  const filteredProducts = finalProducts.filter((product) => {
    if (activeTab === 'all') return true;
    return product.product_type === activeTab;
  });

  const handleDownload = (product) => {
    if (!product.file_url) return;
    const link = document.createElement('a');
    link.href = product.file_url;
    link.download = product.title;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="section-title"><div className="section-title__icon"><FiBox /></div><div><h2>Final Product Overview</h2><p>Explore final deliverables including elevations and aerial top views.</p></div></div>

      {/* Tab Filter Navigation */}
      <div className="flex border-b border-borderLight mb-lg">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-md py-sm font-semibold text-sm transition-all duration-200 border-b-2 ${activeTab === 'all'
            ? 'border-primaryDark text-textPrimary'
            : 'border-transparent text-textMuted hover:text-textSecondary'
            }`}
        >
          All Schematics ({finalProducts.length})
        </button>
        {/* <button
          onClick={() => setActiveTab('elevation')}
          className={`px-md py-sm font-semibold text-sm transition-all duration-200 border-b-2 ${
            activeTab === 'elevation'
              ? 'border-primaryDark text-textPrimary'
              : 'border-transparent text-textMuted hover:text-textSecondary'
          }`}
        >
          Elevation Views ({finalProducts.filter(p => p.product_type === 'elevation').length})
        </button> */}
        {/* <button
          onClick={() => setActiveTab('top-view')}
          className={`px-md py-sm font-semibold text-sm transition-all duration-200 border-b-2 ${activeTab === 'top-view'
              ? 'border-primaryDark text-textPrimary'
              : 'border-transparent text-textMuted hover:text-textSecondary'
            }`}
        >
          Aerial & Top-Views ({finalProducts.filter(p => p.product_type === 'top-view').length})
        </button> */}
      </div>

      {/* Grid List */}
      {filteredProducts.length === 0 ? (
        <EmptyState message={`No blueprints uploaded yet matching filter "${activeTab}".`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              onPreview={() => setPreviewProduct(product)}
            />
          ))}
        </div>
      )}
      {filteredProducts.length > 0 && <div className="info-bar"><FiInfo /> Select a deliverable to preview it, then download the original file when needed.</div>}

      {/* Full Screen Image Lightbox Preview Overlay */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-md">
          {/* Lightbox controls header */}
          <div className="w-full max-w-5xl flex justify-between items-center text-white mb-md">
            <div>
              <h3 className="font-bold text-base md:text-lg">{previewProduct.title}</h3>
              <p className="text-xs text-textLight uppercase tracking-wider">
                {previewProduct.product_type === 'top-view' ? 'Site Topography Map' : 'Elevation Blueprint'}
              </p>
            </div>
            <div className="flex items-center gap-md">
              <button
                onClick={() => handleDownload(previewProduct)}
                className="btn-secondary text-sm py-xs px-sm text-white border-white hover:bg-secondaryGray flex items-center gap-xs"
              >
                <FiDownload size={16} />
                <span>Download File</span>
              </button>
              <button
                onClick={() => setPreviewProduct(null)}
                className="p-sm bg-secondaryGray hover:bg-accentGray rounded-full text-white transition-colors duration-150"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Large image preview */}
          <div className="w-full max-w-5xl max-h-[80vh] flex justify-center items-center bg-zinc-950 rounded-card overflow-hidden border border-secondaryGray p-xs">
            <img
              src={previewProduct.file_url || previewProduct.preview_url}
              alt={previewProduct.title}
              className="max-w-full max-h-[75vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalProduct;
