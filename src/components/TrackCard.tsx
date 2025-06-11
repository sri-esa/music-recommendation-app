// src/components/TrackCard.tsx
import React from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

// Assuming SpotifyTrackObject is defined in a way that's accessible here
// or we redefine/import it. For simplicity, let's assume it's available
// or define a local version for props.
interface SpotifyTrackObject {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  preview_url: string | null;
  uri: string; // Added for completeness, might be useful later
  duration_ms: number; // Added for completeness
}

interface TrackCardProps {
  track: SpotifyTrackObject;
  onPreviewClick: (track: SpotifyTrackObject) => void;
  isPlayingPreview: boolean; // Is this specific track's preview currently playing?
}

const TrackCard: React.FC<TrackCardProps> = ({ track, onPreviewClick, isPlayingPreview }) => {
  const hasPreview = !!track.preview_url;

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-700 hover:shadow-xl transform hover:scale-[1.03]">
      <div className="relative mb-3">
        <img
          src={track.album.images?.[0]?.url || 'https://via.placeholder.com/150'} // Fallback image
          alt={track.album.name}
          className="w-full aspect-square object-cover rounded-md"
        />
        {hasPreview && (
          <button
            onClick={() => onPreviewClick(track)}
            title={isPlayingPreview ? "Pause Preview" : "Play Preview"}
            className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-400 text-white p-2.5 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-300"
            aria-label={isPlayingPreview ? "Pause preview" : "Play preview"}
          >
            {isPlayingPreview ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      <div>
        <h3
            className="text-md font-semibold text-white truncate"
            title={track.name}
        >
            {track.name}
        </h3>
        <p
            className="text-sm text-gray-400 truncate"
            title={track.artists.map(a => a.name).join(', ')}
        >
            {track.artists.map(a => a.name).join(', ')}
        </p>
      </div>
    </div>
  );
};

export default TrackCard;

// Re-define SpotifyTrackObject if not imported from a central types file.
// For this subtask, defining it locally in TrackCard.tsx is acceptable if a shared types file isn't established yet.
// Ensure the props interface matches the one used in LibraryPage.tsx when fetching data.
// The `SpotifyTrackObject` used in `LibraryPage.tsx` for `SpotifySavedTrackObject.track` should be compatible.
