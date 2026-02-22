const express = require('express');
const router = express.Router();
const File = require('../models/File');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const isMember = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString()) ||
  project.owner.toString() === userId.toString();

const isOwnerOrUploader = (project, file, userId) =>
  project.owner.toString() === userId.toString() ||
  file.uploadedBy.toString() === userId.toString();

// GET /api/files/project/:projectId
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const files = await File.find({ project: req.params.projectId })
      .populate('uploadedBy', 'name avatar')
      .sort('-createdAt');

    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/files/project/:projectId
router.post('/project/:projectId', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const file = await File.create({
      project: req.params.projectId,
      uploadedBy: req.user._id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      url: `/uploads/files/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });

    await file.populate('uploadedBy', 'name avatar');
    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/files/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const project = await Project.findById(file.project);
    if (!isOwnerOrUploader(project, file, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove physical file
    const filePath = path.join(__dirname, '../../uploads/files', file.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await file.deleteOne();
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
