const mongoose = require('mongoose');

const hackathonTeamSchema = new mongoose.Schema(
  {
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    name: { type: String, required: true, trim: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['leader', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    pendingInvites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hasSubmitted: { type: Boolean, default: false },
    isDisqualified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HackathonTeam', hackathonTeamSchema);
