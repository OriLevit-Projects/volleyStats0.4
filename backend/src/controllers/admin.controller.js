const User = require('../models/user.model');
const Team = require('../models/team.model');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated
    delete updateData.password;
    delete updateData.isAdmin;

    // Get the user's current data
    const currentUser = await User.findById(userId);
    const oldTeam = currentUser.team;
    const newTeam = updateData.team;

    // Update the user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle team changes
    if (oldTeam !== newTeam) {
      // Remove from old team if it exists and isn't "None"
      if (oldTeam && oldTeam !== "None") {
        await Team.findOneAndUpdate(
          { name: oldTeam },
          { $pull: { players: userId } }
        );
      }

      // Add to new team if it isn't "None"
      if (newTeam && newTeam !== "None") {
        await Team.findOneAndUpdate(
          { name: newTeam },
          { $addToSet: { players: userId } }
        );
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's team before deletion
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove user from their team
    if (user.team) {
      await Team.findOneAndUpdate(
        { name: user.team },
        { $pull: { players: userId } }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate({
        path: 'players',
        select: 'firstName lastName email position jerseyNumber'
      })
      .exec();
    
    console.log('Teams with players:', teams); // Debug log
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const team = new Team(req.body);
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error creating team' });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const updateData = req.body;
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Get the current players before update
    const currentPlayers = team.players.map(id => id.toString()) || [];
    const newPlayers = updateData.players || [];

    // Find removed players (players in current but not in new)
    const removedPlayers = currentPlayers.filter(playerId => 
      !newPlayers.includes(playerId)
    );

    // Find added players (players in new but not in current)
    const addedPlayers = newPlayers.filter(playerId => 
      !currentPlayers.includes(playerId)
    );

    // Update removed players' team field to "None"
    if (removedPlayers.length > 0) {
      await User.updateMany(
        { _id: { $in: removedPlayers } },
        { $set: { team: "None" } }
      );
    }

    // Update added players' team field to the team name
    if (addedPlayers.length > 0) {
      await User.updateMany(
        { _id: { $in: addedPlayers } },
        { $set: { team: updateData.name } }
      );
    }

    // Update team data
    team.name = updateData.name;
    team.wins = updateData.wins;
    team.losses = updateData.losses;
    team.players = updateData.players;

    await team.save();

    // Fetch the updated team with populated players
    const updatedTeam = await Team.findById(teamId)
      .populate('players', 'firstName lastName email position jerseyNumber');

    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Error updating team' });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting team' });
  }
}; 