// harmonia-api/models/Playlist.js

/*
Playlist Schema:
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)

PlaylistTracks Schema:
  playlist_id INTEGER NOT NULL,
  track_id INTEGER NOT NULL,
  sequence_number INTEGER NOT NULL, -- For ordering within a playlist
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (playlist_id, track_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
*/

// Mock database (in-memory for now)
if (!global.playlists) {
  global.playlists = [];
}
if (!global.playlistTracks) {
  global.playlistTracks = [];
}
let currentPlaylistId = 1;

// --- Playlist Management ---

async function createPlaylist({ user_id, name, description = '' }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      const newPlaylist = {
        id: currentPlaylistId++,
        user_id,
        name,
        description,
        created_at: now,
        updated_at: now,
      };
      global.playlists.push(newPlaylist);
      resolve(newPlaylist);
    }, 50);
  });
}

async function getUserPlaylists(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userPlaylists = global.playlists.filter((p) => p.user_id === userId);
      resolve(userPlaylists);
    }, 50);
  });
}

async function getPlaylistById(playlistId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const playlist = global.playlists.find((p) => p.id === playlistId);
      resolve(playlist);
    }, 50);
  });
}

async function updatePlaylistDetails(playlistId, { name, description }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const playlistIndex = global.playlists.findIndex((p) => p.id === playlistId);
      if (playlistIndex === -1) {
        return reject(new Error('Playlist not found.'));
      }
      if (name !== undefined) global.playlists[playlistIndex].name = name;
      if (description !== undefined) global.playlists[playlistIndex].description = description;
      global.playlists[playlistIndex].updated_at = new Date().toISOString();
      resolve(global.playlists[playlistIndex]);
    }, 50);
  });
}

async function deletePlaylist(playlistId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = global.playlists.length;
      global.playlists = global.playlists.filter((p) => p.id !== playlistId);
      if (global.playlists.length === initialLength) {
        return reject(new Error('Playlist not found.'));
      }
      // Also remove associated tracks from PlaylistTracks
      global.playlistTracks = global.playlistTracks.filter((pt) => pt.playlist_id !== playlistId);
      resolve({ success: true, message: 'Playlist deleted.' });
    }, 50);
  });
}

// --- Playlist Tracks Management ---

async function addTrackToPlaylist(playlistId, trackId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if playlist and track exist (in a real app)
      const playlistExists = global.playlists.some(p => p.id === playlistId);
      if (!playlistExists) return reject(new Error('Playlist not found.'));
      // const trackExists = global.tracks.some(t => t.id === trackId); // Assuming global.tracks for Track model
      // if (!trackExists) return reject(new Error('Track not found.'));


      const existingEntry = global.playlistTracks.find(
        (pt) => pt.playlist_id === playlistId && pt.track_id === trackId
      );
      if (existingEntry) {
        return reject(new Error('Track already in this playlist.'));
      }

      // Determine next sequence number
      const tracksInPlaylist = global.playlistTracks.filter(pt => pt.playlist_id === playlistId);
      const maxSequence = tracksInPlaylist.reduce((max, t) => Math.max(max, t.sequence_number), 0);

      const newPlaylistTrack = {
        playlist_id: playlistId,
        track_id: trackId,
        sequence_number: maxSequence + 1,
        added_at: new Date().toISOString(),
      };
      global.playlistTracks.push(newPlaylistTrack);
      resolve(newPlaylistTrack);
    }, 50);
  });
}

async function removeTrackFromPlaylist(playlistId, trackId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = global.playlistTracks.length;
      global.playlistTracks = global.playlistTracks.filter(
        (pt) => !(pt.playlist_id === playlistId && pt.track_id === trackId)
      );
      if (global.playlistTracks.length === initialLength) {
        return reject(new Error('Track not found in this playlist.'));
      }
      // Note: Re-sequencing is not handled here for simplicity, but would be needed in a real app.
      resolve({ success: true, message: 'Track removed from playlist.' });
    }, 50);
  });
}

async function getTracksInPlaylist(playlistId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = global.playlistTracks
        .filter((pt) => pt.playlist_id === playlistId)
        .sort((a, b) => a.sequence_number - b.sequence_number);
      // Returns array of { playlist_id, track_id, sequence_number, added_at }
      // In a real app, you'd join with Tracks table to get full track details.
      resolve(tracks);
    }, 50);
  });
}

async function updateTrackSequenceInPlaylist(playlistId, trackId, newSequenceNumber) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const trackIndex = global.playlistTracks.findIndex(
        (pt) => pt.playlist_id === playlistId && pt.track_id === trackId
      );
      if (trackIndex === -1) {
        return reject(new Error('Track not found in this playlist.'));
      }
      // Basic sequence update. Real implementation might involve re-ordering other tracks.
      global.playlistTracks[trackIndex].sequence_number = newSequenceNumber;
      resolve(global.playlistTracks[trackIndex]);
    }, 50);
  });
}

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylistDetails,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  getTracksInPlaylist,
  updateTrackSequenceInPlaylist,
};
