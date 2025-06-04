const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Routes
const authRoutes = require('./routes/auth.routes');
const themeRoutes = require('./routes/theme.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const searchRoutes = require('./routes/search.routes');

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

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musicify')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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
app.use('/api/recommend', authenticateToken, recommendationRoutes);
app.use('/api/search', authenticateToken, searchRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 