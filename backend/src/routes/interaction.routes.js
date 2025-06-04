const router = require('express').Router();
const User = require('../models/User');
const Song = require('../models/Song');
const UserInteraction = require('../models/UserInteraction');

// Record song play
router.post('/play', async (req, res) => {
  try {
    const { songId } = req.body;
    const song = await Song.findById(songId);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Record interaction
    const interaction = new UserInteraction({
      user: req.user.id,
      song: songId,
      action: 'play',
      context: {
        source: req.body.source || 'direct',
        mood: req.body.mood,
        deviceType: req.body.deviceType
      }
    });

    await interaction.save();

    // Increment song play count
    song.playCount += 1;
    await song.save();

    res.json({ message: 'Play recorded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like or unlike a song
router.post('/like', async (req, res) => {
  try {
    const { songId } = req.body;
    const user = await User.findById(req.user.id);
    const song = await Song.findById(songId);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const alreadyLiked = user.likedSongs.includes(songId);

    if (alreadyLiked) {
      // Unlike the song
      user.likedSongs = user.likedSongs.filter(id => !id.equals(songId));
      song.likes -= 1;

      // Record unlike interaction
      const interaction = new UserInteraction({
        user: req.user.id,
        song: songId,
        action: 'unlike'
      });
      await interaction.save();
    } else {
      // Like the song
      user.likedSongs.push(songId);
      song.likes += 1;

      // Record like interaction
      const interaction = new UserInteraction({
        user: req.user.id,
        song: songId,
        action: 'like'
      });
      await interaction.save();
    }

    await user.save();
    await song.save();

    res.json({
      liked: !alreadyLiked,
      likes: song.likes
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's play history
router.get('/history', async (req, res) => {
  try {
    const history = await UserInteraction.find({
      user: req.user.id,
      action: 'play'
    })
    .sort('-timestamp')
    .limit(50)
    .populate('song', 'title artist album coverImage');

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's favorite songs
router.get('/favorites', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('likedSongs', 'title artist album coverImage');

    res.json(user.likedSongs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 