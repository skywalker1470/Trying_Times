const mongoose = require('mongoose');

const assetAssignmentSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  month: { type: String, required: true }, // e.g., "2024-08"
  quantity: { type: Number, required: true, default: 1 }
});

module.exports = mongoose.model('AssetAssignment', assetAssignmentSchema);