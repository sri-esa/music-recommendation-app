// harmonia-api/models/User.js

// This is a conceptual schema.
// Actual database schema would be defined and managed by an ORM or database migration tools.
/*
User Schema:
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  artist_id INTEGER NULL, -- Foreign key to Artist table
  FOREIGN KEY (artist_id) REFERENCES artists(id)
*/

// Mock database (in-memory for now)
const users = [];
let currentId = 1;

// Mock "UserFavorites" table
// In a real DB, this would be a separate table with (user_id, track_id) as composite PK.
if (!global.userFavorites) {
  global.userFavorites = [];
}


async function createUser({ username, email, password_hash }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = {
        id: currentId++,
        username,
        email,
        password_hash,
        artist_id: null, // Initialize artist_id as null
        created_at: new Date().toISOString(),
      };
      users.push(newUser);
      // Return a copy of the user object without the password hash
      const { password_hash: _, ...userWithoutPassword } = newUser;
      resolve(userWithoutPassword);
    }, 50); // Simulate async operation
  });
}

async function findUserByEmail(email) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find((u) => u.email === email);
      resolve(user);
    }, 50);
  });
}

async function findUserByUsername(username) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find((u) => u.username === username);
      resolve(user);
    }, 50);
  });
}

async function findUserById(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find((u) => u.id === id);
      // Return a copy of the user object without the password hash if found
      if (user) {
        const { password_hash: _, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } else {
        resolve(null);
      }
    }, 50);
  });
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  updateUserArtistStatus,
  addTrackToFavorites,
  removeTrackFromFavorites,
  getFavoriteTracks,
};

// Function to link a user to an artist profile
async function updateUserArtistStatus(userId, artistId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) {
        return reject(new Error('User not found'));
      }
      users[userIndex].artist_id = artistId;
      // Return a copy of the user object without the password hash
      const { password_hash: _, ...userWithoutPassword } = users[userIndex];
      resolve(userWithoutPassword);
    }, 50);
  });
}

// --- Favorite Tracks Management ---

async function addTrackToFavorites(userId, trackId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Basic validation (in real app, check if user and track exist)
      if (!userId || !trackId) {
        return reject(new Error('User ID and Track ID are required.'));
      }
      const existingFavorite = global.userFavorites.find(
        (fav) => fav.user_id === userId && fav.track_id === trackId
      );
      if (existingFavorite) {
        // Already a favorite, resolve successfully or with a specific message
        return resolve({ ...existingFavorite, alreadyExisted: true });
      }
      const newFavorite = {
        user_id: userId,
        track_id: trackId,
        created_at: new Date().toISOString(),
      };
      global.userFavorites.push(newFavorite);
      resolve(newFavorite);
    }, 50);
  });
}

async function removeTrackFromFavorites(userId, trackId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!userId || !trackId) {
        return reject(new Error('User ID and Track ID are required.'));
      }
      const initialLength = global.userFavorites.length;
      global.userFavorites = global.userFavorites.filter(
        (fav) => !(fav.user_id === userId && fav.track_id === trackId)
      );
      if (global.userFavorites.length === initialLength) {
        // If nothing was removed, it means the favorite didn't exist
        return reject(new Error('Favorite not found.'));
      }
      resolve({ success: true, message: 'Track removed from favorites.' });
    }, 50);
  });
}

async function getFavoriteTracks(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const favorites = global.userFavorites
        .filter((fav) => fav.user_id === userId)
        .map(fav => fav.track_id); // Return only track_ids for simplicity
      // In a real app, you'd likely join with the Tracks table to get full track details.
      // For this mock, we might need to import Track model and fetch details if required by routes.
      resolve(favorites);
    }, 50);
  });
}
