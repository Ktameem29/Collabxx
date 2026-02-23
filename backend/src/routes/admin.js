const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Message = require('../models/Message');
const File = require('../models/File');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const { recalculateMeritForUser } = require('../services/meritService');

router.use(protect, isAdmin);

const VALID_ROLES = ['student', 'mentor', 'judge', 'admin'];

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [users, projects, tasks, messages, files] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
      Message.countDocuments(),
      File.countDocuments(),
    ]);

    const activeProjects = await Project.countDocuments({ status: 'active' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email avatar createdAt role');
    const recentProjects = await Project.find().sort('-createdAt').limit(5).populate('owner', 'name avatar');

    res.json({
      stats: { users, projects, tasks, messages, files, activeProjects, adminCount },
      recentUsers,
      recentProjects,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('university', 'name');

    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role && VALID_ROLES.includes(role)) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('university', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/projects
router.get('/projects', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('owner', 'name avatar email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ projects, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/projects/:id
router.delete('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Task.deleteMany({ project: req.params.id });
    await Message.deleteMany({ project: req.params.id });
    await File.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/merit/recalculate/:userId
router.post('/merit/recalculate/:userId', async (req, res) => {
  try {
    const result = await recalculateMeritForUser(req.params.userId);
    if (!result) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Merit recalculated', ...result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
