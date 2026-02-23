const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    meritScoreAtEntry: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

waitlistSchema.index({ university: 1, status: 1 });
waitlistSchema.index({ meritScoreAtEntry: -1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);
