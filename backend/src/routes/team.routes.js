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
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Get current players to handle removals
    const currentPlayers = team.players || [];
    const newPlayers = req.body.players || [];

    // Remove players that are no longer in the team
    const removedPlayers = currentPlayers.filter(
      playerId => !newPlayers.includes(playerId.toString())
    );

    // Update user documents to remove team reference
    await User.updateMany(
      { _id: { $in: removedPlayers } },
      { $unset: { team: "" } }
    );

    // Update user documents to add team reference for new players
    await User.updateMany(
      { _id: { $in: newPlayers } },
      { $set: { team: team._id } }
    );

    // Update team document
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.teamId,
      {
        name: req.body.name,
        players: newPlayers
      },
      { new: true }
    ).populate('players', 'firstName lastName email position jerseyNumber');

    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ 
      message: 'Error updating team',
      error: error.message 
    });
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

// Add these new routes to your existing team.routes.js

// Get my team
router.get('/my-team', async (req, res) => {
  try {
    console.log('Fetching team for user:', req.user._id);
    
    const user = await User.findById(req.user._id)
      .populate('team');
    
    if (!user.team) {
      return res.status(404).json({ 
        message: 'No team found for this user',
        needsTeam: true
      });
    }

    const team = await Team.findById(user.team._id)
      .populate('players', 'firstName lastName email position jerseyNumber')
      .populate('matches');

    if (!team) {
      return res.status(404).json({ 
        message: 'Team not found',
        needsTeam: true
      });
    }

    // Calculate team statistics
    const stats = {
      totalMatches: team.matches.length,
      wins: team.wins,
      losses: team.losses,
      winRate: team.matches.length > 0 
        ? ((team.wins / (team.wins + team.losses)) * 100).toFixed(1) 
        : 0
    };

    res.json({
      ...team.toObject(),
      stats
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Error fetching team data' });
  }
});

// Get team statistics
router.get('/my-team/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('team');
    if (!user.team) {
      return res.status(404).json({ message: 'No team found for this user' });
    }

    const team = await Team.findById(user.team._id);
    
    // Calculate team statistics
    const stats = {
      totalMatches: team.matches.length,
      wins: team.wins,
      losses: team.losses,
      winRate: team.matches.length > 0 
        ? ((team.wins / (team.wins + team.losses)) * 100).toFixed(1) 
        : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching team stats:', error);
    res.status(500).json({ message: 'Error fetching team statistics' });
  }
});

// Add match to my team
router.post('/my-team/matches', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('team');
    if (!user.team) {
      return res.status(404).json({ message: 'No team found for this user' });
    }

    const { date, location, opponent, score } = req.body;
    
    const team = await Team.findById(user.team._id);
    
    team.matches.push({
      date,
      location,
      opponent,
      score: {
        us: score.us,
        them: score.them
      }
    });

    // Update wins/losses
    if (score.us > score.them) {
      team.wins += 1;
    } else {
      team.losses += 1;
    }

    await team.save();

    res.json(team);
  } catch (error) {
    console.error('Error adding match:', error);
    res.status(500).json({ message: 'Error adding match' });
  }
});

module.exports = router; 