// harmonia-api/models/Artist.js

/*
Artist Schema:
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL, -- Link to User table
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
*/

// Mock database (in-memory for now)
const artists = [];
let currentArtistId = 1;

async function createArtist({ user_id, name, bio = '' }) {
  return new Promise((resolve, reject) => {
    // Check if an artist profile already exists for this user_id
    const existingArtist = artists.find(artist => artist.user_id === user_id);
    if (existingArtist) {
      return reject(new Error('Artist profile already exists for this user.'));
    }

    setTimeout(() => {
      const newArtist = {
        id: currentArtistId++,
        user_id,
        name,
        bio,
        created_at: new Date().toISOString(),
      };
      artists.push(newArtist);
      resolve(newArtist);
    }, 50);
  });
}

async function findArtistByUserId(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const artist = artists.find((a) => a.user_id === userId);
      resolve(artist);
    }, 50);
  });
}

async function findArtistById(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const artist = artists.find((a) => a.id === id);
      resolve(artist);
    }, 50);
  });
}

async function findArtistByName(name) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Case-insensitive search for simplicity in mock
      const artist = artists.find((a) => a.name.toLowerCase() === name.toLowerCase());
      resolve(artist);
    }, 50);
  });
}

module.exports = {
  createArtist,
  findArtistByUserId,
  findArtistById,
  findArtistByName,
  searchArtistsByName,
};

async function searchArtistsByName(query) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        resolve([]);
        return;
      }
      const lowerCaseQuery = query.toLowerCase();
      const results = artists.filter(artist =>
        artist.name.toLowerCase().includes(lowerCaseQuery)
      );
      resolve(results);
    }, 50);
  });
}
