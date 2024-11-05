require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'PUT' || req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  if (req.headers.authorization) {
    console.log('Auth header present');
  }
  next();
});

// MongoDB connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    console.log('Database URI:', process.env.MONGODB_URI);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Error handling for MongoDB after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB error after initial connection:', err);
});

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/teams', require('./src/routes/team.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/stats', require('./src/routes/stat.routes'));

// Test endpoint
app.post('/api/test', (req, res) => {
  console.log('Test endpoint hit with body:', req.body);
  res.json({ message: 'Test endpoint working' });
});

// 404 handler
app.use((req, res, next) => {
  console.log(`404 - Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong!' 
    : err.message;
  res.status(err.status || 500).json({ message });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment variables loaded:', {
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV || 'development'
  });
}); 