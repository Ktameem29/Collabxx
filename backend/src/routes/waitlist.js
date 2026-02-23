const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');
const University = require('../models/University');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

router.use(protect, isAdmin);

// GET /api/waitlist — list entries, filter ?universityId=&status=
router.get('/', async (req, res) => {
  try {
    const { universityId, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (universityId) query.university = universityId;
    if (status) query.status = status;

    const total = await Waitlist.countDocuments(query);
    const entries = await Waitlist.find(query)
      .populate('user', 'name email avatar meritScore')
      .populate('university', 'name domain')
      .populate('reviewedBy', 'name')
      .sort('-meritScoreAtEntry -createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ entries, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/waitlist/:id/approve
router.post('/:id/approve', async (req, res) => {
  try {
    const entry = await Waitlist.findById(req.params.id).populate('university');
    if (!entry) return res.status(404).json({ message: 'Waitlist entry not found' });
    if (entry.status !== 'pending') {
      return res.status(400).json({ message: 'Entry already reviewed' });
    }

    // Atomically increment only if university still has room
    const university = await University.findOneAndUpdate(
      { _id: entry.university._id, $expr: { $lt: ['$currentStudentCount', '$maxStudents'] } },
      { $inc: { currentStudentCount: 1 } },
      { new: true }
    );

    if (!university) {
      return res.status(409).json({ message: 'University is full — cannot approve' });
    }

    // Update waitlist entry
    entry.status = 'approved';
    entry.reviewedBy = req.user._id;
    entry.reviewedAt = new Date();
    await entry.save();

    // Activate user and link to university
    await User.findByIdAndUpdate(entry.user, {
      isActive: true,
      waitlistStatus: 'approved',
      university: entry.university._id,
    });

    res.json({ message: 'Student approved', entry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/waitlist/:id/reject
router.post('/:id/reject', async (req, res) => {
  try {
    const { adminNote } = req.body;
    const entry = await Waitlist.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Waitlist entry not found' });
    if (entry.status !== 'pending') {
      return res.status(400).json({ message: 'Entry already reviewed' });
    }

    entry.status = 'rejected';
    entry.adminNote = adminNote || '';
    entry.reviewedBy = req.user._id;
    entry.reviewedAt = new Date();
    await entry.save();

    await User.findByIdAndUpdate(entry.user, { waitlistStatus: 'rejected' });

    res.json({ message: 'Student rejected', entry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
