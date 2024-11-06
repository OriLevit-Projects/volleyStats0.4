const express = require('express');
const router = express.Router();
const Stat = require('../models/stat.model');
const Team = require('../models/team.model');
const authMiddleware = require('../middleware/auth.middleware');

// Add auth middleware to protect routes
router.use(authMiddleware);

// Record new stat
router.post('/', async (req, res) => {
  try {
    console.log('Received stat request body:', req.body);
    
    const { userId, team: teamName, action, result, playerName, matchId } = req.body;
    
    // Add match validation
    if (!matchId) {
      return res.status(400).json({ 
        message: 'Match ID is required',
        receivedData: req.body
      });
    }

    // Find the team and verify the match exists in the team's matches
    const team = await Team.findOne({ name: teamName });
    if (!team) {
      return res.status(400).json({ message: 'Team not found' });
    }

    const match = team.matches.id(matchId);
    if (!match) {
      return res.status(400).json({ 
        message: 'Match not found in team matches',
        receivedData: req.body
      });
    }

    const newStat = new Stat({
      userId,
      team: teamName,
      action,
      result,
      playerName,
      matchId: matchId // This will reference the subdocument ID
    });

    console.log('Attempting to save stat:', newStat);
    
    const savedStat = await newStat.save();
    console.log('Successfully saved stat:', savedStat);
    
    res.status(201).json(savedStat);
  } catch (error) {
    console.error('Error recording stat:', error);
    res.status(500).json({ 
      message: 'Error recording stat',
      error: error.message,
      details: error.errors
    });
  }
});

// Get stats for a user
router.get('/user/:userId', async (req, res) => {
  try {
    console.log('Fetching stats for user:', req.params.userId);
    
    const stats = await Stat.find({ userId: req.params.userId })
      .sort({ timestamp: -1 });
    
    // Get all teams that have these stats
    const teamNames = [...new Set(stats.map(stat => stat.team))];
    const teams = await Team.find({ name: { $in: teamNames } });
    
    // Create a map of match IDs to match data
    const matchesMap = teams.reduce((acc, team) => {
      team.matches.forEach(match => {
        acc[match._id.toString()] = match;
      });
      return acc;
    }, {});

    // Attach match data to stats
    const statsWithMatches = stats.map(stat => {
      const statObj = stat.toObject();
      if (stat.matchId) {
        statObj.matchId = matchesMap[stat.matchId.toString()] || null;
      }
      return statObj;
    });

    // Create summary
    const summary = statsWithMatches.reduce((acc, stat) => {
      if (!acc[stat.action]) {
        acc[stat.action] = {
          total: 0,
          results: {}
        };
      }
      
      acc[stat.action].total++;
      if (!acc[stat.action].results[stat.result]) {
        acc[stat.action].results[stat.result] = 0;
      }
      acc[stat.action].results[stat.result]++;
      
      return acc;
    }, {});

    res.json({
      stats: statsWithMatches,
      summary,
      debug: {
        totalStats: stats.length,
        statsWithMatches: statsWithMatches.filter(stat => stat.matchId).length
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error fetching stats',
      error: error.message
    });
  }
});

// Get stats for a team
router.get('/team/:teamName', async (req, res) => {
  try {
    const stats = await Stat.find({ team: req.params.teamName })
      .sort({ timestamp: -1 });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team stats' });
  }
});

module.exports = router; 