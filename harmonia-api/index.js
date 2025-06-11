// harmonia-api/index.js
require('dotenv').config(); // For environment variables

const express = require('express');
const authRoutes = require('./routes/auth');
const musicRoutes = require('./routes/music'); // Import music routes
const libraryRoutes = require('./routes/library'); // Import library routes
const searchRoutes = require('./routes/search'); // Import search routes
// const { protect } = require('./middleware/authMiddleware'); // Example for protected routes

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Harmonia API!');
});

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes); // Mount music routes
app.use('/api/library', libraryRoutes); // Mount library routes
app.use('/api/search', searchRoutes); // Mount search routes

// Example of a protected route (you'd apply `protect` middleware)
// app.get('/api/someprotectedroute', protect, (req, res) => {
//   res.json({ message: "You accessed a protected route!", user: req.user });
// });

// Basic Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Harmonia API listening at http://localhost:${port}`);
});
