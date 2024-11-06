const express = require('express');
const router = express.Router();
const Team = require('../models/team.model');
const User = require('../models/user.model');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Get all teams with populated players
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all teams');
    const teams = await Team.find({}).populate('players', 'firstName lastName email position jerseyNumber');
    console.log('Teams found:', teams);
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
});

// Update team (including adding/removing players)
router.put('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, players, wins, losses } = req.body;

    const oldTeam = await Team.findById(teamId);
    if (!oldTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Update the team with all fields
    const team = await Team.findByIdAndUpdate(
      teamId,
      { 
        name, 
        players,
        wins: wins !== undefined ? wins : oldTeam.wins,
        losses: losses !== undefined ? losses : oldTeam.losses
      },
      { new: true }
    ).populate('players', 'firstName lastName email position jerseyNumber');

    // Update user team associations
    if (players) {
      // Remove team from all users who were in this team
      await User.updateMany(
        { team: oldTeam.name },
        { $unset: { team: "" } }
      );

      // Add team to new players
      await User.updateMany(
        { _id: { $in: players } },
        { team: name || oldTeam.name }
      );
    }

    res.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Error updating team' });
  }
});

// Create new team
router.post('/', async (req, res) => {
  try {
    const { name, players, wins = 0, losses = 0 } = req.body;
    
    const team = new Team({
      name,
      players: players || [],
      wins,
      losses
    });

    await team.save();

    // Update the team field for all users in this team
    if (players && players.length > 0) {
      await User.updateMany(
        { _id: { $in: players } },
        { team: name }
      );
    }

    const populatedTeam = await Team.findById(team._id)
      .populate('players', 'firstName lastName email position jerseyNumber');
    res.status(201).json(populatedTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Error creating team' });
  }
});

// Delete team
router.delete('/:teamId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Remove team reference from all users in this team
    await User.updateMany(
      { team: team.name },
      { $unset: { team: "" } }
    );

    await Team.findByIdAndDelete(req.params.teamId);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Error deleting team' });
  }
});

// Add this new route
router.get('/name/:teamName', async (req, res) => {
  try {
    const team = await Team.findOne({ name: req.params.teamName }).populate('players');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    console.error('Error fetching team by name:', error);
    res.status(500).json({ message: 'Error fetching team' });
  }
});

module.exports = router; 