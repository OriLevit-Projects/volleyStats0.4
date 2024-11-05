const express = require('express');
const router = express.Router();
const Stat = require('../models/stat.model');

// Record new stat
router.post('/', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    const { userId, team, action, result } = req.body;
    
    // Detailed validation logging
    const validationErrors = [];
    
    if (!userId) validationErrors.push('userId is missing');
    if (!team) validationErrors.push('team is missing');
    if (!action) validationErrors.push('action is missing');
    if (!result) validationErrors.push('result is missing');
    
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
      result
    });

    console.log('Attempting to save stat:', newStat);
    
    const savedStat = await newStat.save();
    console.log('Successfully saved stat:', savedStat);
    
    res.status(201).json(savedStat);
  } catch (error) {
    console.error('Error recording stat:', error);
    res.status(500).json({ 
      message: 'Error recording stat',
      error: error.message 
    });
  }
});

// Get stats for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const stats = await Stat.find({ userId: req.params.userId })
      .sort({ timestamp: -1 });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
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