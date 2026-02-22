const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const isMember = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString()) ||
  project.owner.toString() === userId.toString();

// GET /api/messages/project/:projectId?page=1&limit=50
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ project: req.params.projectId })
      .populate('sender', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
