const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const HackathonTeam = require('../models/HackathonTeam');
const { checkAndAwardBadges } = require('./badgeService');

/**
 * Merit score formula:
 *   projectCompletions × 10
 *   + tasksCompleted × 2
 *   + hackathonWins × 50
 *   + hackathonParticipations × 10
 */
const recalculateMeritForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  // Count completed projects where user is owner or member
  const projectCompletions = await Project.countDocuments({
    status: 'completed',
    $or: [{ owner: userId }, { 'members.user': userId }],
  });

  // Count all projects (any status) where user is owner or member (for team_player badge)
  const projectParticipations = await Project.countDocuments({
    $or: [{ owner: userId }, { 'members.user': userId }],
  });

  // Count tasks with status 'done' assigned to this user
  const tasksCompleted = await Task.countDocuments({
    status: 'done',
    assignedTo: userId,
  });

  // Count hackathon teams where user participated (any status)
  const participatingTeams = await HackathonTeam.find({
    'members.user': userId,
    isDisqualified: false,
  }).select('_id');
  const hackathonParticipations = participatingTeams.length;

  // Count hackathon wins: need to check hackathon winners array
  // A win is when the team the user was on is listed as a winner
  const Hackathon = require('../models/Hackathon');
  const teamIds = participatingTeams.map((t) => t._id);

  let hackathonWins = 0;
  if (teamIds.length > 0) {
    const wonHackathons = await Hackathon.countDocuments({
      'winners.team': { $in: teamIds },
    });
    hackathonWins = wonHackathons;
  }

  const meritBreakdown = {
    projectCompletions,
    tasksCompleted,
    hackathonWins,
    hackathonParticipations,
  };

  const meritScore =
    projectCompletions * 10 +
    tasksCompleted * 2 +
    hackathonWins * 50 +
    hackathonParticipations * 10;

  await User.findByIdAndUpdate(userId, { meritScore, meritBreakdown });

  const newBadges = await checkAndAwardBadges(userId, { meritScore, meritBreakdown, projectParticipations });

  return { meritScore, meritBreakdown, newBadges };
};

const recalculateMeritForAllMembers = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) return;

  const userIds = [
    project.owner,
    ...project.members.map((m) => m.user),
  ];

  await Promise.all(userIds.map((id) => recalculateMeritForUser(id)));
};

module.exports = { recalculateMeritForUser, recalculateMeritForAllMembers };
