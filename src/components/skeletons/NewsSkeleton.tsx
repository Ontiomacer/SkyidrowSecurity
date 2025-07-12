import React from 'react';

const NewsSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50">
      <div className="animate-pulse">
        {/* Image Skeleton */}
        <div className="h-48 bg-gray-700/50" />
        
        {/* Content Skeleton */}
        <div className="p-5">
          {/* Title */}
          <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-3" />
          
          {/* Summary */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-700/50 rounded w-full" />
            <div className="h-3 bg-gray-700/50 rounded w-5/6" />
            <div className="h-3 bg-gray-700/50 rounded w-4/6" />
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-16 bg-gray-700/50 rounded" />
              <div className="h-5 w-16 bg-gray-700/50 rounded-full" />
            </div>
            <div className="h-3 w-16 bg-gray-700/50 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsSkeleton;
