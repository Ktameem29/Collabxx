import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Users } from 'lucide-react';
import { projectsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

export default function NotificationPanel() {
  const { pendingCount, setPendingCount } = useAuth();
  const [open, setOpen]           = useState(false);
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [acting, setActing]       = useState(null); // userId being approved/rejected
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch pending requests when panel opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    projectsAPI.getMy()
      .then(({ data }) => {
        const all = [];
        for (const project of data) {
          for (const user of (project.pendingRequests || [])) {
            all.push({ project, user });
          }
        }
        setRequests(all);
        setPendingCount(all.length);
      })
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, [open]); // eslint-disable-line

  const handleAccept = async (projectId, userId) => {
    setActing(userId);
    try {
      await projectsAPI.acceptMember(projectId, userId);
      setRequests((prev) => prev.filter((r) => !(r.project._id === projectId && r.user._id === userId)));
      setPendingCount((c) => Math.max(0, c - 1));
      toast.success('Member accepted!');
    } catch {
      toast.error('Failed to accept');
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (projectId, userId) => {
    setActing(userId);
    try {
      await projectsAPI.rejectMember(projectId, userId);
      setRequests((prev) => prev.filter((r) => !(r.project._id === projectId && r.user._id === userId)));
      setPendingCount((c) => Math.max(0, c - 1));
      toast.success('Request rejected');
    } catch {
      toast.error('Failed to reject');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-navy-600 transition-colors"
        title="Notifications"
      >
        <Bell size={18} />
        {pendingCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-navy-700 px-1 animate-pulse">
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-navy-700 border border-navy-500 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-navy-500">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-blue-400" />
              <span className="text-sm font-semibold text-gray-200">Notifications</span>
            </div>
            {pendingCount > 0 && (
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">
                {pendingCount} pending
              </span>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Users size={28} className="text-gray-600 mb-2" />
                <p className="text-sm text-gray-500">No pending requests</p>
                <p className="text-xs text-gray-600 mt-1">Join requests for your projects appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-navy-500">
                {requests.map(({ project, user }) => (
                  <div key={`${project._id}-${user._id}`} className="px-4 py-3 hover:bg-navy-600/40 transition-colors">
                    <p className="text-[11px] text-blue-400 font-medium mb-1.5 truncate">{project.title}</p>
                    <div className="flex items-center gap-3">
                      <Avatar user={user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleAccept(project._id, user._id)}
                          disabled={acting === user._id}
                          className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center transition-colors disabled:opacity-50"
                          title="Accept"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => handleReject(project._id, user._id)}
                          disabled={acting === user._id}
                          className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 flex items-center justify-center transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
