/**
 * Collabxx — Seed Script
 * Run: node src/seed.js
 * Creates: 36 institutions (universities + colleges + schools), admin + judge + 6 students, 3 hackathons
 */

require('dotenv').config();
const mongoose = require('mongoose');

const University          = require('./models/University');
const User                = require('./models/User');
const Hackathon           = require('./models/Hackathon');
const HackathonTeam       = require('./models/HackathonTeam');
const HackathonSubmission = require('./models/HackathonSubmission');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collabxx';

// ── Institution definitions ───────────────────────────────────────────────────
const INSTITUTIONS = [
  // ─ Bangalore Universities & Colleges ─────────────────────────────────────
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

  // ─ Near Bangalore (Karnataka surroundings) ────────────────────────────────
  { name: 'Manipal Institute of Technology',     domain: 'manipal.edu',            type: 'university', maxStudents: 90,  description: 'Top-ranked private engineering college under Manipal Academy.',               location: 'Manipal, Karnataka' },
  { name: 'JSS Science & Technology University', domain: 'jssstuniv.in',           type: 'university', maxStudents: 70,  description: 'Deemed university with strong research output and industry ties.',            location: 'Mysore, Karnataka' },
  { name: 'University of Mysore',                domain: 'uni-mysore.ac.in',       type: 'university', maxStudents: 80,  description: "One of Karnataka's oldest public universities, est. 1916.",                  location: 'Mysore, Karnataka' },
  { name: 'KLE Technological University',        domain: 'kletech.ac.in',          type: 'university', maxStudents: 70,  description: 'Deemed university focused on engineering and technology in north Karnataka.',  location: 'Hubli, Karnataka' },

  // ─ Mumbai Universities & Colleges ─────────────────────────────────────────
  { name: 'IIT Bombay',                          domain: 'iitb.ac.in',             type: 'university', maxStudents: 100, description: "India's leading institute of technology — top 5 globally among Indian institutions.", location: 'Mumbai, Maharashtra' },
  { name: 'University of Mumbai',                domain: 'mu.ac.in',               type: 'university', maxStudents: 100, description: "One of India's largest universities with 700+ affiliated colleges.",           location: 'Mumbai, Maharashtra' },
  { name: 'VJTI Mumbai',                         domain: 'vjti.ac.in',             type: 'college',    maxStudents: 80,  description: 'Veermata Jijabai Technological Institute — premier government engineering college.', location: 'Mumbai, Maharashtra' },
  { name: 'NMIMS University',                    domain: 'nmims.edu',              type: 'university', maxStudents: 70,  description: 'Narsee Monjee Institute of Management Studies — top management and tech university.', location: 'Mumbai, Maharashtra' },
  { name: 'Thadomal Shahani Engineering College',domain: 'tsec.edu.in',            type: 'college',    maxStudents: 60,  description: 'Autonomous engineering college affiliated with University of Mumbai.',         location: 'Mumbai, Maharashtra' },
  { name: 'DJ Sanghvi College of Engineering',   domain: 'djsce.ac.in',            type: 'college',    maxStudents: 60,  description: "One of Mumbai's most sought-after private engineering colleges.",              location: 'Mumbai, Maharashtra' },
  { name: 'Sardar Patel Institute of Technology',domain: 'spit.ac.in',             type: 'college',    maxStudents: 50,  description: 'Autonomous college known for research and innovation clubs.',                 location: 'Mumbai, Maharashtra' },
  { name: 'KJ Somaiya Institute of Engineering', domain: 'somaiya.edu',            type: 'university', maxStudents: 60,  description: 'Part of Somaiya Vidyavihar University, strong in CS and IT.',               location: 'Mumbai, Maharashtra' },
  { name: 'Fr. C Rodrigues Institute of Technology',domain: 'frcrce.ac.in',        type: 'college',    maxStudents: 50,  description: 'Autonomous institute affiliated with Mumbai University, strong in electronics.', location: 'Mumbai, Maharashtra' },

  // ─ Near Mumbai (Pune) ─────────────────────────────────────────────────────
  { name: 'College of Engineering Pune (COEP)',  domain: 'coep.org.in',            type: 'university', maxStudents: 80,  description: 'One of the oldest and most prestigious engineering colleges in Asia.',         location: 'Pune, Maharashtra' },
  { name: 'VIT Pune',                            domain: 'vit.edu.in',             type: 'college',    maxStudents: 70,  description: 'Vishwakarma Institute of Technology — autonomous college in Pune.',            location: 'Pune, Maharashtra' },
  { name: 'Symbiosis Institute of Technology',   domain: 'sitpune.edu.in',         type: 'university', maxStudents: 60,  description: 'Part of Symbiosis International University, strong in IT and design.',        location: 'Pune, Maharashtra' },
  { name: 'MIT World Peace University',          domain: 'mitwpu.edu.in',          type: 'university', maxStudents: 70,  description: 'Multi-disciplinary university known for engineering, management, and design.',  location: 'Pune, Maharashtra' },

  // ─ Others ─────────────────────────────────────────────────────────────────
  { name: 'Delhi Tech Institute',                domain: 'dti.ac.in',              type: 'college',    maxStudents: 30,  description: 'Engineering and innovation hub in the capital.',                             location: 'Delhi, India' },
  { name: 'BITS Pilani',                         domain: 'bits-pilani.ac.in',      type: 'university', maxStudents: 80,  description: "Birla Institute of Technology and Science — India's top deemed university.", location: 'Pilani, Rajasthan' },
  { name: 'VIT University',                      domain: 'vit.ac.in',              type: 'university', maxStudents: 60,  description: 'Vellore Institute of Technology — known for tech fest and vibrant campus.',  location: 'Vellore, Tamil Nadu' },

  // ─ Bangalore Schools ──────────────────────────────────────────────────────
  { name: 'National Public School Bangalore',    domain: 'nps.edu.in',             type: 'school',     maxStudents: 40,  description: "One of Bangalore's most prestigious CBSE schools with strong academic record.", location: 'Bangalore, Karnataka' },
  { name: 'Delhi Public School Bangalore',       domain: 'dpsbangalore.com',       type: 'school',     maxStudents: 40,  description: 'DPS franchise school known for academics, sports, and cultural activities.',  location: 'Bangalore, Karnataka' },
  { name: 'Bishop Cotton Boys School',           domain: 'bishopcotton.com',       type: 'school',     maxStudents: 30,  description: "Established 1865 — one of India's most historic and reputed boarding schools.", location: 'Bangalore, Karnataka' },
  { name: 'Greenwood High School',               domain: 'greenwoodhigh.com',      type: 'school',     maxStudents: 40,  description: 'International school with CBSE and IGCSE streams in East Bangalore.',        location: 'Bangalore, Karnataka' },

  // ─ Mumbai Schools ─────────────────────────────────────────────────────────
  { name: 'Dhirubhai Ambani International School',domain: 'dais.edu.in',           type: 'school',     maxStudents: 30,  description: 'IB school in BKC, consistently ranked among the best schools in India.',     location: 'Mumbai, Maharashtra' },
  { name: 'Cathedral and John Connon School',    domain: 'cathedral-school.com',   type: 'school',     maxStudents: 30,  description: "One of Mumbai's oldest English-medium schools, est. 1860.",                  location: 'Mumbai, Maharashtra' },
  { name: 'Bombay Scottish School',              domain: 'bombayscottish.net',     type: 'school',     maxStudents: 30,  description: "ICSE school in Mahim, one of Mumbai's most sought-after institutions.",     location: 'Mumbai, Maharashtra' },
  { name: 'Don Bosco High School Mumbai',        domain: 'donboscomumbai.in',      type: 'school',     maxStudents: 30,  description: 'Salesian institution known for holistic education and stellar alumni network.', location: 'Mumbai, Maharashtra' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // ── Wipe existing seed collections ──────────────────────────────────────────
  await Promise.all([
    University.deleteMany({}),
    User.deleteMany({}),
    Hackathon.deleteMany({}),
    HackathonTeam.deleteMany({}),
    HackathonSubmission.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ── Institutions ─────────────────────────────────────────────────────────────
  const unis = await University.insertMany(
    INSTITUTIONS.map((u) => ({ ...u, currentStudentCount: 0, isActive: true }))
  );
  console.log(`Institutions created: ${unis.length} (${unis.filter((u) => u.type === 'school').length} schools)`);

  // Convenience aliases
  const uniA = unis.find((u) => u.domain === 'presidency.edu.in');  // Presidency
  const uniB = unis.find((u) => u.domain === 'dti.ac.in');          // Delhi Tech
  const allIds = unis.map((u) => u._id);

  // Update student counts for seeded users
  await University.findByIdAndUpdate(uniA._id, { currentStudentCount: 4 });
  await University.findByIdAndUpdate(uniB._id, { currentStudentCount: 3 });

  // ── Users ─────────────────────────────────────────────────────────────────────
  const bcrypt = require('bcryptjs');
  const hash   = await bcrypt.hash('password123', 10);

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
  console.log('Users created');

  // ── Hackathons ────────────────────────────────────────────────────────────────
  const now = new Date();
  const [hackathon] = await Hackathon.insertMany([
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
      description: 'Use AI/ML to solve real-world problems — healthcare, education, environment. Open to IISc, IIT Bombay, and all partner institutions.',
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
      description: 'Build decentralized apps, smart contracts, or blockchain-based solutions. DeFi, NFTs, DAOs — all welcome.',
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
  console.log('Hackathons created (3)');

  // ── Teams ─────────────────────────────────────────────────────────────────────
  const teamAlpha = await HackathonTeam.create({
    hackathon: hackathon._id, name: 'Team Alpha', leader: s1._id,
    members: [{ user: s1._id, role: 'leader', joinedAt: new Date() }, { user: s2._id, role: 'member', joinedAt: new Date() }, { user: s3._id, role: 'member', joinedAt: new Date() }],
    hasSubmitted: true,
  });
  const teamBeta = await HackathonTeam.create({
    hackathon: hackathon._id, name: 'Team Beta', leader: s4._id,
    members: [{ user: s4._id, role: 'leader', joinedAt: new Date() }, { user: s5._id, role: 'member', joinedAt: new Date() }],
    hasSubmitted: true,
  });
  await HackathonTeam.create({
    hackathon: hackathon._id, name: 'Solo Gamma', leader: s6._id,
    members: [{ user: s6._id, role: 'leader', joinedAt: new Date() }],
    hasSubmitted: false,
  });
  console.log('Teams created');

  // ── Submissions ───────────────────────────────────────────────────────────────
  await HackathonSubmission.create({
    hackathon: hackathon._id, team: teamAlpha._id, submittedBy: s1._id,
    title: 'EduTrack — Student Progress Monitor',
    description: 'AI-powered platform tracking student learning, identifying weak areas, and recommending personalised study plans.',
    repoUrl: 'https://github.com/example/edutrack', demoUrl: 'https://edutrack-demo.vercel.app',
    techStack: ['React', 'Node.js', 'Python', 'TensorFlow', 'MongoDB'],
  });
  await HackathonSubmission.create({
    hackathon: hackathon._id, team: teamBeta._id, submittedBy: s4._id,
    title: 'GreenChain — Carbon Credit Marketplace',
    description: 'Blockchain-based marketplace for trading verified carbon credits with real-time price discovery.',
    repoUrl: 'https://github.com/example/greenchain', demoUrl: 'https://greenchain.netlify.app',
    techStack: ['Next.js', 'Solidity', 'Ethereum', 'Express', 'PostgreSQL'],
  });
  console.log('Submissions created');

  // ── Summary ────────────────────────────────────────────────────────────────────
  const blrUnis    = unis.filter((u) => u.location.includes('Bangalore') || u.location.includes('Karnataka'));
  const mumbaiUnis = unis.filter((u) => u.location.includes('Mumbai') || u.location.includes('Pune') || u.location.includes('Maharashtra'));
  const schools    = unis.filter((u) => u.type === 'school');

  console.log('\n✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🏛️  Institutions: ${unis.length} total`);
  console.log(`   Bangalore area (${blrUnis.length}): ${blrUnis.map((u) => u.name).join(', ')}`);
  console.log(`   Mumbai/Pune    (${mumbaiUnis.length}): ${mumbaiUnis.map((u) => u.name).join(', ')}`);
  console.log(`   🏫 Schools (${schools.length}): ${schools.map((u) => u.name).join(', ')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Login credentials (all passwords: password123)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 Admin  : admin@collabxx.com');
  console.log('⚖️  Judge  : judge@collabxx.com');
  console.log('🎓 Student: alice@presidency.edu.in  (merit: 120)');
  console.log('🎓 Student: david@dti.ac.in          (merit: 200)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
