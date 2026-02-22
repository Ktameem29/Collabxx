import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, User, LogOut,
  ShieldCheck, Zap, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full w-64 bg-navy-700 border-r border-navy-500 flex flex-col z-40"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-navy-500">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold gradient-text">Collabxx</span>
            <p className="text-xs text-gray-500 -mt-0.5 font-medium">Together we build.</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-navy-600 transition-colors lg:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link group${isActive ? ' active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-blue-400' : ''} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-blue-400" />}
              </>
            )}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link group${isActive ? ' active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <ShieldCheck size={18} className={isActive ? 'text-blue-400' : ''} />
                <span className="flex-1">Admin Panel</span>
                {isActive && <ChevronRight size={14} className="text-blue-400" />}
              </>
            )}
          </NavLink>
        )}
      </nav>

      {/* User + status */}
      <div className="px-3 py-4 border-t border-navy-500 space-y-3">
        {/* Socket status */}
        <div className="flex items-center gap-2 px-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-gray-500'}`} />
          <span className="text-xs text-gray-500">{isConnected ? 'Live connected' : 'Offline'}</span>
        </div>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-800 border border-navy-500">
          <Avatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </motion.aside>
  );
}
