// harmonia-api/routes/search.js
const express = require('express');
const { query, validationResult } = require('express-validator');
const Track = require('../models/Track');
const Artist = require('../models/Artist');
const Album = require('../models/Album');

const router = express.Router();

const searchQueryValidator = [
  query('q').notEmpty().withMessage('Search query "q" is required.').trim().escape(),
];

// GET /api/search/tracks?q=<query>
router.get('/tracks', searchQueryValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { q } = req.query;
  try {
    const tracks = await Track.searchTracksByTitle(q);
    res.status(200).json(tracks);
  } catch (err) {
    console.error('Track search error:', err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/search/artists?q=<query>
router.get('/artists', searchQueryValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { q } = req.query;
  try {
    const artists = await Artist.searchArtistsByName(q);
    res.status(200).json(artists);
  } catch (err) {
    console.error('Artist search error:', err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/search/albums?q=<query> (Optional)
router.get('/albums', searchQueryValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { q } = req.query;
  try {
    const albums = await Album.searchAlbumsByTitle(q);
    res.status(200).json(albums);
  } catch (err) {
    console.error('Album search error:', err.message);
    res.status(500).send('Server error');
  }
});

// (Future possibility: a general search endpoint /api/search/all?q=<query>)
// This could combine results from tracks, artists, and albums.
// router.get('/all', searchQueryValidator, async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   const { q } = req.query;
//   try {
//     const [tracks, artists, albums] = await Promise.all([
//       Track.searchTracksByTitle(q),
//       Artist.searchArtistsByName(q),
//       Album.searchAlbumsByTitle(q),
//     ]);
//     res.status(200).json({ tracks, artists, albums });
//   } catch (err) {
//     console.error('General search error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

module.exports = router;
