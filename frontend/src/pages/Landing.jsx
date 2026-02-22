import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Users, KanbanSquare, MessageSquare, Upload, Shield,
  ArrowRight, ChevronRight, Star, Github,
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const features = [
  { icon: Users, title: 'Team Collaboration', desc: 'Create projects, invite members, and work together seamlessly with role-based access control.', color: '#3B82F6', bg: 'bg-blue-500/10' },
  { icon: KanbanSquare, title: 'Kanban Board', desc: 'Drag-and-drop task management with priority levels, assignees, and due dates.', color: '#8B5CF6', bg: 'bg-purple-500/10' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Built-in project chat with typing indicators and instant message delivery via Socket.io.', color: '#10B981', bg: 'bg-emerald-500/10' },
  { icon: Upload, title: 'File Sharing', desc: 'Upload and share any file type within your project. Access everything in one place.', color: '#F59E0B', bg: 'bg-amber-500/10' },
  { icon: Shield, title: 'JWT Auth & Roles', desc: 'Secure authentication with owner/member roles, join requests, and admin controls.', color: '#EF4444', bg: 'bg-red-500/10' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Built with Vite + React + Node.js for a snappy, production-ready experience.', color: '#06B6D4', bg: 'bg-cyan-500/10' },
];

const stats = [
  { label: 'Students Collaborating', value: '10K+' },
  { label: 'Projects Created', value: '25K+' },
  { label: 'Tasks Completed', value: '100K+' },
  { label: 'Universities', value: '200+' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-900 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-navy-900/80 backdrop-blur-xl border-b border-navy-500/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Collabxx</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-ghost text-sm">Sign in</button>
          <button onClick={() => navigate('/register')} className="btn-primary text-sm">
            Get started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-3xl" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              Student Project Collaboration Hub
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold text-gray-100 mb-4 leading-tight text-balance">
            Where student
            <br />
            <span className="gradient-text">teams ship faster</span>
          </motion.h1>

          {/* Slogan */}
          <motion.p variants={fadeUp} className="text-2xl md:text-3xl font-light text-gray-500 mb-3 italic">
            "Together we build."
          </motion.p>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create projects, build teams, manage tasks on a kanban board, chat in real-time, and share files — all in one beautifully designed platform.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary text-base px-8 py-3.5 shadow-glow hover:shadow-glow-purple transition-shadow"
            >
              Start for free
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary text-base px-8 py-3.5"
            >
              Sign in
              <ChevronRight size={18} />
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={fadeUp} className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500'].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${c} ring-2 ring-navy-900 flex items-center justify-center text-white text-xs font-bold`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              10,000+ students building
            </span>
            <span className="hidden sm:flex items-center gap-2">
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}</div>
              4.9/5 rating
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-y border-navy-500">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {stats.map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-4xl font-bold gradient-text mb-2">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-100 mb-4">Everything your team needs</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              A complete collaboration platform built for student projects — from ideation to deployment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="glass-hover p-6 rounded-2xl"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`} style={{ border: `1px solid ${color}25` }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <h3 className="font-semibold text-gray-100 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-3xl" />
          <h2 className="text-4xl font-bold text-gray-100 mb-4 relative">Ready to build something great?</h2>
          <p className="text-xl text-gray-400 mb-2 italic relative">"Together we build."</p>
          <p className="text-gray-500 mb-8 relative">Join thousands of students already using Collabxx</p>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary text-base px-10 py-3.5 relative shadow-glow"
          >
            Create your account — it's free
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-500 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-bold gradient-text">Collabxx</span>
            <span className="text-gray-600 text-sm">— Together we build.</span>
          </div>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Collabxx. Built for students, by students.
          </p>
        </div>
      </footer>
    </div>
  );
}
