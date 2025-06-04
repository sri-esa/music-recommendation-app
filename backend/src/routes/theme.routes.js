const router = require('express').Router();
const User = require('../models/User');

// Theme animation mappings
const themeAnimations = {
  '#00FFFF': 'neon_wave',    // Cyan
  '#FF00FF': 'cyber_grid',   // Magenta
  '#00FF00': 'matrix_rain',  // Green
  '#FF0000': 'plasma_field', // Red
  '#0000FF': 'star_field',   // Blue
  '#FFFF00': 'energy_pulse'  // Yellow
};

// Helper function to find closest animation
const findClosestAnimation = (color) => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Find closest theme color
  let minDistance = Infinity;
  let closestTheme = '#00FFFF'; // Default

  Object.keys(themeAnimations).forEach(themeColor => {
    const themeHex = themeColor.replace('#', '');
    const tr = parseInt(themeHex.substr(0, 2), 16);
    const tg = parseInt(themeHex.substr(2, 2), 16);
    const tb = parseInt(themeHex.substr(4, 2), 16);

    // Calculate color distance using RGB Euclidean distance
    const distance = Math.sqrt(
      Math.pow(r - tr, 2) +
      Math.pow(g - tg, 2) +
      Math.pow(b - tb, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestTheme = themeColor;
    }
  });

  return themeAnimations[closestTheme];
};

// Update user theme
router.post('/', async (req, res) => {
  try {
    const { color } = req.body;
    
    if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
      return res.status(400).json({ message: 'Invalid color format' });
    }

    const animation = findClosestAnimation(color);
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        theme: { color, animation }
      },
      { new: true }
    );

    // Emit theme change event through Socket.IO
    req.app.get('io').emit('themeUpdate', {
      userId: user._id,
      theme: { color, animation }
    });

    res.json({ theme: { color, animation } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user theme
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ theme: user.theme });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 