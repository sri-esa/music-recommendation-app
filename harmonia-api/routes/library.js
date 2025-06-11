// harmonia-api/routes/library.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const Track = require('../models/Track'); // Required to check if a track exists

const router = express.Router();

// Helper to check if track exists (using the mock Track model)
async function trackExists(trackId) {
  const track = await Track.findTrackById(trackId);
  return !!track;
}

// === Favorites Routes ===

// POST /api/library/favorites/:trackId
router.post(
  '/favorites/:trackId',
  protect,
  [param('trackId').isInt({ gt: 0 }).withMessage('Track ID must be a positive integer.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const trackId = parseInt(req.params.trackId, 10);

    try {
      if (!(await trackExists(trackId))) {
        return res.status(404).json({ errors: [{ msg: 'Track not found.' }] });
      }

      const favorite = await User.addTrackToFavorites(userId, trackId);
      if (favorite.alreadyExisted) {
        return res.status(200).json({ message: 'Track is already in favorites.', favorite });
      }
      res.status(201).json({ message: 'Track added to favorites.', favorite });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// DELETE /api/library/favorites/:trackId
router.delete(
  '/favorites/:trackId',
  protect,
  [param('trackId').isInt({ gt: 0 }).withMessage('Track ID must be a positive integer.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const trackId = parseInt(req.params.trackId, 10);

    try {
      // Optional: Check if track exists, though User.removeTrackFromFavorites handles non-existent favorites.
      // if (!(await trackExists(trackId))) {
      //   return res.status(404).json({ errors: [{ msg: 'Track not found, cannot remove from favorites.' }] });
      // }
      await User.removeTrackFromFavorites(userId, trackId);
      res.status(200).json({ message: 'Track removed from favorites.' });
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Favorite not found.') {
        return res.status(404).json({ errors: [{ msg: err.message }] });
      }
      res.status(500).send('Server error');
    }
  }
);

// GET /api/library/favorites
router.get('/favorites', protect, async (req, res) => {
  const userId = req.user.id;
  try {
    const favoriteTrackIds = await User.getFavoriteTracks(userId);
    // In a real app, you'd fetch full track details for these IDs
    const favoriteTracksDetails = [];
    for (const id of favoriteTrackIds) {
        const trackDetail = await Track.findTrackById(id);
        if(trackDetail) favoriteTracksDetails.push(trackDetail);
    }
    res.status(200).json(favoriteTracksDetails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// === Playlists Routes ===

// POST /api/library/playlists
router.post(
  '/playlists',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Playlist name is required.'),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { name, description } = req.body;

    try {
      const playlist = await Playlist.createPlaylist({ user_id: userId, name, description });
      res.status(201).json(playlist);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// GET /api/library/playlists
router.get('/playlists', protect, async (req, res) => {
  const userId = req.user.id;
  try {
    const playlists = await Playlist.getUserPlaylists(userId);
    res.status(200).json(playlists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/library/playlists/:playlistId
router.get(
  '/playlists/:playlistId',
  protect,
  [param('playlistId').isInt({ gt: 0 }).withMessage('Playlist ID must be a positive integer.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const playlistId = parseInt(req.params.playlistId, 10);
    const userId = req.user.id;

    try {
      const playlist = await Playlist.getPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).json({ errors: [{ msg: 'Playlist not found.' }] });
      }
      // Authorization: Ensure the playlist belongs to the user
      if (playlist.user_id !== userId) {
        return res.status(403).json({ errors: [{ msg: 'User not authorized to access this playlist.'}]});
      }

      const tracksData = await Playlist.getTracksInPlaylist(playlistId);
      // Fetch full track details
      const tracksWithDetails = [];
      for (const pt of tracksData) {
          const trackDetail = await Track.findTrackById(pt.track_id);
          if (trackDetail) {
              tracksWithDetails.push({ ...trackDetail, sequence_number: pt.sequence_number, added_at: pt.added_at });
          }
      }
      res.status(200).json({ ...playlist, tracks: tracksWithDetails });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// PUT /api/library/playlists/:playlistId
router.put(
  '/playlists/:playlistId',
  protect,
  [
    param('playlistId').isInt({ gt: 0 }).withMessage('Playlist ID must be a positive integer.'),
    body('name').optional().trim().notEmpty().withMessage('Playlist name cannot be empty.'),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const playlistId = parseInt(req.params.playlistId, 10);
    const userId = req.user.id;
    const { name, description } = req.body;

    if (name === undefined && description === undefined) {
        return res.status(400).json({ errors: [{ msg: 'No update fields provided (name or description).'}] });
    }

    try {
      let playlist = await Playlist.getPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).json({ errors: [{ msg: 'Playlist not found.' }] });
      }
      if (playlist.user_id !== userId) {
        return res.status(403).json({ errors: [{ msg: 'User not authorized to update this playlist.'}]});
      }

      playlist = await Playlist.updatePlaylistDetails(playlistId, { name, description });
      res.status(200).json(playlist);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// DELETE /api/library/playlists/:playlistId
router.delete(
  '/playlists/:playlistId',
  protect,
  [param('playlistId').isInt({ gt: 0 }).withMessage('Playlist ID must be a positive integer.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const playlistId = parseInt(req.params.playlistId, 10);
    const userId = req.user.id;

    try {
      const playlist = await Playlist.getPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).json({ errors: [{ msg: 'Playlist not found.' }] });
      }
      if (playlist.user_id !== userId) {
         return res.status(403).json({ errors: [{ msg: 'User not authorized to delete this playlist.'}]});
      }

      await Playlist.deletePlaylist(playlistId);
      res.status(200).json({ message: 'Playlist deleted successfully.' });
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Playlist not found.') { // Should be caught by pre-check
        return res.status(404).json({ errors: [{ msg: err.message }] });
      }
      res.status(500).send('Server error');
    }
  }
);

// === Playlist Tracks Management Routes ===

// POST /api/library/playlists/:playlistId/tracks
router.post(
  '/playlists/:playlistId/tracks',
  protect,
  [
    param('playlistId').isInt({ gt: 0 }).withMessage('Playlist ID must be a positive integer.'),
    body('trackId').isInt({ gt: 0 }).withMessage('Track ID must be a positive integer.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const playlistId = parseInt(req.params.playlistId, 10);
    const { trackId } = req.body;
    const userId = req.user.id;

    try {
      const playlist = await Playlist.getPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).json({ errors: [{ msg: 'Playlist not found.' }] });
      }
      if (playlist.user_id !== userId) {
         return res.status(403).json({ errors: [{ msg: 'User not authorized to modify this playlist.'}]});
      }
      if (!(await trackExists(trackId))) {
        return res.status(404).json({ errors: [{ msg: 'Track not found.' }] });
      }

      const playlistTrack = await Playlist.addTrackToPlaylist(playlistId, trackId);
      res.status(201).json({ message: 'Track added to playlist.', playlistTrack });
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Track already in this playlist.' || err.message === 'Playlist not found.' || err.message === 'Track not found.') {
        return res.status(400).json({ errors: [{ msg: err.message }] });
      }
      res.status(500).send('Server error');
    }
  }
);

// DELETE /api/library/playlists/:playlistId/tracks/:trackId
router.delete(
  '/playlists/:playlistId/tracks/:trackId',
  protect,
  [
    param('playlistId').isInt({ gt: 0 }).withMessage('Playlist ID must be a positive integer.'),
    param('trackId').isInt({ gt: 0 }).withMessage('Track ID must be a positive integer.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const playlistId = parseInt(req.params.playlistId, 10);
    const trackId = parseInt(req.params.trackId, 10);
    const userId = req.user.id;

    try {
      const playlist = await Playlist.getPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).json({ errors: [{ msg: 'Playlist not found.' }] });
      }
      if (playlist.user_id !== userId) {
         return res.status(403).json({ errors: [{ msg: 'User not authorized to modify this playlist.'}]});
      }
      // No need to check if track exists here, removeTrackFromPlaylist handles it.

      await Playlist.removeTrackFromPlaylist(playlistId, trackId);
      res.status(200).json({ message: 'Track removed from playlist.' });
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Track not found in this playlist.') {
        return res.status(404).json({ errors: [{ msg: err.message }] });
      }
      res.status(500).send('Server error');
    }
  }
);

// (Optional Stretch) PUT /api/library/playlists/:playlistId/tracks/:trackId
router.put(
  '/playlists/:playlistId/tracks/:trackId',
  protect,
  [
    param('playlistId').isInt({ gt: 0 }).withMessage('Playlist ID must be a positive integer.'),
    param('trackId').isInt({ gt: 0 }).withMessage('Track ID must be a positive integer.'),
    body('sequenceNumber').isInt({ gt: 0 }).withMessage('Sequence number must be a positive integer.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const playlistId = parseInt(req.params.playlistId, 10);
    const trackId = parseInt(req.params.trackId, 10);
    const { sequenceNumber } = req.body;
    const userId = req.user.id;

    try {
      const playlist = await Playlist.getPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).json({ errors: [{ msg: 'Playlist not found.' }] });
      }
      if (playlist.user_id !== userId) {
        return res.status(403).json({ errors: [{ msg: 'User not authorized to modify this playlist.'}]});
      }

      const updatedTrackInPlaylist = await Playlist.updateTrackSequenceInPlaylist(playlistId, trackId, sequenceNumber);
      res.status(200).json({ message: 'Track sequence updated.', track: updatedTrackInPlaylist });
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Track not found in this playlist.') {
        return res.status(404).json({ errors: [{ msg: err.message }] });
      }
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
