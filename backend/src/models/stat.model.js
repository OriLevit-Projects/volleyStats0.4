const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  team: {
    type: String,
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['Serve', 'Serve Recieve', 'Set', 'Spike', 'Block', 'Dig']
  },
  result: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Stat', statSchema); 