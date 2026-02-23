/**
 * Seed route — protected by admin JWT
 * POST /api/seed                — seed only if DB is empty
 * POST /api/seed?force=true     — wipe and re-seed
 */
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const { protect } = require('../middleware/auth');
const University          = require('../models/University');
const User                = require('../models/User');
const Hackathon           = require('../models/Hackathon');
const HackathonTeam       = require('../models/HackathonTeam');
const HackathonSubmission = require('../models/HackathonSubmission');

// ── Institution definitions ──────────────────────────────────────────────────
const INSTITUTIONS = [
  // Bangalore Universities & Colleges
  { name: 'Presidency University',               domain: 'presidency.edu.in',      type: 'university', maxStudents: 50,  description: 'Premier private university known for engineering and management programmes.', location: 'Bangalore, Karnataka' },
  { name: 'Indian Institute of Science (IISc)',  domain: 'iisc.ac.in',             type: 'university', maxStudents: 100, description: "India's top research institution — ranked #1 in research output.",            location: 'Bangalore, Karnataka' },
  { name: 'RV College of Engineering',           domain: 'rvce.edu.in',            type: 'college',    maxStudents: 80,  description: "One of Bangalore's oldest and most reputed engineering colleges.",            location: 'Bangalore, Karnataka' },
  { name: 'BMS College of Engineering',          domain: 'bmsce.ac.in',            type: 'college',    maxStudents: 80,  description: 'Autonomous engineering institution affiliated with VTU, est. 1946.',         location: 'Bangalore, Karnataka' },
  { name: 'PES University',                      domain: 'pes.edu',                type: 'university', maxStudents: 70,  description: 'Known for strong industry connections and innovation culture.',               location: 'Bangalore, Karnataka' },
  { name: 'MS Ramaiah Institute of Technology',  domain: 'msrit.edu',              type: 'college',    maxStudents: 80,  description: 'Autonomous VTU-affiliated institute with strong placement record.',           location: 'Bangalore, Karnataka' },
  { name: 'Dayananda Sagar University',          domain: 'dsu.edu.in',             type: 'university', maxStudents: 60,  description: 'Multi-disciplinary university with focus on engineering and sciences.',       location: 'Bangalore, Karnataka' },
  { name: 'Bangalore Institute of Technology',   domain: 'bit-bangalore.edu.in',   type: 'college',    maxStudents: 60,  description: 'Government-aided autonomous institution since 1979.',                        location: 'Bangalore, Karnataka' },
  { name: 'Jain University',                     domain: 'jainuniversity.ac.in',   type: 'university', maxStudents: 60,  description: 'Deemed-to-be university offering diverse programmes across faculties.',       location: 'Bangalore, Karnataka' },
  { name: 'New Horizon College of Engineering',  domain: 'newhorizonindia.edu',    type: 'college',    maxStudents: 60,  description: 'VTU-affiliated college known for innovation and entrepreneurship.',           location: 'Bangalore, Karnataka' },
  { name: 'Sir M Visvesvaraya Institute of Tech',domain: 'sirmvit.edu',            type: 'college',    maxStudents: 60,  description: 'Autonomous institute named after the renowned engineer-statesman.',          location: 'Bangalore, Karnataka' },
  // Near Bangalore (Karnataka)
  { name: 'Manipal Institute of Technology',     domain: 'manipal.edu',            type: 'university', maxStudents: 90,  description: 'Top-ranked private engineering college under Manipal Academy.',               location: 'Manipal, Karnataka' },
  { name: 'JSS Science & Technology University', domain: 'jssstuniv.in',           type: 'university', maxStudents: 70,  description: 'Deemed university with strong research output and industry ties.',            location: 'Mysore, Karnataka' },
  { name: 'University of Mysore',                domain: 'uni-mysore.ac.in',       type: 'university', maxStudents: 80,  description: "One of Karnataka's oldest public universities, est. 1916.",                  location: 'Mysore, Karnataka' },
  { name: 'KLE Technological University',        domain: 'kletech.ac.in',          type: 'university', maxStudents: 70,  description: 'Deemed university focused on engineering in north Karnataka.',                location: 'Hubli, Karnataka' },
  // Mumbai Universities & Colleges
  { name: 'IIT Bombay',                          domain: 'iitb.ac.in',             type: 'university', maxStudents: 100, description: "India's leading institute of technology — top 5 globally among Indian institutions.", location: 'Mumbai, Maharashtra' },
  { name: 'University of Mumbai',                domain: 'mu.ac.in',               type: 'university', maxStudents: 100, description: "One of India's largest universities with 700+ affiliated colleges.",           location: 'Mumbai, Maharashtra' },
  { name: 'VJTI Mumbai',                         domain: 'vjti.ac.in',             type: 'college',    maxStudents: 80,  description: 'Veermata Jijabai Technological Institute — premier government engineering college.', location: 'Mumbai, Maharashtra' },
  { name: 'NMIMS University',                    domain: 'nmims.edu',              type: 'university', maxStudents: 70,  description: 'Narsee Monjee Institute — top management and tech university.',                location: 'Mumbai, Maharashtra' },
  { name: 'Thadomal Shahani Engineering College',domain: 'tsec.edu.in',            type: 'college',    maxStudents: 60,  description: 'Autonomous engineering college affiliated with University of Mumbai.',         location: 'Mumbai, Maharashtra' },
  { name: 'DJ Sanghvi College of Engineering',   domain: 'djsce.ac.in',            type: 'college',    maxStudents: 60,  description: "One of Mumbai's most sought-after private engineering colleges.",              location: 'Mumbai, Maharashtra' },
  { name: 'Sardar Patel Institute of Technology',domain: 'spit.ac.in',             type: 'college',    maxStudents: 50,  description: 'Autonomous college known for research and innovation clubs.',                 location: 'Mumbai, Maharashtra' },
  { name: 'KJ Somaiya Institute of Engineering', domain: 'somaiya.edu',            type: 'university', maxStudents: 60,  description: 'Part of Somaiya Vidyavihar University, strong in CS and IT.',               location: 'Mumbai, Maharashtra' },
  { name: 'Fr. C Rodrigues Institute of Technology',domain: 'frcrce.ac.in',        type: 'college',    maxStudents: 50,  description: 'Autonomous institute affiliated with Mumbai University.',                     location: 'Mumbai, Maharashtra' },
  // Near Mumbai (Pune)
  { name: 'College of Engineering Pune (COEP)',  domain: 'coep.org.in',            type: 'university', maxStudents: 80,  description: 'One of the oldest and most prestigious engineering colleges in Asia.',         location: 'Pune, Maharashtra' },
  { name: 'VIT Pune',                            domain: 'vit.edu.in',             type: 'college',    maxStudents: 70,  description: 'Vishwakarma Institute of Technology — autonomous college in Pune.',            location: 'Pune, Maharashtra' },
  { name: 'Symbiosis Institute of Technology',   domain: 'sitpune.edu.in',         type: 'university', maxStudents: 60,  description: 'Part of Symbiosis International University, strong in IT and design.',        location: 'Pune, Maharashtra' },
  { name: 'MIT World Peace University',          domain: 'mitwpu.edu.in',          type: 'university', maxStudents: 70,  description: 'Multi-disciplinary university known for engineering, management, and design.',  location: 'Pune, Maharashtra' },
  // Others
  { name: 'Delhi Tech Institute',                domain: 'dti.ac.in',              type: 'college',    maxStudents: 30,  description: 'Engineering and innovation hub in the capital.',                             location: 'Delhi, India' },
  { name: 'BITS Pilani',                         domain: 'bits-pilani.ac.in',      type: 'university', maxStudents: 80,  description: "Birla Institute of Technology and Science — India's top deemed university.", location: 'Pilani, Rajasthan' },
  { name: 'VIT University',                      domain: 'vit.ac.in',              type: 'university', maxStudents: 60,  description: 'Vellore Institute of Technology — known for tech fest and vibrant campus.',  location: 'Vellore, Tamil Nadu' },
  // Bangalore Schools
  { name: 'National Public School Bangalore',    domain: 'nps.edu.in',             type: 'school',     maxStudents: 40,  description: "One of Bangalore's most prestigious CBSE schools.",                          location: 'Bangalore, Karnataka' },
  { name: 'Delhi Public School Bangalore',       domain: 'dpsbangalore.com',       type: 'school',     maxStudents: 40,  description: 'DPS franchise school known for academics, sports, and cultural activities.',  location: 'Bangalore, Karnataka' },
  { name: 'Bishop Cotton Boys School',           domain: 'bishopcotton.com',       type: 'school',     maxStudents: 30,  description: "Established 1865 — one of India's most historic boarding schools.",           location: 'Bangalore, Karnataka' },
  { name: 'Greenwood High School',               domain: 'greenwoodhigh.com',      type: 'school',     maxStudents: 40,  description: 'International school with CBSE and IGCSE streams in East Bangalore.',        location: 'Bangalore, Karnataka' },
  // Mumbai Schools
  { name: 'Dhirubhai Ambani International School',domain: 'dais.edu.in',           type: 'school',     maxStudents: 30,  description: 'IB school in BKC, ranked among the best schools in India.',                  location: 'Mumbai, Maharashtra' },
  { name: 'Cathedral and John Connon School',    domain: 'cathedral-school.com',   type: 'school',     maxStudents: 30,  description: "One of Mumbai's oldest English-medium schools, est. 1860.",                  location: 'Mumbai, Maharashtra' },
  { name: 'Bombay Scottish School',              domain: 'bombayscottish.net',     type: 'school',     maxStudents: 30,  description: "ICSE school in Mahim — one of Mumbai's most sought-after institutions.",     location: 'Mumbai, Maharashtra' },
  { name: 'Don Bosco High School Mumbai',        domain: 'donboscomumbai.in',      type: 'school',     maxStudents: 30,  description: 'Salesian institution known for holistic education and stellar alumni network.', location: 'Mumbai, Maharashtra' },
];

