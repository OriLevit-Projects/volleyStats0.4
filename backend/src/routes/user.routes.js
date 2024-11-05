const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const authMiddleware = require('../middleware/auth.middleware');

// Add authentication middleware
router.use(authMiddleware);

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

// Add this new route for updating user profile
router.put('/:userId', async (req, res) => {
  try {
    console.log('Update route - IDs:', {
      paramId: req.params.userId,
      tokenUserId: req.userId,
      userObjectId: req.user._id.toString()
    });

    // Compare using the string version of the ID
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to update this profile',
        debug: {
          requestedId: req.params.userId,
          authenticatedId: req.user._id.toString()
        }
      });
    }

    const allowedUpdates = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      position: req.body.position,
      jerseyNumber: req.body.jerseyNumber,
      team: req.body.team || req.user.team
    };

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      allowedUpdates,
      { 
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User updated successfully:', user);
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      message: 'Error updating user',
      error: error.message
    });
  }
});

module.exports = router;