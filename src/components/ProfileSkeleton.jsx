// src/components/ProfileSkeleton.jsx
import React from 'react';

const ProfileSkeleton = () => {
  return (
    <div className="flex items-center space-x-4 animate-pulse">
      <div className="w-20 h-20 rounded-full bg-gray-700"></div>
      <div>
        <div className="h-8 bg-gray-700 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-32"></div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
