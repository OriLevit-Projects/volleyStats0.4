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
      // Remove from old team if it exists
      if (oldTeam) {
        await Team.findOneAndUpdate(
          { name: oldTeam },
          { $pull: { players: userId } }
        );
      }

      // Add to new team
      if (newTeam) {
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
    const team = await Team.findByIdAndUpdate(
      req.params.teamId,
      req.body,
      { new: true }
    ).populate('players', 'firstName lastName position jerseyNumber');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
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