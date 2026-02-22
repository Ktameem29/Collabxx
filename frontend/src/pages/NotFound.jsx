import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-6 max-w-md relative"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Collabxx</span>
        </div>

        {/* 404 */}
        <div>
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="text-8xl font-black gradient-text leading-none mb-2"
          >
            404
          </motion.p>
          <h1 className="text-2xl font-bold text-gray-100">Page not found</h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <ArrowLeft size={16} /> Go back
          </button>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="btn-primary"
          >
            <Home size={16} /> {user ? 'Dashboard' : 'Home'}
          </button>
        </div>

        <p className="text-xs text-gray-600 italic">"Together we build." — Collabxx</p>
      </motion.div>
    </div>
  );
}
