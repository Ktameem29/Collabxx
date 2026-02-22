import { Menu, Bell } from 'lucide-react';
import Avatar from '../ui/Avatar';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user, pendingCount } = useAuth();

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
        <button className="relative p-2.5 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-navy-600 transition-colors" title={pendingCount > 0 ? `${pendingCount} pending join request${pendingCount > 1 ? 's' : ''}` : 'Notifications'}>
          <Bell size={18} />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-navy-700 px-1 animate-pulse">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </button>
        <Avatar user={user} size="sm" className="cursor-pointer" />
      </div>
    </header>
  );
}
