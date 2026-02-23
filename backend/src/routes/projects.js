const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Message = require('../models/Message');
const File = require('../models/File');
const { protect } = require('../middleware/auth');
const { recalculateMeritForAllMembers } = require('../services/meritService');

// Helper: check if user is a member
const isMember = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString());

// Helper: check if user is owner
const isOwner = (project, userId) =>
  project.owner.toString() === userId.toString();

// GET /api/projects - Browse public projects
router.get('/', protect, async (req, res) => {
  try {
    const { search, tag, status = 'active' } = req.query;
    const query = { isPublic: true };
    if (status) query.status = status;
    if (tag) query.tags = tag;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const projects = await Project.find(query)
      .populate('owner', 'name avatar')
      .populate('members.user', 'name avatar')
      .sort('-createdAt');

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/my - Get user's projects
router.get('/my', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    })
      .populate('owner', 'name avatar')
      .populate('members.user', 'name avatar')
      .populate('pendingRequests', '_id') // lightweight — just IDs for badge count
      .sort('-updatedAt');

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects - Create project
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, tags, coverColor, isPublic } = req.body;

    const project = await Project.create({
      title,
      description,
      tags: tags || [],
      coverColor: coverColor || '#3B82F6',
      isPublic: isPublic !== false,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });

    await project.populate('owner', 'name avatar');
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name avatar email skills')
      .populate('members.user', 'name avatar email skills')
      .populate('pendingRequests', 'name avatar email');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Non-members can only see public projects
    if (!project.isPublic && !isMember(project, req.user._id) && !isOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only owner can update project' });
    }

    const { title, description, tags, status, coverColor, isPublic } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (tags) updates.tags = tags;
    if (status) updates.status = status;
    if (coverColor) updates.coverColor = coverColor;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    const updated = await Project.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('owner', 'name avatar')
      .populate('members.user', 'name avatar');

    // Trigger merit recalculation when project is marked completed
    if (status === 'completed' && project.status !== 'completed') {
      recalculateMeritForAllMembers(req.params.id).catch(() => {});
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    await Task.deleteMany({ project: req.params.id });
    await Message.deleteMany({ project: req.params.id });
    await File.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects/:id/join - Request to join
router.post('/:id/join', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (isMember(project, req.user._id) || isOwner(project, req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }
    if (project.pendingRequests.includes(req.user._id)) {
      return res.status(400).json({ message: 'Request already pending' });
    }

    project.pendingRequests.push(req.user._id);
    await project.save();
    res.json({ message: 'Join request sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/projects/:id/accept/:userId - Accept join request
router.put('/:id/accept/:userId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only owner can accept requests' });
    }

    project.pendingRequests = project.pendingRequests.filter(
      (id) => id.toString() !== req.params.userId
    );
    project.members.push({ user: req.params.userId, role: 'member' });
    await project.save();

    const updated = await Project.findById(req.params.id)
      .populate('members.user', 'name avatar')
      .populate('pendingRequests', 'name avatar email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/projects/:id/reject/:userId - Reject join request
router.put('/:id/reject/:userId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only owner can reject requests' });
    }

    project.pendingRequests = project.pendingRequests.filter(
      (id) => id.toString() !== req.params.userId
    );
    await project.save();
    res.json({ message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id/leave - Leave project
router.delete('/:id/leave', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (isOwner(project, req.user._id)) {
      return res.status(400).json({ message: 'Owner cannot leave. Transfer ownership first.' });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.user._id.toString()
    );
    await project.save();
    res.json({ message: 'Left project' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id/members/:userId - Remove member (owner only)
router.delete('/:id/members/:userId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only owner can remove members' });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await project.save();
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
