/**
 * Collabxx — Seed Script
 * Run: node src/seed.js
 * Creates: 2 universities, admin + judge + 6 students, 1 hackathon with teams & submissions
 */

require('dotenv').config();
const mongoose = require('mongoose');

const University        = require('./models/University');
const User              = require('./models/User');
const Hackathon         = require('./models/Hackathon');
const HackathonTeam     = require('./models/HackathonTeam');
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
  const [uniA, uniB, uniC, uniD, uniE] = await University.insertMany([
    {
      name: 'Presidency University',
      domain: 'presidency.edu.in',
      maxStudents: 50,
      currentStudentCount: 0,
      description: 'Premier tech university in Bangalore',
      location: 'Bangalore, India',
      isActive: true,
    },
    {
      name: 'Delhi Tech Institute',
      domain: 'dti.ac.in',
      maxStudents: 30,
      currentStudentCount: 0,
      description: 'Engineering and innovation hub',
      location: 'Delhi, India',
      isActive: true,
    },
    {
      name: 'IIT Bombay',
      domain: 'iitb.ac.in',
      maxStudents: 100,
      currentStudentCount: 0,
      description: 'India\'s leading institute of technology',
      location: 'Mumbai, India',
      isActive: true,
    },
    {
      name: 'BITS Pilani',
      domain: 'bits-pilani.ac.in',
      maxStudents: 80,
      currentStudentCount: 0,
      description: 'Birla Institute of Technology and Science',
      location: 'Pilani, Rajasthan, India',
      isActive: true,
    },
    {
      name: 'VIT University',
      domain: 'vit.ac.in',
      maxStudents: 60,
      currentStudentCount: 0,
      description: 'Vellore Institute of Technology',
      location: 'Vellore, Tamil Nadu, India',
      isActive: true,
    },
  ]);
  console.log('Universities created');

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
    // Presidency students
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
    // DTI students
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

  // Update university student counts
  await University.findByIdAndUpdate(uniA._id, { currentStudentCount: 4 });
  await University.findByIdAndUpdate(uniB._id, { currentStudentCount: 3 });
  // uniC, uniD, uniE start empty — available for new registrations
  console.log('Users created');

  // ── Hackathon ─────────────────────────────────────────────────────────────────
  const now = new Date();
  const hackathon = await Hackathon.create({
    title: 'Inter-College Innovate 2025',
    description: 'Build something amazing in 48 hours. Open to all university students. Best project wins cash prizes and merit points!',
    startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),       // 3 days ago
    endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),         // 4 days from now
    submissionDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    maxTeamSize: 3,
    minTeamSize: 1,
    participatingUniversities: [uniA._id, uniB._id, uniC._id, uniD._id, uniE._id],
    prizes: [
      { place: 1, title: '🥇 First Place', description: '₹50,000 + 50 merit points' },
      { place: 2, title: '🥈 Second Place', description: '₹25,000 + 25 merit points' },
      { place: 3, title: '🥉 Third Place', description: '₹10,000 + 10 merit points' },
    ],
    status: 'active',
    judges: [judge._id],
    createdBy: admin._id,
    coverColor: '#8B5CF6',
    isPublic: true,
  });
  console.log('Hackathon created');

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

  const teamGamma = await HackathonTeam.create({
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
  console.log('\n✅ Seed complete!\n');
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
