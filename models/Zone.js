const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  // For team assignments
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: function() {
      return this.type === 'team';
    }
  },
  // For employee assignments
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: function() {
      return this.type === 'employee';
    }
  },
  // Type of assignment (team or employee)
  type: {
    type: String,
    enum: ['team', 'employee'],
    required: true
  },
  // Additional details
  assignedName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  // Timestamps for tracking
  assignedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  // Indexes for better query performance
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add text index for search
zoneSchema.index({ name: 'text', assignedName: 'text' });

// Virtual for getting the assigned entity (team or employee)
zoneSchema.virtual('assignedTo').get(function() {
  return this.type === 'team' ? this.team : this.employee;
});

module.exports = mongoose.model('Zone', zoneSchema);
