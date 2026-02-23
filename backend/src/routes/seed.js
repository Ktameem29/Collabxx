/**
 * Seed route — protected by SEED_SECRET header
 * POST /api/seed                — seed only if DB is empty
 * POST /api/seed?force=true     — wipe and re-seed
 */
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const University          = require('../models/University');
const User                = require('../models/User');
const Hackathon           = require('../models/Hackathon');
const HackathonTeam       = require('../models/HackathonTeam');
const HackathonSubmission = require('../models/HackathonSubmission');

router.post('/', async (req, res) => {
  // Secret guard
  const secret = process.env.SEED_SECRET;
  if (!secret || req.headers['x-seed-secret'] !== secret) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const force = req.query.force === 'true';

  if (!force) {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Already seeded — use ?force=true to re-seed', admin: existingAdmin.email });
    }
  } else {
    // Wipe collections before re-seeding
    await Promise.all([
      University.deleteMany({}),
      User.deleteMany({}),
      Hackathon.deleteMany({}),
      HackathonTeam.deleteMany({}),
      HackathonSubmission.deleteMany({}),
    ]);
  }

  const hash = await bcrypt.hash('password123', 10);

  // ── Universities ──────────────────────────────────────────────────────────────
  const unis = await University.insertMany([
    // Bangalore
    { name: 'Presidency University',               domain: 'presidency.edu.in',      maxStudents: 50,  currentStudentCount: 4, description: 'Premier private university known for engineering and management programmes.', location: 'Bangalore, Karnataka', isActive: true },
    { name: 'Indian Institute of Science (IISc)',  domain: 'iisc.ac.in',             maxStudents: 100, currentStudentCount: 0, description: "India's top research institution — ranked #1 in research output.",            location: 'Bangalore, Karnataka', isActive: true },
    { name: 'RV College of Engineering',           domain: 'rvce.edu.in',            maxStudents: 80,  currentStudentCount: 0, description: "One of Bangalore's oldest and most reputed engineering colleges.",            location: 'Bangalore, Karnataka', isActive: true },
    { name: 'BMS College of Engineering',          domain: 'bmsce.ac.in',            maxStudents: 80,  currentStudentCount: 0, description: 'Autonomous engineering institution affiliated with VTU, est. 1946.',         location: 'Bangalore, Karnataka', isActive: true },
    { name: 'PES University',                      domain: 'pes.edu',                maxStudents: 70,  currentStudentCount: 0, description: 'Known for strong industry connections and innovation culture.',               location: 'Bangalore, Karnataka', isActive: true },
    { name: 'MS Ramaiah Institute of Technology',  domain: 'msrit.edu',              maxStudents: 80,  currentStudentCount: 0, description: 'Autonomous VTU-affiliated institute with strong placement record.',           location: 'Bangalore, Karnataka', isActive: true },
    { name: 'Dayananda Sagar University',          domain: 'dsu.edu.in',             maxStudents: 60,  currentStudentCount: 0, description: 'Multi-disciplinary university with focus on engineering and sciences.',       location: 'Bangalore, Karnataka', isActive: true },
    { name: 'Bangalore Institute of Technology',   domain: 'bit-bangalore.edu.in',   maxStudents: 60,  currentStudentCount: 0, description: 'Government-aided autonomous institution since 1979.',                        location: 'Bangalore, Karnataka', isActive: true },
    { name: 'Jain University',                     domain: 'jainuniversity.ac.in',   maxStudents: 60,  currentStudentCount: 0, description: 'Deemed-to-be university offering diverse programmes across faculties.',       location: 'Bangalore, Karnataka', isActive: true },
    { name: 'Manipal Institute of Technology',     domain: 'manipal.edu',            maxStudents: 90,  currentStudentCount: 0, description: 'Top-ranked private engineering college under Manipal Academy.',               location: 'Manipal, Karnataka',   isActive: true },
    // Mumbai
    { name: 'IIT Bombay',                          domain: 'iitb.ac.in',             maxStudents: 100, currentStudentCount: 0, description: "India's leading institute of technology — top 5 globally among Indian institutions.", location: 'Mumbai, Maharashtra', isActive: true },
    { name: 'University of Mumbai',                domain: 'mu.ac.in',               maxStudents: 100, currentStudentCount: 0, description: "One of India's largest universities with 700+ affiliated colleges.",           location: 'Mumbai, Maharashtra', isActive: true },
    { name: 'VJTI Mumbai',                         domain: 'vjti.ac.in',             maxStudents: 80,  currentStudentCount: 0, description: 'Veermata Jijabai Technological Institute — premier government engineering college.', location: 'Mumbai, Maharashtra', isActive: true },
    { name: 'NMIMS University',                    domain: 'nmims.edu',              maxStudents: 70,  currentStudentCount: 0, description: 'Narsee Monjee Institute of Management Studies — top management and tech university.', location: 'Mumbai, Maharashtra', isActive: true },
    { name: 'Thadomal Shahani Engineering College',domain: 'tsec.edu.in',            maxStudents: 60,  currentStudentCount: 0, description: 'Autonomous engineering college affiliated with University of Mumbai.',         location: 'Mumbai, Maharashtra', isActive: true },
    { name: 'DJ Sanghvi College of Engineering',   domain: 'djsce.ac.in',            maxStudents: 60,  currentStudentCount: 0, description: "One of Mumbai's most sought-after private engineering colleges.",              location: 'Mumbai, Maharashtra', isActive: true },
    { name: 'Sardar Patel Institute of Technology',domain: 'spit.ac.in',             maxStudents: 50,  currentStudentCount: 0, description: 'Autonomous college known for research and innovation clubs.',                 location: 'Mumbai, Maharashtra', isActive: true },
    { name: 'KJ Somaiya Institute of Engineering', domain: 'somaiya.edu',            maxStudents: 60,  currentStudentCount: 0, description: 'Part of Somaiya Vidyavihar University, strong in CS and IT.',               location: 'Mumbai, Maharashtra', isActive: true },
    // Others
    { name: 'Delhi Tech Institute',                domain: 'dti.ac.in',              maxStudents: 30,  currentStudentCount: 3, description: 'Engineering and innovation hub in the capital.',                             location: 'Delhi, India',        isActive: true },
    { name: 'BITS Pilani',                         domain: 'bits-pilani.ac.in',      maxStudents: 80,  currentStudentCount: 0, description: "Birla Institute of Technology and Science — India's top deemed university.", location: 'Pilani, Rajasthan',   isActive: true },
    { name: 'VIT University',                      domain: 'vit.ac.in',              maxStudents: 60,  currentStudentCount: 0, description: 'Vellore Institute of Technology — known for tech fest and vibrant campus.',  location: 'Vellore, Tamil Nadu', isActive: true },
  ]);

  const uniA    = unis[0];  // Presidency University
  const uniB    = unis[18]; // Delhi Tech Institute
  const allIds  = unis.map((u) => u._id);

  // ── Users ─────────────────────────────────────────────────────────────────────
  const [admin, judge, s1, s2, s3, s4, s5, s6] = await User.insertMany([
    { name: 'Admin User',   email: 'admin@collabxx.com',      password: hash, role: 'admin',   isActive: true, meritScore: 0 },
    { name: 'Judge Sarah',  email: 'judge@collabxx.com',      password: hash, role: 'judge',   university: uniA._id, isActive: true, meritScore: 0 },
    { name: 'Alice Sharma', email: 'alice@presidency.edu.in', password: hash, role: 'student', university: uniA._id, isActive: true, meritScore: 120, meritBreakdown: { projectCompletions: 3, tasksCompleted: 15, hackathonWins: 1, hackathonParticipations: 2 } },
    { name: 'Bob Verma',    email: 'bob@presidency.edu.in',   password: hash, role: 'student', university: uniA._id, isActive: true, meritScore: 80,  meritBreakdown: { projectCompletions: 2, tasksCompleted: 10, hackathonWins: 0, hackathonParticipations: 2 } },
    { name: 'Carol Nair',   email: 'carol@presidency.edu.in', password: hash, role: 'student', university: uniA._id, isActive: true, meritScore: 60,  meritBreakdown: { projectCompletions: 1, tasksCompleted: 8,  hackathonWins: 0, hackathonParticipations: 1 } },
    { name: 'David Mehta',  email: 'david@dti.ac.in',         password: hash, role: 'student', university: uniB._id, isActive: true, meritScore: 200, meritBreakdown: { projectCompletions: 4, tasksCompleted: 20, hackathonWins: 2, hackathonParticipations: 3 } },
    { name: 'Eva Singh',    email: 'eva@dti.ac.in',           password: hash, role: 'student', university: uniB._id, isActive: true, meritScore: 50,  meritBreakdown: { projectCompletions: 1, tasksCompleted: 5,  hackathonWins: 0, hackathonParticipations: 1 } },
    { name: 'Frank Patel',  email: 'frank@dti.ac.in',         password: hash, role: 'student', university: uniB._id, isActive: true, meritScore: 30,  meritBreakdown: { projectCompletions: 0, tasksCompleted: 5,  hackathonWins: 0, hackathonParticipations: 1 } },
  ]);

  // ── Hackathons ────────────────────────────────────────────────────────────────
  const now = new Date();
  const [h1] = await Hackathon.insertMany([
    {
      title: 'Inter-College Innovate 2025',
      description: 'Build something amazing in 48 hours. Open to all university students across Bangalore, Mumbai and beyond!',
      startDate: new Date(now.getTime() - 3 * 864e5),
      endDate: new Date(now.getTime() + 4 * 864e5),
      submissionDeadline: new Date(now.getTime() + 2 * 864e5),
      maxTeamSize: 3, minTeamSize: 1,
      participatingUniversities: allIds,
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
      description: 'Use AI/ML to solve real-world problems — healthcare, education, environment. Open to IISc, IIT Bombay, and partner universities.',
      startDate: new Date(now.getTime() + 7 * 864e5),
      endDate: new Date(now.getTime() + 9 * 864e5),
      submissionDeadline: new Date(now.getTime() + 8.5 * 864e5),
      maxTeamSize: 4, minTeamSize: 2,
      participatingUniversities: allIds.slice(0, 12),
      prizes: [
        { place: 1, title: '🥇 Grand Prize', description: '₹1,00,000 + internship opportunity' },
        { place: 2, title: '🥈 Runner Up',   description: '₹50,000' },
      ],
      status: 'upcoming', judges: [judge._id], createdBy: admin._id,
      coverColor: '#10B981', isPublic: true,
    },
    {
      title: 'Web3 & Blockchain Challenge',
      description: 'Build decentralized applications, smart contracts, or blockchain-based solutions.',
      startDate: new Date(now.getTime() - 10 * 864e5),
      endDate: new Date(now.getTime() - 2 * 864e5),
      submissionDeadline: new Date(now.getTime() - 3 * 864e5),
      maxTeamSize: 3, minTeamSize: 1,
      participatingUniversities: allIds.slice(10, 21),
      prizes: [
        { place: 1, title: '🥇 Best dApp',     description: '$2,000 in ETH' },
        { place: 2, title: '🥈 Best Contract', description: '$1,000 in ETH' },
      ],
      status: 'judging', judges: [judge._id], createdBy: admin._id,
      coverColor: '#F59E0B', isPublic: true,
    },
  ]);

  // ── Teams & Submissions ───────────────────────────────────────────────────────
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
      description: 'AI-powered platform tracking learning, identifying weak areas, and recommending personalised study plans.',
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
    universities: unis.length,
    hackathons: 3,
    teams: 3,
    submissions: 2,
    credentials: {
      admin:   'admin@collabxx.com / password123',
      judge:   'judge@collabxx.com / password123',
      students: [
        'alice@presidency.edu.in / password123  (merit: 120)',
        'bob@presidency.edu.in / password123    (merit: 80)',
        'carol@presidency.edu.in / password123  (merit: 60)',
        'david@dti.ac.in / password123          (merit: 200)',
        'eva@dti.ac.in / password123            (merit: 50)',
        'frank@dti.ac.in / password123          (merit: 30)',
      ],
    },
  });
});

module.exports = router;
