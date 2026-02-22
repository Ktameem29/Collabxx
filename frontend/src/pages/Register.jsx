import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Collabxx!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col flex-1 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'radial-gradient(circle at 30% 50%, rgba(59,130,246,0.1) 0%, transparent 70%), radial-gradient(circle at 70% 80%, rgba(139,92,246,0.1) 0%, transparent 60%)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="relative text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center mx-auto mb-8 shadow-glow">
            <Zap size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-100 mb-3">Join Collabxx</h1>
          <p className="text-2xl text-gray-400 italic font-light">"Together we build."</p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {['Kanban boards', 'Real-time chat', 'File sharing', 'Team roles'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-gray-400">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Collabxx</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-100 mb-1">Create your account</h2>
          <p className="text-gray-500 mb-8 text-sm">Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="input pl-10"
                  placeholder="John Doe"
                  required
                  minLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="input pl-10"
                  placeholder="you@university.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="input pl-10 pr-10"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                  className={`input pl-10 ${form.confirm && form.password !== form.confirm ? 'border-red-500/50 focus:ring-red-500' : ''}`}
                  placeholder="Repeat password"
                  required
                />
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>Create free account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
