// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { callSpotifyApi, SpotifyApiError } from '../utils/spotify';
import ProfileSkeleton from '../components/ProfileSkeleton';
import TrackItemSkeleton from '../components/TrackItemSkeleton';
import Alert from '../components/Alert';

// Mock data for sections not being updated in this task
const mockRecommendations = [
  { id: 1, title: 'Good 4 U', artist: 'Olivia Rodrigo', cover: 'https://via.placeholder.com/120' },
  { id: 2, title: 'Save Your Tears', artist: 'The Weeknd', cover: 'https://via.placeholder.com/120' },
  { id: 3, title: 'Industry Baby', artist: 'Lil Nas X', cover: 'https://via.placeholder.com/120' },
  { id: 4, title: 'Bad Habits', artist: 'Ed Sheeran', cover: 'https://via.placeholder.com/120' },
  { id: 5, title: 'Shivers', artist: 'Ed Sheeran', cover: 'https://via.placeholder.com/120' },
  { id: 6, title: 'Enemy', artist: 'Imagine Dragons', cover: 'https://via.placeholder.com/120' },
];

const Dashboard = () => {
  const { getValidAccessToken, logout, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [playlistCount, setPlaylistCount] = useState(null);
  const [recentTracks, setRecentTracks] = useState([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingProfile(true);
      setLoadingPlaylists(true);
      setLoadingRecent(true);
      setError(null);

      try {
        const token = await getValidAccessToken();
        if (!token) {
          if (!isAuthenticated) {
            setError("Please login to see your dashboard.");
          } else {
             setError("Could not retrieve a valid session. Please try logging in again.");
          }
          setLoadingProfile(false); setLoadingPlaylists(false); setLoadingRecent(false);
          return;
        }

        // Fetch User Profile
        try {
          const userData = await callSpotifyApi('/me', token);
          setProfile(userData);
        } catch (err) {
          console.error("Error fetching profile:", err);
          if (err instanceof SpotifyApiError && (err.status === 401 || err.status === 403)) { logout(); }
          setError(prev => prev ? prev + '\nFailed to load profile.' : 'Failed to load profile.');
        } finally {
          setLoadingProfile(false);
        }

        // Fetch Playlists
        try {
          const playlistsData = await callSpotifyApi('/me/playlists?limit=1', token);
          setPlaylistCount(playlistsData.total);
        } catch (err) {
          console.error("Error fetching playlists:", err);
          if (err instanceof SpotifyApiError && (err.status === 401 || err.status === 403)) { logout(); }
          setError(prev => prev ? prev + '\nFailed to load playlists count.' : 'Failed to load playlists count.');
        } finally {
          setLoadingPlaylists(false);
        }

        // Fetch Recently Played
        try {
          const recentData = await callSpotifyApi('/me/player/recently-played?limit=4', token);
          setRecentTracks(recentData.items || []);
        } catch (err) {
          console.error("Error fetching recent tracks:", err);
          if (err instanceof SpotifyApiError && (err.status === 401 || err.status === 403)) { logout(); }
          setError(prev => prev ? prev + '\nFailed to load recent tracks.' : 'Failed to load recent tracks.');
        } finally {
          setLoadingRecent(false);
        }

      } catch (err) {
        console.error("Error in dashboard data fetching (token related or other):", err);
        setError("An unexpected error occurred. Please try logging in again.");
        setLoadingProfile(false); setLoadingPlaylists(false); setLoadingRecent(false);
      }
    };

    fetchDashboardData();
  }, [getValidAccessToken, logout, isAuthenticated]);

  const allLoadingDone = !loadingProfile && !loadingPlaylists && !loadingRecent;

  return (
    <div className="max-w-7xl mx-auto">
      {error && allLoadingDone && (
         <div className="my-4">
           <Alert type="error" message={error} onClose={() => setError(null)} />
         </div>
      )}
      {!error && !profile && allLoadingDone && !isAuthenticated && (
         <div className="my-4">
            <Alert type="info" title="Not Logged In" message="Please login to view your dashboard." />
         </div>
      )}

      <section className="mb-8 p-6 bg-gray-800 rounded-lg shadow">
        {loadingProfile ? (
          <ProfileSkeleton />
        ) : profile ? (
          <div className="flex items-center space-x-4">
            <img
              src={profile.images?.[0]?.url || 'https://via.placeholder.com/80'}
              alt={profile.display_name || 'User'}
              className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome, {profile.display_name || 'User'}!</h1>
              {loadingPlaylists ? (
                 <div className="h-4 bg-gray-700 rounded w-32 mt-2 animate-pulse"></div>
              ) : playlistCount !== null ? (
                <p className="text-gray-300 mt-1">Total Playlists: {playlistCount}</p>
              ) : !error ? (
                <p className="text-gray-500 mt-1">Could not load playlist count.</p>
              ): null}
            </div>
          </div>
        ) : !error && allLoadingDone && isAuthenticated ? (
          <p className="text-gray-400">Could not load user profile. The API might be temporarily unavailable.</p>
        ) : null}
      </section>

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

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">Recently Played</h2>
        {loadingRecent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <TrackItemSkeleton key={i} />)}
          </div>
        ) : recentTracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTracks.map((item) => (
              <div
                key={item.played_at || item.track.id}
                className="flex items-center space-x-3 bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-all duration-200 ease-in-out transform hover:scale-[1.02] cursor-pointer"
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
        ) : !error && allLoadingDone ? (
          <div className="col-span-full flex flex-col items-center justify-center py-10 px-4 text-center bg-gray-800 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">Nothing to show here yet!</h3>
            <p className="text-gray-400 max-w-md">
              Start listening to some music on Spotify, and your recently played tracks will appear here.
            </p>
          </div>
        ) : null}
      </section>

       <section>
        <h2 className="text-2xl font-bold mb-4 text-white">Made for You</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockRecommendations.map((song) => (
            <div
              key={song.id}
              className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-all duration-200 ease-in-out transform hover:scale-[1.02] cursor-pointer"
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
