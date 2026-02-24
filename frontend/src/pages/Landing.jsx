import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Users, KanbanSquare, MessageSquare, Upload, Shield,
  ArrowRight, Star, Trophy, MapPin, Medal, TrendingUp,
  ChevronDown, Code2, Rocket, Globe,
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const features = [
  { icon: KanbanSquare, title: 'Kanban Board', desc: 'Drag-and-drop task management with priority levels, assignees, and status tracking.', color: '#3B82F6', bg: 'bg-blue-500/10' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Built-in project chat with typing indicators and instant message delivery.', color: '#10B981', bg: 'bg-emerald-500/10' },
  { icon: Trophy, title: 'Hackathons', desc: 'Join or organise hackathons, form teams, submit projects, and compete on live leaderboards.', color: '#F59E0B', bg: 'bg-amber-500/10' },
  { icon: Medal, title: 'Badges & Merit', desc: 'Earn badges and merit points for completing tasks, projects, and winning hackathons.', color: '#8B5CF6', bg: 'bg-purple-500/10' },
  { icon: MapPin, title: 'Institutions Map', desc: 'Discover universities, colleges, and schools near you on an interactive map.', color: '#06B6D4', bg: 'bg-cyan-500/10' },
  { icon: TrendingUp, title: 'Leaderboard', desc: 'Track your global and institution-level merit ranking and showcase your achievements.', color: '#EF4444', bg: 'bg-red-500/10' },
  { icon: Upload, title: 'File Sharing', desc: 'Upload and share any file type within your project. Everything in one place.', color: '#F97316', bg: 'bg-orange-500/10' },
  { icon: Shield, title: 'Roles & Access', desc: 'Owner, member, mentor, judge, and admin roles with fine-grained access control.', color: '#14B8A6', bg: 'bg-teal-500/10' },
  { icon: Globe, title: 'Google SSO', desc: 'Sign in instantly with your Google account — no passwords required.', color: '#84CC16', bg: 'bg-lime-500/10' },
];

const steps = [
  { step: '01', icon: Code2, title: 'Create your project', desc: 'Set up a project in seconds. Add a description, tech stack, and invite your teammates.' },
  { step: '02', icon: Users, title: 'Build your team', desc: 'Send join requests or invite members directly. Assign roles and get everyone on board.' },
  { step: '03', icon: Rocket, title: 'Ship together', desc: 'Manage tasks on the kanban, chat in real-time, share files, and track progress as a team.' },
];

const stats = [
  { label: 'Students', value: '10K+' },
  { label: 'Projects', value: '25K+' },
  { label: 'Tasks Done', value: '100K+' },
  { label: 'Institutions', value: '200+' },
];

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500'];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-900 overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 bg-navy-900/80 backdrop-blur-xl border-b border-navy-500/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Collabxx</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-gray-200 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-gray-200 transition-colors">How it works</a>
          <a href="#hackathons" className="hover:text-gray-200 transition-colors">Hackathons</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-ghost text-sm hidden sm:flex">Sign in</button>
          <button onClick={() => navigate('/register')} className="btn-primary text-sm">
            Get started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-6">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-blue-500/6 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/4 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative text-center max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              Student Project Collaboration Hub
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-8xl font-bold text-gray-100 mb-5 leading-[1.05] text-balance tracking-tight">
            Where student<br />
            <span className="gradient-text">teams ship faster</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Projects, kanban, real-time chat, hackathons, merit scores, and more —
            everything your team needs in one beautifully designed platform.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary text-base px-10 py-3.5 shadow-glow"
            >
              Start building — it's free
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary text-base px-10 py-3.5"
            >
              Sign in
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {avatarColors.map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} ring-2 ring-navy-900 flex items-center justify-center text-white text-xs font-bold`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span>10,000+ students building</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-amber-400 fill-amber-400" />)}</div>
              4.9 / 5
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live now
            </span>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 text-xs"
        >
          <span>Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-6 border-y border-navy-500/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Up and running in minutes</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">No setup headaches. Just sign up and start collaborating.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-px bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-emerald-500/30" />

            {steps.map(({ step, icon: Icon, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass p-8 rounded-2xl text-center relative"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-5 shadow-glow">
                  <Icon size={24} className="text-white" />
                </div>
                <span className="absolute top-4 right-4 text-xs font-bold text-gray-700">{step}</span>
                <h3 className="font-bold text-gray-100 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 border-t border-navy-500/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Everything your team needs</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              A complete platform built for student collaboration — from idea to submission.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass p-6 rounded-2xl group cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110`}
                  style={{ border: `1px solid ${color}30` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="font-semibold text-gray-100 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hackathons spotlight ── */}
      <section id="hackathons" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">Hackathons</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-5 leading-tight">
                Compete, build,<br />
                <span className="gradient-text">win together</span>
              </h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Join hackathons hosted by universities and organisations. Form teams, submit projects, get judged in real-time, and see your team climb the live leaderboard.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: Users, text: 'Form teams with students from any institution' },
                  { icon: TrendingUp, text: 'Live leaderboard updated as judges score' },
                  { icon: Trophy, text: 'Win hackathons to earn the Champion badge' },
                  { icon: Medal, text: 'Earn merit points that boost your global rank' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-gray-300 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-amber-400" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/register')} className="btn-primary">
                Join a hackathon <ArrowRight size={16} />
              </button>
            </motion.div>

            {/* Visual card mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-100 text-lg">HackIndia 2025</h4>
                    <p className="text-sm text-gray-500">48 hours · 120 teams</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">Live</span>
                </div>

                {/* Leaderboard preview */}
                <div className="space-y-2">
                  {[
                    { rank: 1, name: 'Team Nexus', score: 94, color: 'text-amber-400' },
                    { rank: 2, name: 'ByteForce', score: 88, color: 'text-gray-400' },
                    { rank: 3, name: 'DevSquad', score: 81, color: 'text-orange-400' },
                    { rank: 4, name: 'CodeCraft', score: 76, color: 'text-gray-500' },
                  ].map(({ rank, name, score, color }) => (
                    <div key={rank} className="flex items-center gap-3 p-3 rounded-xl bg-navy-800/60">
                      <span className={`text-sm font-bold w-5 text-center ${color}`}>#{rank}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-200">{name}</p>
                        <div className="w-full bg-navy-600 rounded-full h-1.5 mt-1">
                          <div className="bg-gradient-primary h-1.5 rounded-full" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">{score}pts</span>
                    </div>
                  ))}
                </div>

                {/* Badge notification */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20"
                >
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-xs font-semibold text-blue-300">Badge Unlocked!</p>
                    <p className="text-xs text-gray-400">You earned the <span className="text-blue-400">Champion</span> badge</p>
                  </div>
                </motion.div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-3xl shadow-lg"
              >
                🏆
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Merit & Badges ── */}
      <section className="py-24 px-6 border-t border-navy-500/50">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Merit System</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Earn as you build</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Every task, project, and hackathon earns you merit points and badges.
              Climb the global leaderboard and stand out.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { icon: '⚔️', name: 'First Blood', desc: 'Complete 1 task' },
              { icon: '✅', name: 'Task Master', desc: '10 tasks done' },
              { icon: '🤝', name: 'Team Player', desc: 'Join a project' },
              { icon: '🏆', name: 'Champion', desc: 'Win a hackathon' },
              { icon: '⭐', name: 'Rising Star', desc: '100 merit points' },
              { icon: '💎', name: 'Elite', desc: '500 merit points' },
            ].map(({ icon, name, desc }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="glass p-4 rounded-2xl flex flex-col items-center gap-2 cursor-default"
              >
                <span className="text-3xl">{icon}</span>
                <p className="text-xs font-semibold text-gray-200 text-center leading-tight">{name}</p>
                <p className="text-[10px] text-gray-500 text-center">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <div className="absolute inset-0 bg-gradient-primary opacity-[0.04] rounded-3xl" />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-purple-500/10 blur-2xl" />
          <div className="relative">
            <p className="text-5xl mb-6">🚀</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-3">Ready to build?</h2>
            <p className="text-xl text-gray-400 mb-2 italic">"Together we build."</p>
            <p className="text-gray-500 mb-8">Join thousands of students already shipping on Collabxx.</p>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary text-base px-12 py-4 shadow-glow"
            >
              Create your free account
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-navy-500/50 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-bold gradient-text">Collabxx</span>
            <span className="text-gray-600 text-sm">— Together we build.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <button onClick={() => navigate('/login')} className="hover:text-gray-400 transition-colors">Sign in</button>
            <button onClick={() => navigate('/register')} className="hover:text-gray-400 transition-colors">Register</button>
            <span>© {new Date().getFullYear()} Collabxx</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
