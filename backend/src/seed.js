/**
 * Collabxx — Seed Script
 * Run: node src/seed.js
 * Creates: 18 universities (Bangalore + Mumbai + others), admin + judge + 6 students, 3 hackathons
 */

require('dotenv').config();
const mongoose = require('mongoose');

const University          = require('./models/University');
const User                = require('./models/User');
const Hackathon           = require('./models/Hackathon');
const HackathonTeam       = require('./models/HackathonTeam');
const HackathonSubmission = require('./models/HackathonSubmission');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collabxx';

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

  // ── Universities ─────────────────────────────────────────────────────────────
  const unis = await University.insertMany([
    // ── Bangalore ──────────────────────────────────────────────────────────────
    {
      name: 'Presidency University',
      domain: 'presidency.edu.in',
      maxStudents: 50,
      currentStudentCount: 0,
      description: 'Premier private university known for engineering and management programmes.',
      location: 'Bangalore, Karnataka',
      isActive: true,
    },
    {
      name: 'Indian Institute of Science (IISc)',
      domain: 'iisc.ac.in',
      maxStudents: 100,
      currentStudentCount: 0,
      description: "India's top research institution — ranked #1 in research output.",
      location: 'Bangalore, Karnataka',
      isActive: true,
    },
    {
      name: 'RV College of Engineering',
      domain: 'rvce.edu.in',
      maxStudents: 80,
      currentStudentCount: 0,
      description: 'One of Bangalore\'s oldest and most reputed engineering colleges.',
      location: 'Bangalore, Karnataka',
      isActive: true,
    },
    {
      name: 'BMS College of Engineering',
      domain: 'bmsce.ac.in',
      maxStudents: 80,
      currentStudentCount: 0,
      description: 'Autonomous engineering institution affiliated with VTU, est. 1946.',
      location: 'Bangalore, Karnataka',
      isActive: true,
    },
    {
      name: 'PES University',
      domain: 'pes.edu',
      maxStudents: 70,
      currentStudentCount: 0,
      description: 'Known for strong industry connections and innovation culture.',
      location: 'Bangalore, Karnataka',
      isActive: true,
    },
    {
      name: 'MS Ramaiah Institute of Technology',
      domain: 'msrit.edu',
      maxStudents: 80,
      currentStudentCount: 0,
      description: 'Autonomous VTU-affiliated institute with strong placement record.',
      location: 'Bangalore, Karnataka',
      isActive: true,
    },
    {
      name: 'Dayananda Sagar University',
      domain: 'dsu.edu.in',
      maxStudents: 60,
      currentStudentCount: 0,
      description: 'Multi-disciplinary university with focus on engineering and sciences.',
      location: 'Bangalore, Karnataka',
      isActive: true,
    },
    {
      name: 'Bangalore Institute of Technology',
      domain: 'bit-bangalore.edu.in',
      maxStudents: 60,
      currentStudentCount: 0,
      description: 'Government-aided autonomous institution since 1979.',
      location: 'Bangalore, Karnataka',
      isActive: true,
    },
    {
      name: 'Jain University',
      domain: 'jainuniversity.ac.in',
      maxStudents: 60,
      currentStudentCount: 0,
      description: 'Deemed-to-be university offering diverse programmes across faculties.',
      location: 'Bangalore, Karnataka',
      isActive: true,
    },
    {
      name: 'Manipal Institute of Technology',
      domain: 'manipal.edu',
      maxStudents: 90,
      currentStudentCount: 0,
      description: 'Top-ranked private engineering college under Manipal Academy.',
      location: 'Manipal, Karnataka',
      isActive: true,
    },

    // ── Mumbai (Bombay) ────────────────────────────────────────────────────────
    {
      name: 'IIT Bombay',
      domain: 'iitb.ac.in',
      maxStudents: 100,
      currentStudentCount: 0,
      description: "India's leading institute of technology — ranked top 5 globally among Indian institutions.",
      location: 'Mumbai, Maharashtra',
      isActive: true,
    },
    {
      name: 'University of Mumbai',
      domain: 'mu.ac.in',
      maxStudents: 100,
      currentStudentCount: 0,
      description: "One of India's largest universities with 700+ affiliated colleges.",
      location: 'Mumbai, Maharashtra',
      isActive: true,
    },
    {
      name: 'VJTI Mumbai',
      domain: 'vjti.ac.in',
      maxStudents: 80,
      currentStudentCount: 0,
      description: 'Veermata Jijabai Technological Institute — premier government engineering college.',
      location: 'Mumbai, Maharashtra',
      isActive: true,
    },
    {
      name: 'NMIMS University',
      domain: 'nmims.edu',
      maxStudents: 70,
      currentStudentCount: 0,
      description: 'Narsee Monjee Institute of Management Studies — top management and tech university.',
      location: 'Mumbai, Maharashtra',
      isActive: true,
    },
    {
      name: 'Thadomal Shahani Engineering College',
      domain: 'tsec.edu.in',
      maxStudents: 60,
      currentStudentCount: 0,
      description: 'Autonomous engineering college affiliated with University of Mumbai.',
      location: 'Mumbai, Maharashtra',
      isActive: true,
    },
    {
      name: 'DJ Sanghvi College of Engineering',
      domain: 'djsce.ac.in',
      maxStudents: 60,
      currentStudentCount: 0,
      description: 'One of Mumbai\'s most sought-after private engineering colleges.',
      location: 'Mumbai, Maharashtra',
      isActive: true,
    },
    {
      name: 'Sardar Patel Institute of Technology',
      domain: 'spit.ac.in',
      maxStudents: 50,
      currentStudentCount: 0,
      description: 'Autonomous college known for research and innovation clubs.',
      location: 'Mumbai, Maharashtra',
      isActive: true,
    },
    {
      name: 'KJ Somaiya Institute of Engineering',
      domain: 'somaiya.edu',
      maxStudents: 60,
      currentStudentCount: 0,
      description: 'Part of Somaiya Vidyavihar University, strong in CS and IT.',
      location: 'Mumbai, Maharashtra',
      isActive: true,
    },

    // ── Others ─────────────────────────────────────────────────────────────────
    {
      name: 'Delhi Tech Institute',
      domain: 'dti.ac.in',
      maxStudents: 30,
      currentStudentCount: 0,
      description: 'Engineering and innovation hub in the capital.',
      location: 'Delhi, India',
      isActive: true,
    },
    {
      name: 'BITS Pilani',
      domain: 'bits-pilani.ac.in',
      maxStudents: 80,
      currentStudentCount: 0,
      description: 'Birla Institute of Technology and Science — India\'s top deemed university.',
      location: 'Pilani, Rajasthan',
      isActive: true,
    },
    {
      name: 'VIT University',
      domain: 'vit.ac.in',
      maxStudents: 60,
      currentStudentCount: 0,
      description: 'Vellore Institute of Technology — known for tech fest and vibrant campus.',
      location: 'Vellore, Tamil Nadu',
      isActive: true,
    },
  ]);
  console.log(`Universities created: ${unis.length}`);

  // Convenience aliases for hackathon and user references
  const uniA = unis[0];  // Presidency University (Bangalore)
  const uniB = unis[18]; // Delhi Tech Institute
  const allUniIds = unis.map((u) => u._id);

  // Update student counts for seeded users
  await University.findByIdAndUpdate(uniA._id, { currentStudentCount: 4 });
  await University.findByIdAndUpdate(uniB._id, { currentStudentCount: 3 });

  // ── Users ─────────────────────────────────────────────────────────────────────
  const bcrypt = require('bcryptjs');
  const hash   = await bcrypt.hash('password123', 10);

  const [admin, judge, s1, s2, s3, s4, s5, s6] = await User.insertMany([
    {
      name: 'Admin User',
      email: 'admin@collabxx.com',
      password: hash,
      role: 'admin',
      isActive: true,
      meritScore: 0,
    },
    {
      name: 'Judge Sarah',
      email: 'judge@collabxx.com',
      password: hash,
      role: 'judge',
      university: uniA._id,
      isActive: true,
      meritScore: 0,
    },
    // Presidency University students
    {
      name: 'Alice Sharma',
      email: 'alice@presidency.edu.in',
      password: hash,
      role: 'student',
      university: uniA._id,
      isActive: true,
      meritScore: 120,
      meritBreakdown: { projectCompletions: 3, tasksCompleted: 15, hackathonWins: 1, hackathonParticipations: 2 },
    },
    {
      name: 'Bob Verma',
      email: 'bob@presidency.edu.in',
      password: hash,
      role: 'student',
      university: uniA._id,
      isActive: true,
      meritScore: 80,
      meritBreakdown: { projectCompletions: 2, tasksCompleted: 10, hackathonWins: 0, hackathonParticipations: 2 },
    },
    {
      name: 'Carol Nair',
      email: 'carol@presidency.edu.in',
      password: hash,
      role: 'student',
      university: uniA._id,
      isActive: true,
      meritScore: 60,
      meritBreakdown: { projectCompletions: 1, tasksCompleted: 8, hackathonWins: 0, hackathonParticipations: 1 },
    },
    // Delhi Tech Institute students
    {
      name: 'David Mehta',
      email: 'david@dti.ac.in',
      password: hash,
      role: 'student',
      university: uniB._id,
      isActive: true,
      meritScore: 200,
      meritBreakdown: { projectCompletions: 4, tasksCompleted: 20, hackathonWins: 2, hackathonParticipations: 3 },
    },
    {
      name: 'Eva Singh',
      email: 'eva@dti.ac.in',
      password: hash,
      role: 'student',
      university: uniB._id,
      isActive: true,
      meritScore: 50,
      meritBreakdown: { projectCompletions: 1, tasksCompleted: 5, hackathonWins: 0, hackathonParticipations: 1 },
    },
    {
      name: 'Frank Patel',
      email: 'frank@dti.ac.in',
      password: hash,
      role: 'student',
      university: uniB._id,
      isActive: true,
      meritScore: 30,
      meritBreakdown: { projectCompletions: 0, tasksCompleted: 5, hackathonWins: 0, hackathonParticipations: 1 },
    },
  ]);
  console.log('Users created');

  // ── Hackathons ────────────────────────────────────────────────────────────────
  const now = new Date();
  const [hackathon] = await Hackathon.insertMany([
    {
      title: 'Inter-College Innovate 2025',
      description: 'Build something amazing in 48 hours. Open to all university students across Bangalore, Mumbai and beyond. Best project wins cash prizes and merit points!',
      startDate: new Date(now.getTime() - 3 * 864e5),
      endDate: new Date(now.getTime() + 4 * 864e5),
      submissionDeadline: new Date(now.getTime() + 2 * 864e5),
      maxTeamSize: 3, minTeamSize: 1,
      participatingUniversities: allUniIds,
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
      description: 'Use AI/ML to solve real-world social problems — healthcare, education, environment. Open to all IISc, IIT Bombay, and partner universities. Your ideas can change the world.',
      startDate: new Date(now.getTime() + 7 * 864e5),
      endDate: new Date(now.getTime() + 9 * 864e5),
      submissionDeadline: new Date(now.getTime() + 8.5 * 864e5),
      maxTeamSize: 4, minTeamSize: 2,
      participatingUniversities: allUniIds.slice(0, 12), // Bangalore + Mumbai unis
      prizes: [
        { place: 1, title: '🥇 Grand Prize',  description: '₹1,00,000 + internship opportunity' },
        { place: 2, title: '🥈 Runner Up',    description: '₹50,000' },
      ],
      status: 'upcoming', judges: [judge._id], createdBy: admin._id,
      coverColor: '#10B981', isPublic: true,
    },
    {
      title: 'Web3 & Blockchain Challenge',
      description: 'Build decentralized applications, smart contracts, or blockchain-based solutions. DeFi, NFTs, DAOs — all welcome. Open to BITS, VIT, IIT Bombay and partner colleges.',
      startDate: new Date(now.getTime() - 10 * 864e5),
      endDate: new Date(now.getTime() - 2 * 864e5),
      submissionDeadline: new Date(now.getTime() - 3 * 864e5),
      maxTeamSize: 3, minTeamSize: 1,
      participatingUniversities: allUniIds.slice(10, 21), // Mumbai + others
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
    hackathon: hackathon._id,
    name: 'Team Alpha',
    leader: s1._id,
    members: [
      { user: s1._id, role: 'leader', joinedAt: new Date() },
      { user: s2._id, role: 'member', joinedAt: new Date() },
      { user: s3._id, role: 'member', joinedAt: new Date() },
    ],
    hasSubmitted: true,
  });

  const teamBeta = await HackathonTeam.create({
    hackathon: hackathon._id,
    name: 'Team Beta',
    leader: s4._id,
    members: [
      { user: s4._id, role: 'leader', joinedAt: new Date() },
      { user: s5._id, role: 'member', joinedAt: new Date() },
    ],
    hasSubmitted: true,
  });

  await HackathonTeam.create({
    hackathon: hackathon._id,
    name: 'Solo Gamma',
    leader: s6._id,
    members: [
      { user: s6._id, role: 'leader', joinedAt: new Date() },
    ],
    hasSubmitted: false,
  });
  console.log('Teams created');

  // ── Submissions ───────────────────────────────────────────────────────────────
  await HackathonSubmission.create({
    hackathon: hackathon._id,
    team: teamAlpha._id,
    submittedBy: s1._id,
    title: 'EduTrack — Student Progress Monitor',
    description: 'An AI-powered platform that tracks student learning progress, identifies weak areas, and recommends personalised study plans using ML.',
    repoUrl: 'https://github.com/example/edutrack',
    demoUrl: 'https://edutrack-demo.vercel.app',
    techStack: ['React', 'Node.js', 'Python', 'TensorFlow', 'MongoDB'],
    totalScore: null,
  });

  await HackathonSubmission.create({
    hackathon: hackathon._id,
    team: teamBeta._id,
    submittedBy: s4._id,
    title: 'GreenChain — Carbon Credit Marketplace',
    description: 'A blockchain-based marketplace for trading verified carbon credits between corporations and NGOs with real-time price discovery.',
    repoUrl: 'https://github.com/example/greenchain',
    demoUrl: 'https://greenchain.netlify.app',
    techStack: ['Next.js', 'Solidity', 'Ethereum', 'Express', 'PostgreSQL'],
    totalScore: null,
  });
  console.log('Submissions created');

  // ── Summary ────────────────────────────────────────────────────────────────────
  const bangaloreUnis = unis.filter((u) => u.location.includes('Bangalore') || u.location.includes('Karnataka'));
  const mumbaiUnis    = unis.filter((u) => u.location.includes('Mumbai') || u.location.includes('Maharashtra'));

  console.log('\n✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🏛️  Universities: ${unis.length} total`);
  console.log(`   Bangalore (${bangaloreUnis.length}): ${bangaloreUnis.map((u) => u.name).join(', ')}`);
  console.log(`   Mumbai    (${mumbaiUnis.length}): ${mumbaiUnis.map((u) => u.name).join(', ')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Login credentials (all passwords: password123)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 Admin  : admin@collabxx.com');
  console.log('⚖️  Judge  : judge@collabxx.com');
  console.log('🎓 Student: alice@presidency.edu.in  (merit: 120)');
  console.log('🎓 Student: bob@presidency.edu.in    (merit: 80)');
  console.log('🎓 Student: carol@presidency.edu.in  (merit: 60)');
  console.log('🎓 Student: david@dti.ac.in          (merit: 200)');
  console.log('🎓 Student: eva@dti.ac.in            (merit: 50)');
  console.log('🎓 Student: frank@dti.ac.in          (merit: 30)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🏆 Hackathon: "${hackathon.title}" (status: active)`);
  console.log('   Teams: Team Alpha (3 members, submitted)');
  console.log('          Team Beta  (2 members, submitted)');
  console.log('          Solo Gamma (1 member,  no submission)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
