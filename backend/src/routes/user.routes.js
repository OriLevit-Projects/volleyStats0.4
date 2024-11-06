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

// THIS NEEDS TO BE FIRST - before any parameterized routes
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Then your other routes in this order:
router.get('/', async (req, res) => {
  try {
    console.log('GET /users request received');
    console.log('Current user (from auth):', req.user);
    
    // Check if user is admin
    if (!req.user.isAdmin) {
      console.log('Non-admin user attempted to access user list');
      return res.status(403).json({ message: 'Admin access required' });
    }

    const users = await User.find({}, '-password')
      .populate('team', 'name');
    
    console.log('Users found:', users.length);
    console.log('Users data:', JSON.stringify(users, null, 2));
    
    res.json(users);
  } catch (error) {
    console.error('Error in GET /users:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

router.get('/team/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params;
    console.log('Searching for team members in team:', teamName);
    
    const team = await Team.findOne({ name: teamName });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const teammates = await User.find(
      { team: team._id },
      'firstName lastName email position jerseyNumber'
    );
    
    console.log('Found teammates:', teammates);
    res.json(teammates);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Error fetching team members' });
  }
});

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
        isAdmin: userToUpdate.isAdmin // Preserve admin status
      };

      // Handle team assignment
      if (req.body.team) {
        const team = await Team.findOne({ name: req.body.team });
        if (!team) {
          return res.status(404).json({ 
            message: `Team "${req.body.team}" not found` 
          });
        }
        updates.team = team._id;
        
        // Remove from old team if exists
        if (userToUpdate.team) {
          await Team.findByIdAndUpdate(
            userToUpdate.team,
            { $pull: { players: userToUpdate._id } }
          );
        }
        
        // Add to new team
        await Team.findByIdAndUpdate(
          team._id,
          { $addToSet: { players: userToUpdate._id } }
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        updates,
        { new: true, runValidators: true }
      )
      .select('-password')
      .populate('team', 'name');

      return res.json(updatedUser);
    }

    // If not admin, check if user is updating their own profile
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to update this profile' 
      });
    }

    // Regular user updating their own profile
    const updates = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      position: req.body.position,
      jerseyNumber: req.body.jerseyNumber
    };

    // Handle team assignment for regular users
    if (req.body.team) {
      const team = await Team.findOne({ name: req.body.team });
      if (!team) {
        return res.status(404).json({ 
          message: `Team "${req.body.team}" not found` 
        });
      }
      updates.team = team._id;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true, runValidators: true }
    )
    .select('-password')
    .populate('team', 'name');

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