const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const Redis = require('redis');

// Routes
const authRoutes = require('./routes/auth.routes');
const themeRoutes = require('./routes/theme.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const searchRoutes = require('./routes/search.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const interactionRoutes = require('./routes/interaction.routes');

// Middleware
const { authenticateToken } = require('./middleware/auth');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make io accessible to routes
app.set('io', io);

// Redis client for caching (optional)
let redisClient = null;
try {
  redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  redisClient.connect().catch(console.error);
  console.log('Redis connected successfully');
} catch (error) {
  console.log('Redis not available, continuing without caching');
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Set Mongoose strictQuery option
mongoose.set('strictQuery', false);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musicify')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    if (!redisClient) {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    
    try {
      const cachedResponse = await redisClient.get(key);
      
      if (cachedResponse) {
        res.send(JSON.parse(cachedResponse));
        return;
      }
      
      res.originalSend = res.send;
      res.send = async (body) => {
        await redisClient.setEx(key, duration, JSON.stringify(body));
        res.originalSend(body);
      };
      next();
    } catch (error) {
      next();
    }
  };
};

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('themeChange', (data) => {
    // Broadcast theme change to all connected clients except sender
    socket.broadcast.emit('themeUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/theme', authenticateToken, themeRoutes);
app.use('/api/recommend', authenticateToken, cache(300), recommendationRoutes); // Cache for 5 minutes
app.use('/api/search', authenticateToken, searchRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/interaction', authenticateToken, interactionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 