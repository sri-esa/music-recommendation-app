const router = require('express').Router();
const User = require('../models/User');

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

// Get recommendations based on user mood and preferences
router.post('/', async (req, res) => {
  try {
    const { mood, themeColor } = req.body;
    const userId = req.user.id;

    // Get user preferences
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get mood features
    const features = moodFeatures[mood || user.preferences.mood];
    if (!features) {
      return res.status(400).json({ message: 'Invalid mood' });
    }

    // TODO: Implement actual recommendation logic using ML model
    // For now, return mock recommendations based on mood
    const mockRecommendations = generateMockRecommendations(features, user.preferences);

    res.json({
      recommendations: mockRecommendations,
      mood: mood || user.preferences.mood,
      features
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to generate mock recommendations
function generateMockRecommendations(features, preferences) {
  // This is a placeholder function that would be replaced with actual ML-based recommendations
  const mockTracks = [
    {
      id: '1',
      title: 'Neon Dreams',
      artist: 'CyberWave',
      mood: 'chill',
      features: {
        tempo: 85,
        energy: 0.4,
        valence: 0.6
      }
    },
    {
      id: '2',
      title: 'Digital Sunset',
      artist: 'SynthMaster',
      mood: 'romantic',
      features: {
        tempo: 95,
        energy: 0.5,
        valence: 0.7
      }
    },
    {
      id: '3',
      title: 'Dark Circuit',
      artist: 'ByteRunner',
      mood: 'dark',
      features: {
        tempo: 110,
        energy: 0.6,
        valence: 0.3
      }
    }
  ];

  // Filter tracks based on mood features
  return mockTracks.filter(track => {
    return track.features.tempo >= features.tempo.min &&
           track.features.tempo <= features.tempo.max &&
           track.features.energy >= features.energy.min &&
           track.features.energy <= features.energy.max &&
           track.features.valence >= features.valence.min &&
           track.features.valence <= features.valence.max;
  });
}

module.exports = router; 