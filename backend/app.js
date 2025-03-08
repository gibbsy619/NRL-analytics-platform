// app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();  // Import the dotenv library
const matchesRoutes = require('./routes/matches');
const statsRoutes = require('./routes/stats');

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint to check if API is working
app.get('/', (req, res) => {
  res.send('API is working');
});

// Use routes for different endpoints
app.use('/', matchesRoutes);
app.use('/', statsRoutes);

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
