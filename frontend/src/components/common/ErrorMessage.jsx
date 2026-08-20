import React from 'react';
import { FiAlertOctagon } from 'react-icons/fi';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-xl min-h-[300px] text-center">
      <div className="bg-red-50 text-errorRed p-md rounded-full mb-md border border-red-150">
        <FiAlertOctagon size={28} />
      </div>
      <h3 className="text-lg font-semibold text-textPrimary mb-sm">Connection Failed</h3>
      <p className="text-textSecondary max-w-md text-sm mb-lg">{message || 'Unable to retrieve workspace data. Please check your connection.'}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary flex items-center gap-sm"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
