import React from 'react';
import { FiFolderMinus } from 'react-icons/fi';

const EmptyState = ({ message = 'No project files available for this section.' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-xl min-h-[300px] border border-dashed border-borderLight rounded-card bg-surfaceLight text-center">
      <div className="text-textLight mb-md">
        <FiFolderMinus size={48} />
      </div>
      <h3 className="text-base font-semibold text-textSecondary mb-sm">No Files Found</h3>
      <p className="text-textMuted max-w-sm text-sm">{message}</p>
    </div>
  );
};

export default EmptyState;
