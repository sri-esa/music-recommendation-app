// src/pages/LibraryPage.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react'; // Added useMemo
import { useAuth } from '../context/AuthContext';
import { callSpotifyApi, SpotifyApiError } from '../utils/spotify';
import Alert from '../components/Alert';
import TrackCard from '../components/TrackCard';
import TrackItemSkeleton from '../components/TrackItemSkeleton';

// Interfaces (SpotifyTrackObject, SpotifySavedTrackObject) as defined before
interface SpotifyTrackObject {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  preview_url: string | null;
  uri: string;
  duration_ms: number;
}
interface SpotifySavedTrackObject {
  added_at: string;
  track: SpotifyTrackObject;
}


const LibraryPage: React.FC = () => {
  const { getValidAccessToken, logout } = useAuth();
  const [likedSongs, setLikedSongs] = useState<SpotifySavedTrackObject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>(''); // New state for search term

  useEffect(() => {
    const fetchLikedSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getValidAccessToken();
        if (!token) {
          setError("You need to be logged in to view your library.");
          setLoading(false);
          return;
        }
        const data = await callSpotifyApi<{ items: SpotifySavedTrackObject[] }>('/me/tracks?limit=50', token);
        setLikedSongs(data.items || []);
      } catch (err) {
        console.error("Error fetching liked songs:", err);
        if (err instanceof SpotifyApiError) {
          if (err.status === 401 || err.status === 403) {
            setError("Your session has expired. Please log in again.");
            logout();
          } else {
            setError(`Failed to load liked songs: ${err.message}`);
          }
        } else if (err instanceof Error) {
          setError(`Failed to load liked songs: ${err.message}`);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLikedSongs();
  }, [getValidAccessToken, logout]);

  useEffect(() => {
    const audioElement = audioRef.current;
    const handleAudioEnded = () => setCurrentPreviewUrl(null);
    if (audioElement) {
      audioElement.addEventListener('ended', handleAudioEnded);
    }
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', handleAudioEnded);
        audioElement.pause();
      }
    };
  }, []);

  const handlePreviewClick = (track: SpotifyTrackObject) => {
    if (!track.preview_url) return;
    if (!audioRef.current) {
        audioRef.current = new Audio();
        // Re-attach ended listener to the new instance if it's created on-the-fly
        // This ensures the current track being played will clear its state when it ends.
        audioRef.current.addEventListener('ended', () => {
             if (audioRef.current && audioRef.current.src === track.preview_url) {
                setCurrentPreviewUrl(null);
            }
        });
    }
    const audioElement = audioRef.current;
    if (currentPreviewUrl === track.preview_url) {
      audioElement.pause();
      setCurrentPreviewUrl(null);
    } else {
      if (!audioElement.paused) { audioElement.pause(); }
      audioElement.src = track.preview_url;
      audioElement.play().then(() => setCurrentPreviewUrl(track.preview_url)).catch(err => {
        console.error("Error playing preview:", err);
        setCurrentPreviewUrl(null);
        setError("Could not play audio preview.");
      });
    }
  };

  // Filtered songs based on search term
  const filteredSongs = useMemo(() => {
    if (!searchTerm.trim()) {
      return likedSongs;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return likedSongs.filter(item => {
      const trackName = item.track.name.toLowerCase();
      const artists = item.track.artists.map(a => a.name.toLowerCase()).join(' ');
      return trackName.includes(lowerSearchTerm) || artists.includes(lowerSearchTerm);
    });
  }, [likedSongs, searchTerm]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">My Liked Songs</h1>
        {/* Search Input */}
        <div className="w-full md:w-auto md:min-w-[300px]"> {/* Adjusted width for better responsiveness */}
          <input
            type="text"
            placeholder="Search your liked songs..."
            className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => <TrackItemSkeleton key={i} />)}
        </div>
      )}

      {/* Content Area: Empty states or Song Grid */}
      {!loading && !error && (
        <>
          {likedSongs.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-10 px-4 text-center bg-gray-800 rounded-lg shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">No Liked Songs Yet!</h3>
              <p className="text-gray-400 max-w-md">
                Looks like your library of liked songs is empty. Go find some music you love on Spotify and give it a heart!
              </p>
            </div>
          )}

          {likedSongs.length > 0 && filteredSongs.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-10 px-4 text-center bg-gray-800 rounded-lg shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">No Matches Found</h3>
              <p className="text-gray-400 max-w-md">
                Try adjusting your search term to find what you're looking for in your liked songs.
              </p>
            </div>
          )}

          {filteredSongs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredSongs.map((item) => (
                <TrackCard
                  key={item.track.id || item.added_at}
                  track={item.track}
                  onPreviewClick={handlePreviewClick}
                  isPlayingPreview={currentPreviewUrl === item.track.preview_url}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LibraryPage;
