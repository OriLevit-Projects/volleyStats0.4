const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Team = require('../models/team.model');

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, team: teamName, position, jerseyNumber } = req.body;

    // First, find the team by name
    const team = await Team.findOne({ name: teamName });
    if (!team) {
      return res.status(400).json({ message: 'Team not found' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with team ObjectId
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      team: team._id, // Use the team's ObjectId instead of name
      position,
      jerseyNumber
    });

    await user.save();

    // Add user to team's players array
    team.players.push(user._id);
    await team.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        team: team.name, // Send back team name for display
        position: user.position,
        jerseyNumber: user.jerseyNumber
      }
    });

  } catch (error) {
    console.warn('Signup error:', error);
    res.status(500).json({ 
      message: 'Error creating user',
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email);
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Email not found' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for email:', email);
      return res.status(401).json({ message: 'Incorrect password' });
    }

    console.log('Successful login for email:', email);
    
    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        team: user.team,
        position: user.position,
        jerseyNumber: user.jerseyNumber,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Server login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
}; 