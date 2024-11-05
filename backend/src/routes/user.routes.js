const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// Get team members by team name (this needs to be first)
router.get('/team/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params;
    console.log('Searching for team members in team:', teamName);
    
    const teammates = await User.find(
      { team: teamName },
      'firstName lastName email position jerseyNumber'
    );
    
    console.log('Found teammates:', teammates);
    res.json(teammates);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Error fetching team members' });
  }
});

// Get user by ID (this needs to be second)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    console.log('Database user data:', user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

module.exports = router;