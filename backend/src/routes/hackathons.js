const express = require('express');
const router = express.Router();
const Hackathon = require('../models/Hackathon');
const HackathonTeam = require('../models/HackathonTeam');
const HackathonSubmission = require('../models/HackathonSubmission');
const JudgeScore = require('../models/JudgeScore');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isAdmin, isJudge } = require('../middleware/roles');
const { recalculateMeritForUser } = require('../services/meritService');

// ─── Hackathon CRUD ───────────────────────────────────────────────────────────

// GET /api/hackathons
router.get('/', protect, async (req, res) => {
  try {
    const { status, universityId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (universityId) query.participatingUniversities = universityId;

    const hackathons = await Hackathon.find(query)
      .populate('createdBy', 'name avatar')
      .populate('judges', 'name avatar')
      .populate('participatingUniversities', 'name logo')
      .sort('-createdAt');

    res.json(hackathons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/hackathons/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('judges', 'name avatar email')
      .populate('participatingUniversities', 'name logo domain')
      .populate('winners.team', 'name leader members');

    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    res.json(hackathon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/hackathons — admin
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const hackathon = await Hackathon.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(hackathon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/hackathons/:id — admin
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    res.json(hackathon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/hackathons/:id — admin
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    await HackathonTeam.deleteMany({ hackathon: req.params.id });
    await HackathonSubmission.deleteMany({ hackathon: req.params.id });
    await JudgeScore.deleteMany({ hackathon: req.params.id });
    res.json({ message: 'Hackathon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/hackathons/:id/status — admin
router.put('/:id/status', protect, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['upcoming', 'active', 'judging', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const hackathon = await Hackathon.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`hackathon:${req.params.id}`).emit('hackathon:status:change', {
        hackathonId: req.params.id,
        status,
      });
    }

    res.json(hackathon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Judges ───────────────────────────────────────────────────────────────────

// POST /api/hackathons/:id/judges — admin: add judge
router.post('/:id/judges', protect, isAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'judge' && user.role !== 'admin') {
      return res.status(400).json({ message: 'User must have judge or admin role' });
    }

    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { judges: userId } },
      { new: true }
    ).populate('judges', 'name avatar email');

    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    res.json(hackathon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/hackathons/:id/judges/:userId — admin: remove judge
router.delete('/:id/judges/:userId', protect, isAdmin, async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { $pull: { judges: req.params.userId } },
      { new: true }
    ).populate('judges', 'name avatar email');

    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    res.json(hackathon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Winners ──────────────────────────────────────────────────────────────────

// POST /api/hackathons/:id/winners — admin: set winners
router.post('/:id/winners', protect, isAdmin, async (req, res) => {
  try {
    const { winners } = req.body; // [{ place, teamId }]
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

    hackathon.winners = winners.map(({ place, teamId }) => ({ place, team: teamId }));
    hackathon.status = 'completed';
    await hackathon.save();

    // Mark submissions as winners
    for (const { place, teamId } of winners) {
      await HackathonSubmission.findOneAndUpdate(
        { hackathon: req.params.id, team: teamId },
        { isWinner: true, winnerPlace: place }
      );

      // Get all team members for merit recalc
      const team = await HackathonTeam.findById(teamId);
      if (team) {
        await Promise.all(team.members.map((m) => recalculateMeritForUser(m.user)));
      }
    }

    // Emit socket
    const io = req.app.get('io');
    if (io) {
      io.to(`hackathon:${req.params.id}`).emit('hackathon:winners:announced', {
        hackathonId: req.params.id,
        winners: hackathon.winners,
      });
    }

    res.json(hackathon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Teams ────────────────────────────────────────────────────────────────────

// GET /api/hackathons/:id/teams
router.get('/:id/teams', protect, async (req, res) => {
  try {
    const teams = await HackathonTeam.find({ hackathon: req.params.id })
      .populate('leader', 'name avatar')
      .populate('members.user', 'name avatar')
      .populate('pendingInvites', 'name avatar email');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/hackathons/:id/teams/my — my team
router.get('/:id/teams/my', protect, async (req, res) => {
  try {
    const team = await HackathonTeam.findOne({
      hackathon: req.params.id,
      'members.user': req.user._id,
    })
      .populate('leader', 'name avatar')
      .populate('members.user', 'name avatar')
      .populate('pendingInvites', 'name avatar email');

    res.json(team || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/hackathons/:id/teams — create team
router.post('/:id/teams', protect, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    if (hackathon.status !== 'active') {
      return res.status(400).json({ message: 'Hackathon is not active' });
    }

    // Check if already on a team
    const existingTeam = await HackathonTeam.findOne({
      hackathon: req.params.id,
      'members.user': req.user._id,
    });
    if (existingTeam) return res.status(400).json({ message: 'Already on a team' });

    // Check university eligibility
    if (
      hackathon.participatingUniversities.length > 0 &&
      req.user.university &&
      !hackathon.participatingUniversities
        .map((u) => u.toString())
        .includes(req.user.university.toString())
    ) {
      return res.status(403).json({ message: 'Your university is not eligible for this hackathon' });
    }

    const { name } = req.body;
    const team = await HackathonTeam.create({
      hackathon: req.params.id,
      name,
      leader: req.user._id,
      members: [{ user: req.user._id, role: 'leader', joinedAt: new Date() }],
    });

    // Recalculate merit (participation)
    recalculateMeritForUser(req.user._id).catch(() => {});

    await team.populate('leader', 'name avatar');
    await team.populate('members.user', 'name avatar');
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/hackathons/:id/teams/:teamId/invite — invite user (leader only)
router.post('/:id/teams/:teamId/invite', protect, async (req, res) => {
  try {
    const team = await HackathonTeam.findOne({
      _id: req.params.teamId,
      hackathon: req.params.id,
    });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team leader can invite' });
    }

    const hackathon = await Hackathon.findById(req.params.id);
    const currentSize = team.members.length + team.pendingInvites.length;
    if (currentSize >= hackathon.maxTeamSize) {
      return res.status(400).json({ message: 'Team is at maximum size' });
    }

    const { userId } = req.body;
    // Check user not already on any team
    const alreadyOnTeam = await HackathonTeam.findOne({
      hackathon: req.params.id,
      'members.user': userId,
    });
    if (alreadyOnTeam) return res.status(400).json({ message: 'User is already on a team' });

    if (team.pendingInvites.includes(userId)) {
      return res.status(400).json({ message: 'Already invited' });
    }

    team.pendingInvites.push(userId);
    await team.save();
    await team.populate('pendingInvites', 'name avatar email');
    res.json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/hackathons/:id/teams/:teamId/accept — accept invite
router.post('/:id/teams/:teamId/accept', protect, async (req, res) => {
  try {
    const team = await HackathonTeam.findOne({
      _id: req.params.teamId,
      hackathon: req.params.id,
      pendingInvites: req.user._id,
    });
    if (!team) return res.status(404).json({ message: 'No invite found' });

    team.pendingInvites = team.pendingInvites.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    team.members.push({ user: req.user._id, role: 'member', joinedAt: new Date() });
    await team.save();

    recalculateMeritForUser(req.user._id).catch(() => {});

    await team.populate('members.user', 'name avatar');
    await team.populate('leader', 'name avatar');
    res.json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/hackathons/:id/teams/:teamId/decline — decline invite
router.post('/:id/teams/:teamId/decline', protect, async (req, res) => {
  try {
    const team = await HackathonTeam.findOne({
      _id: req.params.teamId,
      hackathon: req.params.id,
    });
    if (!team) return res.status(404).json({ message: 'Team not found' });

    team.pendingInvites = team.pendingInvites.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await team.save();
    res.json({ message: 'Invite declined' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/hackathons/:id/teams/:teamId/leave — leave team (non-leader)
router.delete('/:id/teams/:teamId/leave', protect, async (req, res) => {
  try {
    const team = await HackathonTeam.findOne({
      _id: req.params.teamId,
      hackathon: req.params.id,
    });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.leader.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Leader cannot leave — disband team instead' });
    }

    team.members = team.members.filter(
      (m) => m.user.toString() !== req.user._id.toString()
    );
    await team.save();
    res.json({ message: 'Left team' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── Submissions ──────────────────────────────────────────────────────────────

// GET /api/hackathons/:id/submissions — judge/admin
router.get('/:id/submissions', protect, isJudge, async (req, res) => {
  try {
    const submissions = await HackathonSubmission.find({ hackathon: req.params.id })
      .populate({ path: 'team', populate: { path: 'members.user leader', select: 'name avatar' } })
      .populate('submittedBy', 'name avatar')
      .sort({ totalScore: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/hackathons/:id/submissions/my
router.get('/:id/submissions/my', protect, async (req, res) => {
  try {
    const team = await HackathonTeam.findOne({
      hackathon: req.params.id,
      'members.user': req.user._id,
    });
    if (!team) return res.json(null);

    const submission = await HackathonSubmission.findOne({
      hackathon: req.params.id,
      team: team._id,
    }).populate('team', 'name');
    res.json(submission || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/hackathons/:id/submissions — submit (leader only, before deadline)
router.post('/:id/submissions', protect, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    if (new Date() > new Date(hackathon.submissionDeadline)) {
      return res.status(400).json({ message: 'Submission deadline passed' });
    }

    const team = await HackathonTeam.findOne({
      hackathon: req.params.id,
      leader: req.user._id,
    });
    if (!team) return res.status(403).json({ message: 'Only team leaders can submit' });

    const existing = await HackathonSubmission.findOne({ hackathon: req.params.id, team: team._id });
    if (existing) return res.status(400).json({ message: 'Already submitted' });

    const { title, description, repoUrl, demoUrl, techStack } = req.body;
    const submission = await HackathonSubmission.create({
      hackathon: req.params.id,
      team: team._id,
      submittedBy: req.user._id,
      title,
      description,
      repoUrl,
      demoUrl,
      techStack: techStack || [],
    });

    team.hasSubmitted = true;
    await team.save();

    res.status(201).json(submission);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/hackathons/:id/submissions/:sid — update (before deadline)
router.put('/:id/submissions/:sid', protect, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    if (new Date() > new Date(hackathon.submissionDeadline)) {
      return res.status(400).json({ message: 'Submission deadline passed' });
    }

    const submission = await HackathonSubmission.findOneAndUpdate(
      { _id: req.params.sid, submittedBy: req.user._id },
      req.body,
      { new: true }
    );
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── Scoring ──────────────────────────────────────────────────────────────────

// GET /api/hackathons/:id/scores — judge: my scores
router.get('/:id/scores', protect, isJudge, async (req, res) => {
  try {
    const scores = await JudgeScore.find({ hackathon: req.params.id, judge: req.user._id })
      .populate('submission', 'title team')
      .sort('-createdAt');
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/hackathons/:id/scores — judge: upsert score
router.post('/:id/scores', protect, isJudge, async (req, res) => {
  try {
    const { submissionId, scores, feedback } = req.body;

    const judgeScore = await JudgeScore.findOneAndUpdate(
      { hackathon: req.params.id, submission: submissionId, judge: req.user._id },
      {
        hackathon: req.params.id,
        submission: submissionId,
        judge: req.user._id,
        scores,
        feedback: feedback || '',
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Recompute submission's average totalScore across all judges
    const allScores = await JudgeScore.find({
      hackathon: req.params.id,
      submission: submissionId,
    });

    const avgScore =
      allScores.length > 0
        ? allScores.reduce((sum, s) => sum + s.totalScore, 0) / allScores.length
        : 0;

    await HackathonSubmission.findByIdAndUpdate(submissionId, { totalScore: avgScore });

    // Emit live leaderboard update
    const io = req.app.get('io');
    if (io) {
      const leaderboard = await HackathonSubmission.find({ hackathon: req.params.id })
        .populate({ path: 'team', select: 'name' })
        .sort({ totalScore: -1 })
        .select('title totalScore team rank');

      io.to(`hackathon:${req.params.id}`).emit('hackathon:leaderboard:update', {
        hackathonId: req.params.id,
        leaderboard,
        updatedAt: new Date(),
      });
    }

    res.json(judgeScore);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── Leaderboard ──────────────────────────────────────────────────────────────

// GET /api/hackathons/:id/leaderboard — judging/completed phase only
router.get('/:id/leaderboard', protect, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    if (!['judging', 'completed'].includes(hackathon.status)) {
      return res.status(403).json({ message: 'Leaderboard available during judging/completed phase' });
    }

    const submissions = await HackathonSubmission.find({ hackathon: req.params.id })
      .populate({ path: 'team', populate: { path: 'members.user leader', select: 'name avatar' } })
      .sort({ totalScore: -1 });

    // Add rank
    const ranked = submissions.map((s, i) => ({
      ...s.toObject(),
      rank: i + 1,
    }));

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
