const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const { recalculateMeritForUser } = require('../services/meritService');
const { BADGE_DEFINITIONS } = require('../services/badgeService');

// GET /api/merit/badges — returns all badge definitions
router.get('/badges', protect, (req, res) => {
  res.json(BADGE_DEFINITIONS);
});

// GET /api/merit/leaderboard — global
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const total = await User.countDocuments({ isActive: true });
    const users = await User.find({ isActive: true })
      .select('name avatar meritScore meritBreakdown university role')
      .populate('university', 'name logo')
      .sort('-meritScore')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/merit/leaderboard/university/:uniId
router.get('/leaderboard/university/:uniId', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const query = { isActive: true, university: req.params.uniId };
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('name avatar meritScore meritBreakdown university role')
      .populate('university', 'name logo')
      .sort('-meritScore')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/merit/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('name avatar meritScore meritBreakdown university')
      .populate('university', 'name logo');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/merit/recalculate/all — admin  ← must come BEFORE /:userId
router.post('/recalculate/all', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('_id');
    await Promise.all(users.map((u) => recalculateMeritForUser(u._id)));
    res.json({ message: `Merit recalculated for ${users.length} users` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/merit/recalculate/:userId — admin
router.post('/recalculate/:userId', protect, isAdmin, async (req, res) => {
  try {
    const result = await recalculateMeritForUser(req.params.userId);
    if (!result) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Merit recalculated', ...result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
