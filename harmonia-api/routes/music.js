// harmonia-api/routes/music.js
const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const storageService = require('../services/storage');
const User = require('../models/User');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Track = require('../models/Track');

const router = express.Router();

// Configure multer for memory storage (we then pass buffer to conceptual cloud storage)
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/music/artists/become (Stretch Goal)
router.post(
  '/artists/become',
  protect, // Requires authentication
  [
    body('name', 'Artist name is required').notEmpty().trim().escape(),
    body('bio', 'Bio can be provided').optional().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, bio } = req.body;
    const userId = req.user.id;

    try {
      let artist = await Artist.findArtistByUserId(userId);
      if (artist) {
        return res.status(400).json({ errors: [{ msg: 'User is already an artist' }] });
      }

      // Check if artist name is taken
      let existingArtistByName = await Artist.findArtistByName(name);
      if (existingArtistByName) {
        return res.status(400).json({ errors: [{msg: 'This artist name is already taken. Please choose another.'}] });
      }

      artist = await Artist.createArtist({ user_id: userId, name, bio });
      await User.updateUserArtistStatus(userId, artist.id);

      // Re-fetch user to include artist_id in the response if needed, or just send artist profile
      const updatedUser = await User.findUserById(userId); // User.findUserById already excludes password

      res.status(201).json({
        message: 'Successfully registered as an artist.',
        artist,
        user: updatedUser,
      });
    } catch (err) {
      console.error('Artist creation error:', err.message);
      if (err.message.includes('already exists for this user')) {
        return res.status(400).json({ errors: [{ msg: err.message }] });
      }
      res.status(500).send('Server error');
    }
  }
);

// POST /api/music/upload
router.post(
  '/upload',
  protect, // Requires authentication
  upload.single('trackFile'), // Middleware to handle single file upload with field name 'trackFile'
  [
    body('title', 'Track title is required').notEmpty().trim().escape(),
    body('albumTitle', 'Album title is required').notEmpty().trim().escape(), // For simplicity, album is required
    body('genre', 'Genre is optional').optional().trim().escape(),
    body('releaseDate', 'Release date is optional').optional().isISO8601().toDate(),
    // artist_name will be derived from the user's artist profile
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ errors: [{ msg: 'Track file is required' }] });
    }

    const { title, albumTitle, genre, releaseDate } = req.body;
    const userId = req.user.id;

    try {
      // 1. Check if user is an artist
      const artist = await Artist.findArtistByUserId(userId);
      if (!artist) {
        return res.status(403).json({
          errors: [{ msg: 'User is not an artist. Please register as an artist first via /api/music/artists/become' }],
        });
      }

      // 2. Simulate file upload to cloud storage
      const fileUrl = await storageService.uploadFile(req.file, `tracks/${artist.id}`);

      // 3. Find or create Album
      let album = await Album.findAlbumByTitleAndArtist(albumTitle, artist.id);
      if (!album) {
        album = await Album.createAlbum({
          artist_id: artist.id,
          title: albumTitle,
          // cover_art_url: TODO - could be another upload or default
          release_date: releaseDate || new Date().toISOString().split('T')[0]
        });
      }

      // 4. Create Track record
      // Duration would ideally be extracted from the audio file metadata on the server
      // For now, it's a placeholder or could be an optional field from client
      const trackData = {
        album_id: album.id,
        artist_id: artist.id,
        title,
        file_url: fileUrl,
        genre: genre || 'Undefined',
        duration: req.body.duration || 0, // e.g. client sends duration in seconds
        release_date: releaseDate || album.release_date,
      };

      const newTrack = await Track.createTrack(trackData);

      res.status(201).json({
        message: 'Track uploaded successfully!',
        track: newTrack,
        album: album,
        artist: artist,
      });
    } catch (err) {
      console.error('Upload error:', err.message);
      res.status(500).send('Server error during upload');
    }
  }
);

// GET /api/music/stream/:trackId
router.get('/stream/:trackId', async (req, res) => {
  try {
    const trackId = parseInt(req.params.trackId, 10);
    if (isNaN(trackId)) {
      return res.status(400).json({ errors: [{ msg: 'Invalid track ID format' }] });
    }

    const track = await Track.findTrackById(trackId);

    if (!track) {
      return res.status(404).json({ errors: [{ msg: 'Track not found' }] });
    }

    // Simulate streaming for mock URLs
    // In a real scenario, we would check if the file_url is a local path or a cloud URL
    // and then pipe a readable stream to the response.
    if (track.file_url && (track.file_url.startsWith('https://s3.') || track.file_url.includes('mock-bucket'))) {
      // For this subtask, we are not actually streaming bytes.
      // We return a JSON response indicating the track is ready for streaming.
      res.status(200).json({
        message: `Track '${track.title}' is ready for streaming.`,
        track_id: track.id,
        title: track.title,
        artist_id: track.artist_id, // Potentially fetch artist name here
        album_id: track.album_id,   // Potentially fetch album title here
        mock_file_url: track.file_url,
        genre: track.genre,
        // In a real streaming scenario, you'd set Content-Type, Content-Length,
        // and handle byte ranges if the client requests them.
        // e.g., res.setHeader('Content-Type', 'audio/mpeg');
      });
    } else {
      // If file_url is missing or not a mock URL we can handle
      console.warn(`Track ${trackId} has an invalid or missing file_url: ${track.file_url}`);
      return res.status(500).json({ errors: [{ msg: 'Track file URL is invalid or missing, cannot simulate stream.' }] });
    }
  } catch (err) {
    console.error('Streaming error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
