import React from 'react';

const ProgressBar = ({ percentage = 0, height = 'h-2', showText = false }) => {
  // Normalize percentage between 0 and 100
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between items-center mb-sm">
          <span className="text-sm font-semibold text-textSecondary">Construction Progress</span>
          <span className="text-sm font-bold text-primaryDark">{normalizedPercentage}%</span>
        </div>
      )}
      <div className={`w-full bg-borderLight rounded-full overflow-hidden ${height}`}>
        <div
          className="bg-primaryDark h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${normalizedPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
