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
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('1. Update request received for team:', req.params.id);
    console.log('2. Request body:', JSON.stringify(req.body, null, 2));

    const team = await Team.findById(req.params.id);
    if (!team) {
      console.log('3. Team not found');
      return res.status(404).json({ message: 'Team not found' });
    }
    console.log('4. Found team:', team.name);

    if (req.body.matches) {
      console.log('5. Processing matches update');
      if (!Array.isArray(req.body.matches)) {
        console.log('6. Matches is not an array:', typeof req.body.matches);
        return res.status(400).json({ message: 'Matches must be an array' });
      }

      // Filter out any matches with empty location or opponent
      const validMatches = req.body.matches.filter(match => 
        match.location?.trim() && match.opponent?.trim()
      );

      const formattedMatches = validMatches.map(match => {
        console.log('7. Processing match:', match);
        return {
          date: new Date(match.date),
          location: String(match.location).trim(),
          opponent: String(match.opponent).trim(),
          score: {
            us: Number(match.score.us) || 0,
            them: Number(match.score.them) || 0
          }
        };
      });

      console.log('9. Formatted matches:', JSON.stringify(formattedMatches, null, 2));
      team.matches = formattedMatches;
    }

    // Save and respond
    const savedTeam = await team.save();
    console.log('10. Team saved successfully');
    
    const updatedTeam = await Team.findById(savedTeam._id).populate('players');
    res.json(updatedTeam);

  } catch (error) {
    console.error('Error in team update:', error);
    res.status(400).json({
      message: error.message || 'Error updating team'
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

module.exports = router; 