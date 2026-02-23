const express = require('express');
const router = express.Router();
const University = require('../models/University');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/logos');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const logoUpload = multer({
  storage: logoStorage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error('Only image files allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// GET /api/universities — list active universities
router.get('/', protect, async (req, res) => {
  try {
    const universities = await University.find({ isActive: true }).sort('name');
    res.json(universities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/universities/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.status(404).json({ message: 'University not found' });
    res.json(university);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/universities — admin: create
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { name, domain, maxStudents, description, location } = req.body;
    const university = await University.create({ name, domain, maxStudents, description, location });
    res.status(201).json(university);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/universities/:id — admin: update
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, domain, maxStudents, description, location, isActive } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (domain !== undefined) updates.domain = domain;
    if (maxStudents !== undefined) updates.maxStudents = maxStudents;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    if (isActive !== undefined) updates.isActive = isActive;

    const university = await University.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!university) return res.status(404).json({ message: 'University not found' });
    res.json(university);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/universities/:id — admin: soft-delete
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!university) return res.status(404).json({ message: 'University not found' });
    res.json({ message: 'University deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/universities/:id/logo — admin: upload logo
router.post('/:id/logo', protect, isAdmin, logoUpload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    const university = await University.findByIdAndUpdate(
      req.params.id,
      { logo: logoUrl },
      { new: true }
    );
    if (!university) return res.status(404).json({ message: 'University not found' });
    res.json({ logo: logoUrl, university });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
