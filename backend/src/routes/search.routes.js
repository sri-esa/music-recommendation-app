const router = require('express').Router();
const User = require('../models/User');
const Song = require('../models/Song');

// Search songs, artists, and genres
router.get('/', async (req, res) => {
  try {
    const { q, type } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let query = {};
    
    // Build search query based on type
    switch (type) {
      case 'artist':
        query = { artist: { $regex: q, $options: 'i' } };
        break;
      case 'genre':
        query = { genre: { $regex: q, $options: 'i' } };
        break;
      case 'mood':
        query = { mood: { $regex: q, $options: 'i' } };
        break;
      default:
        // Search across all fields
        query = {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { artist: { $regex: q, $options: 'i' } },
            { genre: { $regex: q, $options: 'i' } },
            { mood: { $regex: q, $options: 'i' } }
          ]
        };
    }

    const songs = await Song.find(query)
      .limit(20)
      .select('title artist album genre mood audioFeatures coverImage');

    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get detailed song information
router.get('/song/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json(song);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user's color preference from search results
router.post('/set-color', async (req, res) => {
  try {
    const { color } = req.body;
    
    if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
      return res.status(400).json({ message: 'Invalid color format' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'theme.color': color
      },
      { new: true }
    );

    // Emit color change event through Socket.IO
    req.app.get('io').emit('colorUpdate', {
      userId: user._id,
      color: color
    });

    res.json({ color: user.theme.color });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to generate mock search results
function generateMockSearchResults(query) {
  const mockData = [
    {
      id: '1',
      type: 'track',
      title: 'Neon Dreams',
      artist: 'CyberWave',
      album: 'Digital Horizons',
      duration: '3:45',
      color: '#00FFFF'
    },
    {
      id: '2',
      type: 'artist',
      name: 'SynthMaster',
      genres: ['synthwave', 'electronic'],
      color: '#FF00FF'
    },
    {
      id: '3',
      type: 'track',
      title: 'Dark Circuit',
      artist: 'ByteRunner',
      album: 'Cyber Night',
      duration: '4:20',
      color: '#FF0000'
    }
  ];

  // Filter results based on search query
  return mockData.filter(item => {
    const searchStr = query.toLowerCase();
    if (item.type === 'track') {
      return item.title.toLowerCase().includes(searchStr) ||
             item.artist.toLowerCase().includes(searchStr) ||
             item.album.toLowerCase().includes(searchStr);
    } else {
      return item.name.toLowerCase().includes(searchStr) ||
             item.genres.some(genre => genre.toLowerCase().includes(searchStr));
    }
  });
}

module.exports = router; 