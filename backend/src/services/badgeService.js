const User = require('../models/User');

const BADGE_DEFINITIONS = [
  { id: 'first_task', name: 'First Blood', icon: '⚔️', description: 'Complete your first task' },
  { id: 'task_master', name: 'Task Master', icon: '✅', description: 'Complete 10 tasks' },
  { id: 'task_legend', name: 'Task Legend', icon: '🌟', description: 'Complete 50 tasks' },
  { id: 'team_player', name: 'Team Player', icon: '🤝', description: 'Join your first project' },
  { id: 'project_builder', name: 'Project Builder', icon: '🏗️', description: 'Complete 1 project' },
  { id: 'serial_builder', name: 'Serial Builder', icon: '🏭', description: 'Complete 3 projects' },
  { id: 'hackathon_rookie', name: 'Hackathon Rookie', icon: '🎮', description: 'Join your first hackathon' },
  { id: 'hackathon_veteran', name: 'Hackathon Veteran', icon: '🎖️', description: 'Participate in 3 hackathons' },
  { id: 'winner', name: 'Champion', icon: '🏆', description: 'Win a hackathon' },
  { id: 'merit_rising', name: 'Rising Star', icon: '⭐', description: 'Reach 100 merit points' },
  { id: 'merit_elite', name: 'Elite', icon: '💎', description: 'Reach 500 merit points' },
];

const checkCriteria = (badgeId, stats) => {
  const { tasksCompleted, projectCompletions, hackathonParticipations, hackathonWins } = stats.meritBreakdown;
  const { meritScore, projectParticipations } = stats;
  switch (badgeId) {
    case 'first_task': return tasksCompleted >= 1;
    case 'task_master': return tasksCompleted >= 10;
    case 'task_legend': return tasksCompleted >= 50;
    case 'team_player': return projectParticipations >= 1;
    case 'project_builder': return projectCompletions >= 1;
    case 'serial_builder': return projectCompletions >= 3;
    case 'hackathon_rookie': return hackathonParticipations >= 1;
    case 'hackathon_veteran': return hackathonParticipations >= 3;
    case 'winner': return hackathonWins >= 1;
    case 'merit_rising': return meritScore >= 100;
    case 'merit_elite': return meritScore >= 500;
    default: return false;
  }
};

const checkAndAwardBadges = async (userId, stats) => {
  const user = await User.findById(userId).select('badges');
  if (!user) return [];

  const existingIds = new Set(user.badges.map((b) => b.id));
  const newBadges = [];

  for (const def of BADGE_DEFINITIONS) {
    if (!existingIds.has(def.id) && checkCriteria(def.id, stats)) {
      newBadges.push({ id: def.id, earnedAt: new Date() });
    }
  }

  if (newBadges.length > 0) {
    await User.findByIdAndUpdate(userId, { $push: { badges: { $each: newBadges } } });
  }

  // Return enriched badges with full definition metadata
  return newBadges.map((b) => ({
    ...b,
    ...BADGE_DEFINITIONS.find((d) => d.id === b.id),
  }));
};

module.exports = { BADGE_DEFINITIONS, checkAndAwardBadges };
