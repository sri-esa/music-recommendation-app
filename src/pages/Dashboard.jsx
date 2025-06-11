// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { callSpotifyApi, SpotifyApiError } from '../utils/spotify';

// Mock data for sections not being updated in this task
const mockRecommendations = [
  { id: 1, title: 'Chill Vibes', artist: 'Spotify Mix', cover: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Mix1' },
  { id: 2, title: 'Workout Hits', artist: 'Spotify Mix', cover: 'https://via.placeholder.com/150/00FF00/000000?text=Mix2' },
  { id: 3, title: 'Focus Flow', artist: 'Spotify Mix', cover: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Mix3' },
  { id: 4, title: 'Indie Jams', artist: 'Spotify Mix', cover: 'https://via.placeholder.com/150/FFFF00/000000?text=Mix4' },
  { id: 5, title: 'Throwback Party', artist: 'Spotify Mix', cover: 'https://via.placeholder.com/150/FF00FF/FFFFFF?text=Mix5' },
  { id: 6, title: 'Acoustic Mornings', artist: 'Spotify Mix', cover: 'https://via.placeholder.com/150/00FFFF/000000?text=Mix6' },
];
// const mockRecentSongs = [ ... ]; // This will be removed

const Dashboard = () => {
  const { getValidAccessToken, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [playlistCount, setPlaylistCount] = useState(null);
  const [recentTracks, setRecentTracks] = useState([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState(''); // Keep existing search query state

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getValidAccessToken();
        if (!token) {
          setError("Please login to see your dashboard.");
          setLoadingProfile(false);
          setLoadingPlaylists(false);
          setLoadingRecent(false);
          return;
        }

        setError(null); // Clear previous errors on a new fetch attempt

        // Fetch User Profile
        setLoadingProfile(true);
        try {
          const userData = await callSpotifyApi('/me', token);
          setProfile(userData);
        } catch (err) {
          console.error("Error fetching profile:", err);
          if (err instanceof SpotifyApiError && (err.status === 401 || err.status === 403)) {
            logout(); // This will redirect to login or clear state
            setError('Your session has expired. Please login again.'); // More specific error
          } else {
            setError(prev => prev ? prev + '\nFailed to load profile.' : 'Failed to load profile.');
          }
        } finally {
          setLoadingProfile(false);
        }

        // Fetch Playlists
        setLoadingPlaylists(true);
        try {
          // Only proceed if profile fetch was successful or not dependent
          if (token && !(error && error.includes('session has expired'))) { // Avoid fetching if already logged out
            const playlistsData = await callSpotifyApi('/me/playlists?limit=1', token);
            setPlaylistCount(playlistsData.total);
          }
        } catch (err) {
          console.error("Error fetching playlists:", err);
           if (err instanceof SpotifyApiError && (err.status === 401 || err.status === 403)) {
            if (!error || !error.includes('session has expired')) logout(); // Avoid double logout message
            setError('Your session has expired. Please login again.');
          } else {
            setError(prev => prev ? prev + '\nFailed to load playlists.' : 'Failed to load playlists.');
          }
        } finally {
          setLoadingPlaylists(false);
        }

        // Fetch Recently Played
        setLoadingRecent(true);
        try {
          if (token && !(error && error.includes('session has expired'))) { // Avoid fetching if already logged out
            const recentData = await callSpotifyApi('/me/player/recently-played?limit=4', token);
            setRecentTracks(recentData.items || []);
          }
        } catch (err) {
          console.error("Error fetching recent tracks:", err);
          if (err instanceof SpotifyApiError && (err.status === 401 || err.status === 403)) {
            if (!error || !error.includes('session has expired')) logout();
            setError('Your session has expired. Please login again.');
          } else {
            setError(prev => prev ? prev + '\nFailed to load recent tracks.' : 'Failed to load recent tracks.');
          }
        } finally {
          setLoadingRecent(false);
        }

      } catch (err) { // Catch errors from getValidAccessToken itself or other unexpected issues
        console.error("Error in dashboard data fetching logic:", err);
        setError("An unexpected error occurred while preparing to fetch data.");
        setLoadingProfile(false);
        setLoadingPlaylists(false);
        setLoadingRecent(false);
      }
    };

    fetchDashboardData();
  }, [getValidAccessToken, logout]); // Removed 'error' from dependency array to avoid re-fetch loops on error setting

  return (
    <div className="max-w-7xl mx-auto">
      {/* Profile Info Section */}
      <section className="mb-8 p-6 bg-gray-800 rounded-lg shadow">
        {loadingProfile && <p className="text-gray-400">Loading profile...</p>}
        {profile && (
          <div className="flex items-center space-x-4">
            <img
              src={profile.images?.[0]?.url || 'https://via.placeholder.com/80'}
              alt={profile.display_name || 'User'}
              className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome, {profile.display_name || 'User'}!</h1>
              {loadingPlaylists && <p className="text-gray-400 mt-1">Loading playlists count...</p>}
              {playlistCount !== null && !loadingPlaylists && <p className="text-gray-300 mt-1">Total Playlists: {playlistCount}</p>}
            </div>
          </div>
        )}
      </section>

      {error && (
        <div className="mb-4 p-4 bg-red-800 text-red-100 border border-red-700 rounded-lg">
          <h3 className="font-bold mb-2">Error:</h3>
          {error.split('\n').map((line, idx) => line.trim() && <p key={idx}>{line}</p>)}
        </div>
      )}

      {/* Search Bar (existing) */}
      <div className="mb-8">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for songs, artists, or albums..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Recently Played */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">Recently Played</h2>
        {loadingRecent && <p className="text-gray-400">Loading recently played tracks...</p>}
        {!loadingRecent && recentTracks.length === 0 && !(error && error.includes('recent tracks')) && <p className="text-gray-400">No recently played tracks found.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentTracks.map((item) => (
            <div
              key={item.played_at || item.track.id}
              className="flex items-center space-x-3 bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <img
                src={item.track.album.images?.[0]?.url || 'https://via.placeholder.com/60'}
                alt={item.track.name}
                className="w-12 h-12 rounded"
              />
              <div>
                <h3 className="font-medium text-white truncate" title={item.track.name}>{item.track.name}</h3>
                <p className="text-sm text-gray-400 truncate" title={item.track.artists.map(a => a.name).join(', ')}>
                  {item.track.artists.map(a => a.name).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Made for You (existing mock data) */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-white">Made for You</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockRecommendations.map((song) => (
            <div
              key={song.id}
              className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <img
                src={song.cover}
                alt={song.title}
                className="w-full aspect-square object-cover rounded-lg mb-3"
              />
              <h3 className="font-medium truncate text-white">{song.title}</h3>
              <p className="text-sm text-gray-400 truncate">{song.artist}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Genres (existing static data) */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-white">Your Top Genres</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Pop', 'Rock', 'Hip Hop', 'Electronic', 'R&B', 'Jazz'].map((genre) => (
            <div
              key={genre}
              className="bg-gradient-to-br from-green-500 to-blue-600 p-6 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            >
              <h3 className="text-lg font-bold text-white">{genre}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
