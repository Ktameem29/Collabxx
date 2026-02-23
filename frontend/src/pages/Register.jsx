import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Building2, Search, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { universitiesAPI, authAPI } from '../api';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', universityId: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [uniSearch, setUniSearch] = useState('');
  const [uniOpen, setUniOpen] = useState(false);
  const uniRef = useRef(null);

  useEffect(() => {
    universitiesAPI.getAll()
      .then(({ data }) => setUniversities(data))
      .catch(() => {}); // non-fatal
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (uniRef.current && !uniRef.current.contains(e.target)) setUniOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedUni = universities.find((u) => u._id === form.universityId);
  const filteredUnis = universities.filter((u) =>
    !uniSearch || u.name.toLowerCase().includes(uniSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const result = await register(form.name, form.email, form.password, form.universityId || undefined);
      if (result?.waitlisted) {
        toast.success('Added to waitlist! Admin will review your application.');
        navigate('/waitlisted');
      } else {
        toast.success('Account created! Welcome to Collabxx!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/google`;
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
            {['Kanban boards', 'Real-time chat', 'File sharing', 'Hackathons'].map((f) => (
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
          <p className="text-gray-500 mb-6 text-sm">Free forever. No credit card required.</p>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-navy-700 border border-navy-500 text-gray-300 hover:bg-navy-600 hover:border-gray-500 transition-all duration-200 text-sm font-medium mb-5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-navy-500" />
            <span className="text-xs text-gray-600">or sign up with email</span>
            <div className="flex-1 h-px bg-navy-500" />
          </div>

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

            {universities.length > 0 && (
              <div ref={uniRef}>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Institution <span className="text-gray-600 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  {/* Trigger button */}
                  <button
                    type="button"
                    onClick={() => { setUniOpen((o) => !o); setUniSearch(''); }}
                    className="input flex items-center justify-between text-left w-full"
                  >
                    <span className={selectedUni ? 'text-gray-200' : 'text-gray-500'}>
                      {selectedUni ? selectedUni.name : 'Select your institution'}
                    </span>
                    <span className="flex items-center gap-1 shrink-0 ml-2">
                      {selectedUni && (
                        <span onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, universityId: '' })); setUniSearch(''); }}
                          className="text-gray-500 hover:text-gray-300 transition-colors p-0.5">
                          <X size={13} />
                        </span>
                      )}
                      <ChevronDown size={14} className={`text-gray-500 transition-transform ${uniOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>

                  {/* Dropdown */}
                  {uniOpen && (
                    <div className="absolute z-50 w-full mt-1 rounded-xl bg-navy-800 border border-navy-500 shadow-glass overflow-hidden">
                      {/* Search input */}
                      <div className="p-2 border-b border-navy-600">
                        <div className="relative">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            autoFocus
                            type="text"
                            value={uniSearch}
                            onChange={(e) => setUniSearch(e.target.value)}
                            placeholder="Search institutions..."
                            className="w-full pl-7 pr-3 py-1.5 text-sm bg-navy-700 border border-navy-500 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Results */}
                      <div className="max-h-52 overflow-y-auto">
                        {filteredUnis.length === 0 ? (
                          <p className="text-center text-gray-500 text-sm py-4">No institutions found</p>
                        ) : (
                          <>
                            {/* Universities & Colleges */}
                            {filteredUnis.filter((u) => u.type !== 'school').length > 0 && (
                              <>
                                <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-navy-800/80 sticky top-0">🎓 Universities & Colleges</div>
                                {filteredUnis.filter((u) => u.type !== 'school').map((u) => (
                                  <button key={u._id} type="button"
                                    onClick={() => { setForm((p) => ({ ...p, universityId: u._id })); setUniOpen(false); setUniSearch(''); }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-navy-700 transition-colors flex items-center justify-between gap-2 ${form.universityId === u._id ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300'}`}
                                  >
                                    <span>{u.name}</span>
                                    <span className="text-xs text-gray-500 shrink-0">
                                      {u.currentStudentCount >= u.maxStudents ? 'Waitlist' : `${u.maxStudents - u.currentStudentCount} spots`}
                                    </span>
                                  </button>
                                ))}
                              </>
                            )}
                            {/* Schools */}
                            {filteredUnis.filter((u) => u.type === 'school').length > 0 && (
                              <>
                                <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-navy-800/80 sticky top-0">🏫 Schools</div>
                                {filteredUnis.filter((u) => u.type === 'school').map((u) => (
                                  <button key={u._id} type="button"
                                    onClick={() => { setForm((p) => ({ ...p, universityId: u._id })); setUniOpen(false); setUniSearch(''); }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-navy-700 transition-colors flex items-center justify-between gap-2 ${form.universityId === u._id ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300'}`}
                                  >
                                    <span>{u.name}</span>
                                    <span className="text-xs text-gray-500 shrink-0">
                                      {u.currentStudentCount >= u.maxStudents ? 'Waitlist' : `${u.maxStudents - u.currentStudentCount} spots`}
                                    </span>
                                  </button>
                                ))}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
