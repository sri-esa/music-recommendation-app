const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  action: {
    type: String,
    enum: ['play', 'like', 'skip', 'complete'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  playDuration: {
    type: Number, // Duration in seconds
    default: 0
  },
  context: {
    source: {
      type: String,
      enum: ['search', 'recommendation', 'playlist', 'radio'],
      required: true
    },
    mood: String,
    deviceType: String
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
userInteractionSchema.index({ user: 1, song: 1, action: 1 });
userInteractionSchema.index({ timestamp: -1 });

// Static method to get user's top songs
userInteractionSchema.statics.getUserTopSongs = async function(userId, limit = 10) {
  return this.aggregate([
    { $match: { user: userId, action: 'play' } },
    { $group: {
      _id: '$song',
      playCount: { $sum: 1 },
      totalDuration: { $sum: '$playDuration' },
      lastPlayed: { $max: '$timestamp' }
    }},
    { $sort: { playCount: -1, totalDuration: -1 } },
    { $limit: limit },
    { $lookup: {
      from: 'songs',
      localField: '_id',
      foreignField: '_id',
      as: 'songDetails'
    }},
    { $unwind: '$songDetails' }
  ]);
};

// Static method to get global top songs
userInteractionSchema.statics.getGlobalTopSongs = async function(limit = 10) {
  return this.aggregate([
    { $match: { action: 'play' } },
    { $group: {
      _id: '$song',
      playCount: { $sum: 1 },
      uniqueUsers: { $addToSet: '$user' }
    }},
    { $addFields: {
      userCount: { $size: '$uniqueUsers' }
    }},
    { $sort: { playCount: -1, userCount: -1 } },
    { $limit: limit },
    { $lookup: {
      from: 'songs',
      localField: '_id',
      foreignField: '_id',
      as: 'songDetails'
    }},
    { $unwind: '$songDetails' }
  ]);
};

module.exports = mongoose.model('UserInteraction', userInteractionSchema); 