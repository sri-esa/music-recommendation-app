// harmonia-api/models/Track.js

/*
Track Schema:
  id SERIAL PRIMARY KEY,
  album_id INTEGER NOT NULL,
  artist_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  duration INTEGER, -- in seconds
  file_url VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  release_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES albums(id),
  FOREIGN KEY (artist_id) REFERENCES artists(id)
*/

// Mock database (in-memory for now)
const tracks = [];
let currentTrackId = 1;

async function createTrack({ album_id, artist_id, title, duration, file_url, genre, release_date }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTrack = {
        id: currentTrackId++,
        album_id,
        artist_id,
        title,
        duration: duration || 0,
        file_url,
        genre: genre || 'Undefined',
        release_date: release_date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      tracks.push(newTrack);
      resolve(newTrack);
    }, 50);
  });
}

async function findTracksByAlbumId(albumId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const albumTracks = tracks.filter((t) => t.album_id === albumId);
      resolve(albumTracks);
    }, 50);
  });
}

async function findTracksByArtistId(artistId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const artistTracks = tracks.filter((t) => t.artist_id === artistId);
      resolve(artistTracks);
    }, 50);
  });
}

async function findTrackById(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const track = tracks.find((t) => t.id === id);
            resolve(track);
        }, 50);
    });
}

module.exports = {
  createTrack,
  findTracksByAlbumId,
  findTracksByArtistId,
  findTrackById,
  searchTracksByTitle,
};

async function searchTracksByTitle(query) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        resolve([]);
        return;
      }
      const lowerCaseQuery = query.toLowerCase();
      const results = tracks.filter(track =>
        track.title.toLowerCase().includes(lowerCaseQuery)
      );
      resolve(results);
    }, 50);
  });
}
