import { Menu } from 'lucide-react';
import Avatar from '../ui/Avatar';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationPanel from './NotificationPanel';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-navy-700/80 backdrop-blur-md border-b border-navy-500 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-navy-600 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden lg:block">
          <p className="text-sm text-gray-500">Welcome back,</p>
          <p className="text-base font-semibold text-gray-200 leading-tight">{user?.name}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationPanel />
        <Avatar user={user} size="sm" className="cursor-pointer" />
      </div>
    </header>
  );
}
