const mongoose = require('mongoose');

const hackathonSubmissionSchema = new mongoose.Schema(
  {
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'HackathonTeam', required: true, unique: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    repoUrl: { type: String, default: '' },
    demoUrl: { type: String, default: '' },
    techStack: [{ type: String, trim: true }],
    totalScore: { type: Number, default: null },
    rank: { type: Number, default: null },
    isWinner: { type: Boolean, default: false },
    winnerPlace: { type: Number, default: null },
  },
  { timestamps: true }
);

hackathonSubmissionSchema.index({ hackathon: 1, totalScore: -1 });

module.exports = mongoose.model('HackathonSubmission', hackathonSubmissionSchema);
