import React from 'react';

const LoadingSpinner = ({ message = 'Loading workspace...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-xl min-h-[300px]">
      <div className="relative w-12 h-12">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-borderLight"></div>
        {/* Spinning Indicator */}
        <div className="absolute inset-0 rounded-full border-4 border-t-primaryDark border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <p className="mt-md text-textSecondary font-medium text-sm animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
