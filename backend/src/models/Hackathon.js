const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    submissionDeadline: { type: Date, required: true },
    maxTeamSize: { type: Number, default: 4 },
    minTeamSize: { type: Number, default: 1 },
    participatingUniversities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'University' }],
    prizes: [
      {
        place: { type: Number },
        title: { type: String },
        description: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'active', 'judging', 'completed'],
      default: 'upcoming',
    },
    judges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scoringCriteria: {
      innovation: { type: Number, default: 25 },
      technicality: { type: Number, default: 25 },
      presentation: { type: Number, default: 25 },
      impact: { type: Number, default: 25 },
    },
    winners: [
      {
        place: { type: Number },
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'HackathonTeam' },
      },
    ],
    coverColor: { type: String, default: '#8B5CF6' },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hackathon', hackathonSchema);
