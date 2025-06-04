import { useState } from 'react';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://via.placeholder.com/150',
  favoriteArtists: [
    { id: 1, name: 'The Weeknd', image: 'https://via.placeholder.com/80' },
    { id: 2, name: 'Ed Sheeran', image: 'https://via.placeholder.com/80' },
    { id: 3, name: 'Taylor Swift', image: 'https://via.placeholder.com/80' },
    { id: 4, name: 'Drake', image: 'https://via.placeholder.com/80' },
  ],
  recentlyPlayed: [
    { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', playedAt: '2 hours ago' },
    { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', playedAt: '3 hours ago' },
    { id: 3, title: 'Anti-Hero', artist: 'Taylor Swift', playedAt: '5 hours ago' },
    { id: 4, title: 'Rich Flex', artist: 'Drake', playedAt: 'Yesterday' },
    { id: 5, title: 'Starboy', artist: 'The Weeknd', playedAt: 'Yesterday' },
  ],
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(mockUser);
  const [editForm, setEditForm] = useState({
    name: mockUser.name,
    email: mockUser.email,
  });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUserData(prev => ({
      ...prev,
      ...editForm
    }));
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-24 h-24 rounded-full"
            />
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="input mt-1"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <CheckIcon className="h-5 w-5" />
                  Save Changes
                </button>
              </form>
            ) : (
              <div>
                <h1 className="text-2xl font-bold">{userData.name}</h1>
                <p className="text-gray-400">{userData.email}</p>
              </div>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <PencilIcon className="h-5 w-5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Favorite Artists */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Favorite Artists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {userData.favoriteArtists.map((artist) => (
            <div
              key={artist.id}
              className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <img
                src={artist.image}
                alt={artist.name}
                className="w-20 h-20 rounded-full mx-auto mb-3"
              />
              <h3 className="text-center font-medium">{artist.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Played */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Song</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Artist</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Played</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {userData.recentlyPlayed.map((song) => (
                <tr key={song.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">{song.title}</td>
                  <td className="px-6 py-4 text-gray-400">{song.artist}</td>
                  <td className="px-6 py-4 text-gray-400">{song.playedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Profile; 