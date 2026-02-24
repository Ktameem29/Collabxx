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

// PUT /api/messages/:id/vote — vote on a poll option
router.put('/:id/vote', protect, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message || message.type !== 'poll') return res.status(404).json({ message: 'Poll not found' });

    const project = await Project.findById(message.project);
    if (!isMember(project, req.user._id)) return res.status(403).json({ message: 'Access denied' });

    const userId = req.user._id;
    // Remove existing vote from any option
    message.pollOptions.forEach((opt) => {
      opt.votes = opt.votes.filter((v) => v.toString() !== userId.toString());
    });
    // Add vote to selected option (toggle off if already voted)
    const opt = message.pollOptions[optionIndex];
    if (opt) opt.votes.push(userId);

    await message.save();
    await message.populate('sender', 'name avatar');
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
