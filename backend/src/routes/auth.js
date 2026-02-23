const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const User = require('../models/User');
const University = require('../models/University');
const Waitlist = require('../models/Waitlist');
const { protect } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/upload');
const path = require('path');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password, universityId } = req.body;

      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });

      let universityRef = null;
      let waitlistStatus = 'none';
      let isActive = true;

      // If universityId provided, validate it
      if (universityId) {
        const university = await University.findById(universityId);
        if (!university || !university.isActive) {
          return res.status(400).json({ message: 'Invalid university' });
        }

        if (university.currentStudentCount < university.maxStudents) {
          // Room available — auto-enroll
          universityRef = university._id;
          university.currentStudentCount += 1;
          await university.save();
          waitlistStatus = 'approved';
        } else {
          // University full — add to waitlist, user can't login yet
          waitlistStatus = 'pending';
          isActive = false;
          universityRef = null; // assigned after approval
        }
      } else {
        // No university provided — check email domain match
        const domain = email.split('@')[1]?.toLowerCase();
        if (domain) {
          const university = await University.findOne({ domain, isActive: true });
          if (university) {
            if (university.currentStudentCount < university.maxStudents) {
              universityRef = university._id;
              university.currentStudentCount += 1;
              await university.save();
              waitlistStatus = 'approved';
            } else {
              waitlistStatus = 'pending';
              isActive = false;
            }
          }
        }
      }

      const user = await User.create({
        name,
        email,
        password,
        university: universityRef,
        waitlistStatus,
        isActive,
      });

      // Add to waitlist if pending
      if (waitlistStatus === 'pending') {
        const uniToWaitlist =
          universityId ||
          (await University.findOne({ domain: email.split('@')[1]?.toLowerCase(), isActive: true }))?._id;

        if (uniToWaitlist) {
          await Waitlist.create({
            user: user._id,
            university: uniToWaitlist,
            meritScoreAtEntry: 0,
          });
        }
        return res.status(202).json({
          waitlisted: true,
          message: 'University is full. You have been added to the waitlist.',
        });
      }

      res.status(201).json({
        token: generateToken(user._id),
        user,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      // MUST use .select('+password') since password field has select:false
      const user = await User.findOne({ email }).select('+password');
      if (!user || !user.password || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      if (!user.isActive) {
        if (user.waitlistStatus === 'pending') {
          return res.status(403).json({ message: 'Account pending waitlist approval', waitlisted: true });
        }
        return res.status(403).json({ message: 'Account deactivated' });
      }

      res.json({ token: generateToken(user._id), user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, skills } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (skills) updates.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    // Need +password since it's select:false
    const user = await User.findById(req.user._id).select('+password');
    if (!user.password) {
      return res.status(400).json({ message: 'Account uses OAuth — no password set' });
    }
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/avatar
router.post('/avatar', protect, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.json({ avatar: avatarUrl, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

// GET /api/auth/google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  (req, res) => {
    const user = req.user;
    if (!user.isActive && user.waitlistStatus === 'pending') {
      return res.redirect(`${process.env.CLIENT_URL}/waitlisted`);
    }
    const token = generateToken(user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;
