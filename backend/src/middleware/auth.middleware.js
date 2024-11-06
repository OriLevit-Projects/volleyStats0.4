const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header');
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('No token found');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Token received:', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('User not found:', decoded.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = authMiddleware; 