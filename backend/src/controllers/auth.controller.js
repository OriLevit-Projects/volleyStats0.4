const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.signup = async (req, res) => {
  try {
    console.log('Received signup request with body:', req.body);
    const { firstName, lastName, email, password, team, position, jerseyNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    console.log('Existing user check:', existingUser ? 'User exists' : 'User does not exist');
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      team,
      position,
      jerseyNumber
    });

    console.log('Attempting to save user:', user);
    await user.save();
    console.log('User saved successfully');

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token created successfully');

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        team: user.team,
        position: user.position,
        jerseyNumber: user.jerseyNumber
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
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
        jerseyNumber: user.jerseyNumber
      }
    });

  } catch (error) {
    console.error('Server login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
}; 