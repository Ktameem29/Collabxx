const mongoose = require('mongoose');

const judgeScoreSchema = new mongoose.Schema(
  {
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'HackathonSubmission', required: true },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scores: {
      innovation: { type: Number, min: 0, max: 10, default: 0 },
      technicality: { type: Number, min: 0, max: 10, default: 0 },
      presentation: { type: Number, min: 0, max: 10, default: 0 },
      impact: { type: Number, min: 0, max: 10, default: 0 },
    },
    totalScore: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

judgeScoreSchema.index({ submission: 1, judge: 1 }, { unique: true });

judgeScoreSchema.pre('save', function (next) {
  const { innovation, technicality, presentation, impact } = this.scores;
  this.totalScore = (innovation || 0) + (technicality || 0) + (presentation || 0) + (impact || 0);
  next();
});

module.exports = mongoose.model('JudgeScore', judgeScoreSchema);
