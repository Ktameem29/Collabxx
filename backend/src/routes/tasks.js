const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const isMember = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString()) ||
  project.owner.toString() === userId.toString();

// GET /api/tasks/project/:projectId
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name avatar')
      .populate('createdBy', 'name avatar')
      .sort('order createdAt');

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks
router.post('/', protect, async (req, res) => {
  try {
    const { projectId, title, description, status, priority, assignedTo, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const count = await Task.countDocuments({ project: projectId, status: status || 'todo' });

    const task = await Task.create({
      project: projectId,
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      createdBy: req.user._id,
      order: count,
    });

    await task.populate('assignedTo', 'name avatar');
    await task.populate('createdBy', 'name avatar');

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!isMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, status, priority, assignedTo, dueDate, order } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo || null;
    if (dueDate !== undefined) updates.dueDate = dueDate || null;
    if (order !== undefined) updates.order = order;

    const updated = await Task.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('assignedTo', 'name avatar')
      .populate('createdBy', 'name avatar');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!isMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/reorder - Bulk reorder after drag-drop
router.put('/reorder/bulk', protect, async (req, res) => {
  try {
    const { tasks } = req.body; // [{ id, status, order }]
    const ops = tasks.map(({ id, status, order }) =>
      Task.findByIdAndUpdate(id, { status, order })
    );
    await Promise.all(ops);
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
