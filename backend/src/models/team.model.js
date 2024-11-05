const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matches: [{
    date: Date,
    location: String,
    opponent: String,
    score: {
      us: Number,
      them: Number
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema); 