const router = require('express').Router();
const axios = require('axios');
const User = require('../models/User');
const Song = require('../models/Song');
const UserInteraction = require('../models/UserInteraction');

// Mood-based track features mapping
const moodFeatures = {
  chill: {
    tempo: { min: 70, max: 100 },
    energy: { min: 0.2, max: 0.5 },
    valence: { min: 0.3, max: 0.7 }
  },
  energetic: {
    tempo: { min: 120, max: 180 },
    energy: { min: 0.7, max: 1.0 },
    valence: { min: 0.6, max: 1.0 }
  },
  sad: {
    tempo: { min: 60, max: 90 },
    energy: { min: 0.1, max: 0.4 },
    valence: { min: 0.0, max: 0.3 }
  },
  romantic: {
    tempo: { min: 80, max: 110 },
    energy: { min: 0.3, max: 0.6 },
    valence: { min: 0.5, max: 0.8 }
  },
  dark: {
    tempo: { min: 90, max: 130 },
    energy: { min: 0.4, max: 0.7 },
    valence: { min: 0.1, max: 0.4 }
  },
  lofi: {
    tempo: { min: 75, max: 95 },
    energy: { min: 0.2, max: 0.4 },
    valence: { min: 0.3, max: 0.6 }
  }
};

// Get personalized recommendations
router.post('/', async (req, res) => {
  try {
    const { mood } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's play history and preferences
    const playHistory = await UserInteraction.find({
      user: user._id,
      action: 'play'
    }).sort('-timestamp').limit(50);

    const likedSongs = await UserInteraction.find({
      user: user._id,
      action: 'like'
    });

    // Call ML service for recommendations
    const response = await axios.post(process.env.ML_SERVICE_URL + '/ml/recommend', {
      userId: user._id,
      mood: mood || user.preferences.mood,
      genres: user.preferences.genres,
      playHistory: playHistory.map(h => h.song),
      likedSongs: likedSongs.map(l => l.song)
    });

    // Get full song details
    const recommendations = await Song.find({
      _id: { $in: response.data.recommendations }
    });

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get trending songs
router.get('/trending', async (req, res) => {
  try {
    const trending = await UserInteraction.aggregate([
      {
        $match: {
          action: 'play',
          timestamp: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      },
      {
        $group: {
          _id: '$song',
          playCount: { $sum: 1 }
        }
      },
      {
        $sort: { playCount: -1 }
      },
      {
        $limit: 20
      }
    ]);

    const songIds = trending.map(t => t._id);
    const songs = await Song.find({ _id: { $in: songIds } });

    // Combine play counts with song details
    const trendingSongs = songs.map(song => ({
      ...song.toObject(),
      playCount: trending.find(t => t._id.equals(song._id)).playCount
    }));

    res.json(trendingSongs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 