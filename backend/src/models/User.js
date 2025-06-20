const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  history: [{
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song'
    },
    playedAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    genres: [{
      type: String,
      trim: true
    }],
    mood: {
      type: String,
      enum: ['chill', 'energetic', 'sad', 'romantic', 'dark', 'lofi'],
      default: 'chill'
    },
    favoriteArtists: [{
      type: String,
      trim: true
    }]
  },
  theme: {
    color: {
      type: String,
      default: '#00FFFF' // Default cyan color
    },
    animation: {
      type: String,
      default: 'neon_wave'
    }
  },
  themeColor: {
    type: String,
    default: '#000000'
  },
  playHistory: [{
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  likedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for email and username searches
userSchema.index({ email: 1, username: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User; 