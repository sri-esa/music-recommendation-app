const router = require('express').Router();
const User = require('../models/User');

// Search tracks and artists
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // TODO: Implement actual search logic with database
    // For now, return mock search results
    const mockResults = generateMockSearchResults(q);

    res.json({
      results: mockResults,
      query: q
    });
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