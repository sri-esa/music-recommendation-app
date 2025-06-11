// src/components/TrackItemSkeleton.jsx
import React from 'react';

const TrackItemSkeleton = () => {
  return (
    <div className="flex items-center space-x-3 bg-gray-800 p-3 rounded-lg animate-pulse">
      <div className="w-12 h-12 rounded bg-gray-700"></div>
      <div>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-1.5"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default TrackItemSkeleton;
