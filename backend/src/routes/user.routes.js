const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const authMiddleware = require('../middleware/auth.middleware');
const Team = require('../models/team.model');

// Add authentication middleware
router.use(authMiddleware);

// Add this middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Add this route at the top of your routes (before the team route)
router.get('/', async (req, res) => {
  try {
    console.log('GET /users request received');
    const users = await User.find({}, '-password');
    console.log('Users found in database:', users);
    res.json(users);
  } catch (error) {
    console.error('Error in GET /users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

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
    const userToUpdate = await User.findById(req.params.userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If the user is an admin, they can update anything
    if (req.user.isAdmin) {
      const updates = {
        firstName: req.body.firstName || userToUpdate.firstName,
        lastName: req.body.lastName || userToUpdate.lastName,
        email: req.body.email || userToUpdate.email,
        position: req.body.position,
        jerseyNumber: req.body.jerseyNumber,
        team: req.body.team,
        isAdmin: userToUpdate.isAdmin // Preserve admin status
      };

      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      // Handle team changes if needed
      if (updates.team !== userToUpdate.team) {
        // Remove from old team
        if (userToUpdate.team) {
          await Team.findOneAndUpdate(
            { name: userToUpdate.team },
            { $pull: { players: userToUpdate._id } }
          );
        }
        // Add to new team
        if (updates.team) {
          await Team.findOneAndUpdate(
            { name: updates.team },
            { $addToSet: { players: userToUpdate._id } }
          );
        }
      }

      return res.json(updatedUser);
    }

    // If not admin, check if user is updating their own profile
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Regular user updating their own profile
    const updates = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      position: req.body.position,
      jerseyNumber: req.body.jerseyNumber,
      team: req.body.team
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      message: 'Error updating user',
      error: error.message 
    });
  }
});

module.exports = router;