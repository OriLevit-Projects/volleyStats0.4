const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

module.exports = async (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decodedToken);

    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Store both the MongoDB _id and the string version
    req.user = user;
    req.userId = decodedToken.userId;
    
    console.log('Auth middleware - IDs:', {
      tokenUserId: decodedToken.userId,
      userObjectId: user._id.toString()
    });

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}; 