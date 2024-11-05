const express = require('express');
const router = express.Router();
const Team = require('../models/team.model');

router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({}, 'name');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams' });
  }
});

module.exports = router; 