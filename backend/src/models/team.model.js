const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  opponent: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    us: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    them: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  },
  videoUrl: {
    type: String,
    trim: true
  }
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matches: [matchSchema],
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema); 