// harmonia-api/models/Album.js

/*
Album Schema:
  id SERIAL PRIMARY KEY,
  artist_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  release_date DATE,
  cover_art_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id)
*/

// Mock database (in-memory for now)
const albums = [];
let currentAlbumId = 1;

async function createAlbum({ artist_id, title, release_date, cover_art_url = '' }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newAlbum = {
        id: currentAlbumId++,
        artist_id,
        title,
        release_date: release_date || new Date().toISOString().split('T')[0], // Default to today if not provided
        cover_art_url,
        created_at: new Date().toISOString(),
      };
      albums.push(newAlbum);
      resolve(newAlbum);
    }, 50);
  });
}

async function findAlbumByTitleAndArtist(title, artist_id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const album = albums.find(
        (a) => a.title.toLowerCase() === title.toLowerCase() && a.artist_id === artist_id
      );
      resolve(album);
    }, 50);
  });
}

async function findAlbumsByArtistId(artistId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const artistAlbums = albums.filter((a) => a.artist_id === artistId);
      resolve(artistAlbums);
    }, 50);
  });
}

async function findAlbumById(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const album = albums.find((a) => a.id === id);
            resolve(album);
        }, 50);
    });
}

module.exports = {
  createAlbum,
  findAlbumsByArtistId,
  findAlbumByTitleAndArtist,
  findAlbumById,
  searchAlbumsByTitle,
};

async function searchAlbumsByTitle(query) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        resolve([]);
        return;
      }
      const lowerCaseQuery = query.toLowerCase();
      const results = albums.filter(album =>
        album.title.toLowerCase().includes(lowerCaseQuery)
      );
      resolve(results);
    }, 50);
  });
}
