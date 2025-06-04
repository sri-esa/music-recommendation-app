const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  genre: [{
    type: String,
    trim: true
  }],
  duration: {
    type: Number, // Duration in seconds
    required: true
  },
  releaseYear: {
    type: Number
  },
  audioFeatures: {
    tempo: Number,
    key: Number,
    mode: Number, // 0 for minor, 1 for major
    energy: Number,
    danceability: Number,
    valence: Number,
    instrumentalness: Number,
    acousticness: Number
  },
  mood: {
    type: String,
    enum: ['chill', 'energetic', 'sad', 'romantic', 'dark', 'lofi'],
    required: true
  },
  url: {
    type: String, // S3 or Cloud Storage URL
    required: true
  },
  coverImage: {
    type: String, // URL to album cover
    required: true
  },
  playCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search
songSchema.index({
  title: 'text',
  artist: 'text',
  album: 'text',
  genre: 'text'
});

module.exports = mongoose.model('Song', songSchema); 