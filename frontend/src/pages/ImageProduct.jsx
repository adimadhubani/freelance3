import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import MonthlyCard from '../components/cards/MonthlyCard';
import EmptyState from '../components/common/EmptyState';
import MediaGallery from '../components/common/MediaGallery';
import { FiChevronLeft, FiImage, FiInfo } from 'react-icons/fi';

const ImageProduct = () => {
  const { monthlyUpdates = [] } = useOutletContext() || {};
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Group images and PDFs by month, year, and folder name
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
        const items = groupedByFolder[folderName];
        const pdfCount = items.filter((i) => i.file_type === 'pdf').length;
        const imgCount = items.length - pdfCount;

        acc.push({
          id: `${update.update_id}-${folderName}`,
          month: update.month,
          year: update.year,
          folderName: folderName,
          images: items,
          imgCount,
          pdfCount,
          progress: update.progress_percentage,
          notes: update.notes,
        });
      });
    }
    return acc;
  }, []);

  if (selectedFolder) {
    return (
      <div>
        <button
          onClick={() => setSelectedFolder(null)}
          className="btn-secondary py-sm px-md flex items-center gap-xs text-sm mb-md text-textPrimary hover:bg-bgLight"
        >
          <FiChevronLeft />
          Back to Folders
        </button>

        <MediaGallery
          folderName={selectedFolder.folderName}
          month={selectedFolder.month}
          year={selectedFolder.year}
          items={selectedFolder.images}
          onBack={() => setSelectedFolder(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="section-title">
        <div className="section-title__icon">
          <FiImage />
        </div>
        <div>
          <h2>Project Media & Documents</h2>
          <p>Access photos and PDF documents organized by update folder.</p>
        </div>
      </div>

      {folders.length === 0 ? (
        <EmptyState message="No tracking photos or PDF documents have been uploaded for this site yet." />
      ) : (
        <div className="portal-grid portal-grid--two">
          {folders.map((folder) => {
            const summaryText = folder.pdfCount > 0
              ? `${folder.imgCount} photos, ${folder.pdfCount} PDFs`
              : `${folder.images.length} photos stored`;

            return (
              <MonthlyCard
                key={folder.id}
                month={folder.month}
                year={folder.year}
                title={folder.folderName}
                progress={folder.progress}
                notes={summaryText}
                type="image"
                onClick={() => setSelectedFolder(folder)}
              />
            );
          })}
        </div>
      )}
      {folders.length > 0 && (
        <div className="info-bar">
          <FiInfo /> Open any folder to view photo thumbnails or launch PDF documents in a new browser tab.
        </div>
      )}
    </div>
  );
};

export default ImageProduct;
