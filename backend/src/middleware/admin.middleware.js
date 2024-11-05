const User = require('../models/user.model');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.userData.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
}; 