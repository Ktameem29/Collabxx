const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { _id: true });

const messageSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'file', 'poll'], default: 'text' },
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
    pollQuestion: { type: String, default: null },
    pollOptions: [pollOptionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
