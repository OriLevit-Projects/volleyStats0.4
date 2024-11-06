const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  opponent: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  score: {
    us: {
      type: Number,
      required: true
    },
    them: {
      type: Number,
      required: true
    }
  }
});

module.exports = mongoose.model('Match', matchSchema); 