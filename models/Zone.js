const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  task: {
    type: String,
    trim: true,
    default: ''
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  lat: {
    type: Number,
    default: null
  },
  lng: {
    type: Number,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Zone', zoneSchema);
