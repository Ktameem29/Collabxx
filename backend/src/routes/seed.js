/**
 * One-time seed route — disabled automatically after first run
 * POST /api/seed  with header  x-seed-secret: <SEED_SECRET env var>
 */
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const University        = require('../models/University');
const User              = require('../models/User');
const Hackathon         = require('../models/Hackathon');
const HackathonTeam     = require('../models/HackathonTeam');
const HackathonSubmission = require('../models/HackathonSubmission');

router.post('/', async (req, res) => {
  // Secret guard
  const secret = process.env.SEED_SECRET;
  if (!secret || req.headers['x-seed-secret'] !== secret) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // Only run if DB is empty
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    return res.status(409).json({ message: 'Already seeded', admin: existingAdmin.email });
  }

  const hash = await bcrypt.hash('password123', 10);

  // ── Universities ─────────────────────────────────────────────
  const [uniA, uniB, uniC, uniD, uniE] = await University.insertMany([
    { name: 'Presidency University', domain: 'presidency.edu.in', maxStudents: 50, currentStudentCount: 4, description: 'Premier tech university in Bangalore', location: 'Bangalore, India', isActive: true },
    { name: 'Delhi Tech Institute',  domain: 'dti.ac.in',          maxStudents: 30, currentStudentCount: 3, description: 'Engineering and innovation hub',      location: 'Delhi, India',     isActive: true },
    { name: 'IIT Bombay',            domain: 'iitb.ac.in',         maxStudents: 100, currentStudentCount: 0, description: "India's leading institute of technology", location: 'Mumbai, India',  isActive: true },
    { name: 'BITS Pilani',           domain: 'bits-pilani.ac.in',  maxStudents: 80,  currentStudentCount: 0, description: 'Birla Institute of Technology and Science', location: 'Pilani, India', isActive: true },
    { name: 'VIT University',        domain: 'vit.ac.in',          maxStudents: 60,  currentStudentCount: 0, description: 'Vellore Institute of Technology',    location: 'Vellore, India',   isActive: true },
  ]);

  // ── Users ─────────────────────────────────────────────────────
  const [admin, judge, s1, s2, s3, s4, s5, s6] = await User.insertMany([
    { name: 'Admin User',   email: 'admin@collabxx.com',          password: hash, role: 'admin',   isActive: true, meritScore: 0 },
    { name: 'Judge Sarah',  email: 'judge@collabxx.com',          password: hash, role: 'judge',   university: uniA._id, isActive: true, meritScore: 0 },
    { name: 'Alice Sharma', email: 'alice@presidency.edu.in',     password: hash, role: 'student', university: uniA._id, isActive: true, meritScore: 120, meritBreakdown: { projectCompletions: 3, tasksCompleted: 15, hackathonWins: 1, hackathonParticipations: 2 } },
    { name: 'Bob Verma',    email: 'bob@presidency.edu.in',       password: hash, role: 'student', university: uniA._id, isActive: true, meritScore: 80,  meritBreakdown: { projectCompletions: 2, tasksCompleted: 10, hackathonWins: 0, hackathonParticipations: 2 } },
    { name: 'Carol Nair',   email: 'carol@presidency.edu.in',     password: hash, role: 'student', university: uniA._id, isActive: true, meritScore: 60,  meritBreakdown: { projectCompletions: 1, tasksCompleted: 8,  hackathonWins: 0, hackathonParticipations: 1 } },
    { name: 'David Mehta',  email: 'david@dti.ac.in',             password: hash, role: 'student', university: uniB._id, isActive: true, meritScore: 200, meritBreakdown: { projectCompletions: 4, tasksCompleted: 20, hackathonWins: 2, hackathonParticipations: 3 } },
    { name: 'Eva Singh',    email: 'eva@dti.ac.in',               password: hash, role: 'student', university: uniB._id, isActive: true, meritScore: 50,  meritBreakdown: { projectCompletions: 1, tasksCompleted: 5,  hackathonWins: 0, hackathonParticipations: 1 } },
    { name: 'Frank Patel',  email: 'frank@dti.ac.in',             password: hash, role: 'student', university: uniB._id, isActive: true, meritScore: 30,  meritBreakdown: { projectCompletions: 0, tasksCompleted: 5,  hackathonWins: 0, hackathonParticipations: 1 } },
  ]);

  // ── Hackathons ─────────────────────────────────────────────────
  const now = new Date();
  const [h1, h2, h3] = await Hackathon.insertMany([
    {
      title: 'Inter-College Innovate 2025',
      description: 'Build something amazing in 48 hours. Open to all university students. Best project wins cash prizes and merit points!',
      startDate: new Date(now.getTime() - 3 * 864e5),
      endDate: new Date(now.getTime() + 4 * 864e5),
      submissionDeadline: new Date(now.getTime() + 2 * 864e5),
      maxTeamSize: 3, minTeamSize: 1,
      participatingUniversities: [uniA._id, uniB._id, uniC._id, uniD._id, uniE._id],
      prizes: [
        { place: 1, title: '🥇 First Place',  description: '₹50,000 + 50 merit points' },
        { place: 2, title: '🥈 Second Place', description: '₹25,000 + 25 merit points' },
        { place: 3, title: '🥉 Third Place',  description: '₹10,000 + 10 merit points' },
      ],
      status: 'active', judges: [judge._id], createdBy: admin._id,
      coverColor: '#8B5CF6', isPublic: true,
    },
    {
      title: 'AI for Social Good Hackathon',
      description: 'Use AI/ML to solve real-world social problems. Healthcare, education, environment — your ideas can change the world.',
      startDate: new Date(now.getTime() + 7 * 864e5),
      endDate: new Date(now.getTime() + 9 * 864e5),
      submissionDeadline: new Date(now.getTime() + 8.5 * 864e5),
      maxTeamSize: 4, minTeamSize: 2,
      participatingUniversities: [uniA._id, uniB._id, uniC._id],
      prizes: [
        { place: 1, title: '🥇 Grand Prize',    description: '₹1,00,000 + internship opportunity' },
        { place: 2, title: '🥈 Runner Up',      description: '₹50,000' },
      ],
      status: 'upcoming', judges: [judge._id], createdBy: admin._id,
      coverColor: '#10B981', isPublic: true,
    },
    {
      title: 'Web3 & Blockchain Challenge',
      description: 'Build decentralized applications, smart contracts, or blockchain-based solutions. DeFi, NFTs, DAOs — all welcome.',
      startDate: new Date(now.getTime() - 10 * 864e5),
      endDate: new Date(now.getTime() - 2 * 864e5),
      submissionDeadline: new Date(now.getTime() - 3 * 864e5),
      maxTeamSize: 3, minTeamSize: 1,
      participatingUniversities: [uniC._id, uniD._id, uniE._id],
      prizes: [
        { place: 1, title: '🥇 Best dApp',    description: '$2,000 in ETH' },
        { place: 2, title: '🥈 Best Contract', description: '$1,000 in ETH' },
      ],
      status: 'judging', judges: [judge._id], createdBy: admin._id,
      coverColor: '#F59E0B', isPublic: true,
    },
  ]);

  // ── Teams & Submissions for h1 ─────────────────────────────────
  const teamAlpha = await HackathonTeam.create({
    hackathon: h1._id, name: 'Team Alpha', leader: s1._id,
    members: [{ user: s1._id, role: 'leader', joinedAt: now }, { user: s2._id, role: 'member', joinedAt: now }, { user: s3._id, role: 'member', joinedAt: now }],
    hasSubmitted: true,
  });
  const teamBeta = await HackathonTeam.create({
    hackathon: h1._id, name: 'Team Beta', leader: s4._id,
    members: [{ user: s4._id, role: 'leader', joinedAt: now }, { user: s5._id, role: 'member', joinedAt: now }],
    hasSubmitted: true,
  });
  await HackathonTeam.create({
    hackathon: h1._id, name: 'Solo Gamma', leader: s6._id,
    members: [{ user: s6._id, role: 'leader', joinedAt: now }],
    hasSubmitted: false,
  });

  await HackathonSubmission.insertMany([
    {
      hackathon: h1._id, team: teamAlpha._id, submittedBy: s1._id,
      title: 'EduTrack — AI Student Progress Monitor',
      description: 'AI-powered platform tracking student learning, identifying weak areas, and recommending personalised study plans using ML.',
      repoUrl: 'https://github.com/example/edutrack', demoUrl: 'https://edutrack-demo.vercel.app',
      techStack: ['React', 'Node.js', 'Python', 'TensorFlow', 'MongoDB'],
    },
    {
      hackathon: h1._id, team: teamBeta._id, submittedBy: s4._id,
      title: 'GreenChain — Carbon Credit Marketplace',
      description: 'Blockchain-based marketplace for trading verified carbon credits with real-time price discovery.',
      repoUrl: 'https://github.com/example/greenchain', demoUrl: 'https://greenchain.netlify.app',
      techStack: ['Next.js', 'Solidity', 'Ethereum', 'Express', 'PostgreSQL'],
    },
  ]);

  res.json({
    message: '✅ Seed complete',
    credentials: {
      admin:  'admin@collabxx.com / password123',
      judge:  'judge@collabxx.com / password123',
      students: ['alice@presidency.edu.in', 'david@dti.ac.in', 'bob@presidency.edu.in'],
      password: 'password123',
    },
    universities: 5,
    hackathons: 3,
    teams: 3,
    submissions: 2,
  });
});

module.exports = router;
