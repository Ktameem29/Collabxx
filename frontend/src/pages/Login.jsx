import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex flex-col flex-1 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'radial-gradient(circle at 30% 50%, rgba(139,92,246,0.12) 0%, transparent 70%), radial-gradient(circle at 70% 20%, rgba(59,130,246,0.1) 0%, transparent 60%)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="relative text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center mx-auto mb-8 shadow-glow">
            <Zap size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-100 mb-3">Collabxx</h1>
          <p className="text-2xl text-gray-400 italic font-light">"Together we build."</p>
          <p className="text-gray-500 mt-4 max-w-xs mx-auto leading-relaxed">
            The student collaboration platform for building projects that matter.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Collabxx</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-100 mb-1">Welcome back</h2>
          <p className="text-gray-500 mb-8 text-sm">Sign in to your Collabxx account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
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
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
