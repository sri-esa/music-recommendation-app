const express = require('express');
const Song = require('../models/Song');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Search songs
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const songs = await Song.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get song details
router.get('/song/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending songs
router.get('/trending', async (req, res) => {
  try {
    const songs = await Song.find()
      .sort({ plays: -1, likes: -1 })
      .limit(20);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recommendations
router.get('/recommendations', protect, async (req, res) => {
  try {
    // Simple recommendation based on user's most played genres
    const userHistory = await req.user.populate('history.song');
    const genres = userHistory.history
      .map(h => h.song.genre)
      .reduce((acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {});
    
    const topGenres = Object.entries(genres)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    const recommendations = await Song.find({
      genre: { $in: topGenres }
    })
      .sort({ plays: -1 })
      .limit(20);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Track song play
router.post('/play/:id', protect, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    song.plays += 1;
    await song.save();

    // Add to user's history
    req.user.history.unshift({ song: song._id });
    await req.user.save();

    res.json({ message: 'Play tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike song
router.post('/like/:id', protect, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const isLiked = req.user.favorites.includes(song._id);
    if (isLiked) {
      // Unlike
      req.user.favorites = req.user.favorites.filter(id => !id.equals(song._id));
      song.likes -= 1;
    } else {
      // Like
      req.user.favorites.push(song._id);
      song.likes += 1;
    }

    await Promise.all([req.user.save(), song.save()]);
    res.json({ message: isLiked ? 'Song unliked' : 'Song liked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 