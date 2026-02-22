import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Users } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { projectsAPI } from '../../api';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function JoinRequests({ project, onUpdate }) {
  const [processing, setProcessing] = useState({});

  const handle = async (userId, action) => {
    setProcessing((p) => ({ ...p, [userId]: true }));
    try {
      if (action === 'accept') {
        const { data } = await projectsAPI.acceptMember(project._id, userId);
        toast.success('Member accepted!');
        onUpdate(data);
      } else {
        await projectsAPI.rejectMember(project._id, userId);
        toast.success('Request rejected');
        onUpdate({ ...project, pendingRequests: project.pendingRequests.filter((u) => (u._id || u) !== userId) });
      }
    } catch {
      toast.error('Action failed');
    } finally {
      setProcessing((p) => ({ ...p, [userId]: false }));
    }
  };

  if (!project.pendingRequests?.length) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Users size={16} className="text-amber-400" />
        <h3 className="font-semibold text-gray-200">Join Requests</h3>
        <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 ml-auto">
          {project.pendingRequests.length} pending
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {project.pendingRequests.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-navy-800 border border-navy-500"
            >
              <Avatar user={user} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handle(user._id, 'accept')}
                  disabled={processing[user._id]}
                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => handle(user._id, 'reject')}
                  disabled={processing[user._id]}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
