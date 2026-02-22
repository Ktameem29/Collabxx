const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'file'], default: 'text' },
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
