const express = require('express');
const router = express.Router();
const Stat = require('../models/stat.model');
const Match = require('../models/match.model');
const authMiddleware = require('../middleware/auth.middleware');

// Add auth middleware to protect routes
router.use(authMiddleware);

// Record new stat
router.post('/', async (req, res) => {
  try {
    console.log('Received stat request body:', req.body);
    
    const { userId, team, action, result, playerName, matchId } = req.body;
    
    // Detailed validation logging
    const validationErrors = [];
    
    if (!userId) validationErrors.push('userId is missing');
    if (!team) validationErrors.push('team is missing');
    if (!action) validationErrors.push('action is missing');
    if (!result) validationErrors.push('result is missing');
    if (!playerName) validationErrors.push('playerName is missing');
    if (!matchId) validationErrors.push('matchId is missing');
    
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({ 
        message: 'Missing required fields',
        errors: validationErrors,
        receivedData: req.body
      });
    }

    const newStat = new Stat({
      userId,
      team,
      action,
      result,
      playerName,
      matchId
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
      .populate('matchId', 'opponent date')
      .sort({ timestamp: -1 });
    
    // Group stats by action type for summary
    const summary = stats.reduce((acc, stat) => {
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
      stats,
      summary
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
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