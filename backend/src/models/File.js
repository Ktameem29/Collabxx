const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);
