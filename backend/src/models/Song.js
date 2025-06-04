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
  duration: {
    type: Number,
    required: true
  },
  genre: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  plays: {
    type: Number,
    default: 0
  },
  releaseDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search functionality
songSchema.index({ title: 'text', artist: 'text', album: 'text' });

const Song = mongoose.model('Song', songSchema);

module.exports = Song; 