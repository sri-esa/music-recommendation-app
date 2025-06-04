const router = require('express').Router();
const User = require('../models/User');
const Song = require('../models/Song');
const UserInteraction = require('../models/UserInteraction');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get dashboard overview
router.get('/overview', isAdmin, async (req, res) => {
  try {
    const now = new Date();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalSongs = await Song.countDocuments();
    const totalPlays = await UserInteraction.countDocuments({ action: 'play' });

    // Get new users in last 24h
    const newUsers = await User.countDocuments({
      createdAt: { $gte: dayAgo }
    });

    // Get active users in last 24h
    const activeUsers = await UserInteraction.distinct('user', {
      timestamp: { $gte: dayAgo }
    }).then(users => users.length);

    // Get top songs
    const topSongs = await UserInteraction.getGlobalTopSongs(5);

    // Get user growth over last week
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get most active hours
    const activeHours = await UserInteraction.aggregate([
      {
        $match: {
          timestamp: { $gte: dayAgo }
        }
      },
      {
        $group: {
          _id: {
            $hour: '$timestamp'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalSongs,
        totalPlays,
        newUsers,
        activeUsers
      },
      topSongs,
      userGrowth,
      activeHours
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user statistics
router.get('/users', isAdmin, async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    let timeAgo;

    switch (period) {
      case '24h':
        timeAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    const stats = await UserInteraction.aggregate([
      {
        $match: {
          timestamp: { $gte: timeAgo }
        }
      },
      {
        $group: {
          _id: '$user',
          playCount: {
            $sum: {
              $cond: [{ $eq: ['$action', 'play'] }, 1, 0]
            }
          },
          likeCount: {
            $sum: {
              $cond: [{ $eq: ['$action', 'like'] }, 1, 0]
            }
          },
          skipCount: {
            $sum: {
              $cond: [{ $eq: ['$action', 'skip'] }, 1, 0]
            }
          },
          totalDuration: {
            $sum: '$playDuration'
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          username: '$userDetails.username',
          email: '$userDetails.email',
          playCount: 1,
          likeCount: 1,
          skipCount: 1,
          totalDuration: 1,
          averageSessionDuration: {
            $divide: ['$totalDuration', '$playCount']
          }
        }
      },
      {
        $sort: { playCount: -1 }
      }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get song statistics
router.get('/songs', isAdmin, async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    let timeAgo;

    switch (period) {
      case '24h':
        timeAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    const stats = await UserInteraction.aggregate([
      {
        $match: {
          timestamp: { $gte: timeAgo }
        }
      },
      {
        $group: {
          _id: '$song',
          playCount: {
            $sum: {
              $cond: [{ $eq: ['$action', 'play'] }, 1, 0]
            }
          },
          likeCount: {
            $sum: {
              $cond: [{ $eq: ['$action', 'like'] }, 1, 0]
            }
          },
          skipCount: {
            $sum: {
              $cond: [{ $eq: ['$action', 'skip'] }, 1, 0]
            }
          },
          uniqueListeners: {
            $addToSet: '$user'
          }
        }
      },
      {
        $lookup: {
          from: 'songs',
          localField: '_id',
          foreignField: '_id',
          as: 'songDetails'
        }
      },
      {
        $unwind: '$songDetails'
      },
      {
        $project: {
          title: '$songDetails.title',
          artist: '$songDetails.artist',
          album: '$songDetails.album',
          playCount: 1,
          likeCount: 1,
          skipCount: 1,
          uniqueListeners: { $size: '$uniqueListeners' },
          engagementRate: {
            $divide: ['$likeCount', '$playCount']
          }
        }
      },
      {
        $sort: { playCount: -1 }
      }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 