router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  const force = req.query.force === 'true';

  if (!force) {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Already seeded — use ?force=true to re-seed', admin: existingAdmin.email });
    }
  } else {
    await Promise.all([
      University.deleteMany({}),
      User.deleteMany({}),
      Hackathon.deleteMany({}),
      HackathonTeam.deleteMany({}),
      HackathonSubmission.deleteMany({}),
    ]);
  }

  const hash = await bcrypt.hash('password123', 10);

  // ── Institutions ─────────────────────────────────────────────────────────────
  const unis = await University.insertMany(
    INSTITUTIONS.map((u) => ({ ...u, currentStudentCount: 0, isActive: true }))
  );

  const uniA = unis.find((u) => u.domain === 'presidency.edu.in');
  const uniB = unis.find((u) => u.domain === 'dti.ac.in');
  const allIds = unis.map((u) => u._id);

  await University.findByIdAndUpdate(uniA._id, { currentStudentCount: 4 });
  await University.findByIdAndUpdate(uniB._id, { currentStudentCount: 3 });

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
      description: 'Build something amazing in 48 hours. Open to all students across Bangalore, Mumbai, Pune and beyond!',
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
      description: 'Use AI/ML to solve real-world problems. Open to IISc, IIT Bombay, and all partner institutions.',
      startDate: new Date(now.getTime() + 7 * 864e5),
      endDate: new Date(now.getTime() + 9 * 864e5),
      submissionDeadline: new Date(now.getTime() + 8.5 * 864e5),
      maxTeamSize: 4, minTeamSize: 2,
      participatingUniversities: allIds.filter((_, i) => i < 20),
      prizes: [
        { place: 1, title: '🥇 Grand Prize', description: '₹1,00,000 + internship opportunity' },
        { place: 2, title: '🥈 Runner Up',   description: '₹50,000' },
      ],
      status: 'upcoming', judges: [judge._id], createdBy: admin._id,
      coverColor: '#10B981', isPublic: true,
    },
    {
      title: 'Web3 & Blockchain Challenge',
      description: 'Build decentralized apps, smart contracts, or blockchain-based solutions.',
      startDate: new Date(now.getTime() - 10 * 864e5),
      endDate: new Date(now.getTime() - 2 * 864e5),
      submissionDeadline: new Date(now.getTime() - 3 * 864e5),
      maxTeamSize: 3, minTeamSize: 1,
      participatingUniversities: allIds.filter((_, i) => i >= 15 && i < 32),
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
    institutions: unis.length,
    schools: unis.filter((u) => u.type === 'school').length,
    hackathons: 3, teams: 3, submissions: 2,
    credentials: {
      admin:   'admin@collabxx.com / password123',
      judge:   'judge@collabxx.com / password123',
      students: [
        'alice@presidency.edu.in / password123  (merit: 120)',
        'david@dti.ac.in / password123          (merit: 200)',
      ],
    },
  });
});

module.exports = router;
