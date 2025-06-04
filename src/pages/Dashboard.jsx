import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const mockRecentSongs = [
  { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://via.placeholder.com/60' },
  { id: 2, title: 'Stay', artist: 'Kid Laroi & Justin Bieber', cover: 'https://via.placeholder.com/60' },
  { id: 3, title: 'Heat Waves', artist: 'Glass Animals', cover: 'https://via.placeholder.com/60' },
  { id: 4, title: 'As It Was', artist: 'Harry Styles', cover: 'https://via.placeholder.com/60' },
];

const mockRecommendations = [
  { id: 1, title: 'Good 4 U', artist: 'Olivia Rodrigo', cover: 'https://via.placeholder.com/120' },
  { id: 2, title: 'Save Your Tears', artist: 'The Weeknd', cover: 'https://via.placeholder.com/120' },
  { id: 3, title: 'Industry Baby', artist: 'Lil Nas X', cover: 'https://via.placeholder.com/120' },
  { id: 4, title: 'Bad Habits', artist: 'Ed Sheeran', cover: 'https://via.placeholder.com/120' },
  { id: 5, title: 'Shivers', artist: 'Ed Sheeran', cover: 'https://via.placeholder.com/120' },
  { id: 6, title: 'Enemy', artist: 'Imagine Dragons', cover: 'https://via.placeholder.com/120' },
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for songs, artists, or albums..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Recently Played */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockRecentSongs.map((song) => (
            <div
              key={song.id}
              className="flex items-center space-x-3 bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <img src={song.cover} alt={song.title} className="w-12 h-12 rounded" />
              <div>
                <h3 className="font-medium">{song.title}</h3>
                <p className="text-sm text-gray-400">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Made for You */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Made for You</h2>
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
              <h3 className="font-medium truncate">{song.title}</h3>
              <p className="text-sm text-gray-400 truncate">{song.artist}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Genres */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Top Genres</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Pop', 'Rock', 'Hip Hop', 'Electronic', 'R&B', 'Jazz'].map((genre) => (
            <div
              key={genre}
              className="bg-gradient-to-br from-green-500 to-blue-600 p-6 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            >
              <h3 className="text-lg font-bold">{genre}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard; 