import React from 'react';
import { FiFileText, FiExternalLink } from 'react-icons/fi';

const PDFViewer = ({ pdfUrl, fileName, title = 'PDF Document' }) => {
  const cleanName = fileName || (pdfUrl ? pdfUrl.split('/').pop().split('?')[0] : 'document.pdf');

  const handleOpenPDFInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="bg-white p-md rounded-card border border-borderLight flex flex-col justify-between hover:shadow-md transition-all group relative cursor-pointer hover:border-textMuted"
      onClick={handleOpenPDFInNewTab}
      title="Click to open PDF document in new tab"
    >
      <div className="flex items-start gap-sm mb-md">
        <div className="p-md bg-red-50 text-red-600 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
          <FiFileText size={32} />
        </div>
        <div className="overflow-hidden flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100/60 px-1.5 py-0.5 rounded inline-block mb-1">
            PDF Document
          </span>
          <h4 className="text-sm font-bold text-textPrimary truncate" title={title || cleanName}>
            {title || cleanName}
          </h4>
          <p className="text-xs text-textSecondary truncate mt-0.5" title={cleanName}>
            {cleanName}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-xs border-t border-borderLight text-xs text-textSecondary group-hover:text-primaryDark">
        <span className="font-semibold flex items-center gap-1">
          Open PDF Document
        </span>
        <FiExternalLink size={14} />
      </div>
    </div>
  );
};

export default PDFViewer;
