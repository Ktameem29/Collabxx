import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, FolderOpen, TrendingUp, Users, Zap } from 'lucide-react';
import { projectsAPI, meritAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { SkeletonCard, SkeletonStat } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const stagger = { show: { transition: { staggerChildren: 0.07 } } };

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass p-5 rounded-2xl flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { user, setPendingCount } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [browseProjects, setBrowseProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'browse'
  const [createOpen, setCreateOpen] = useState(false);
  const [badgeDefs, setBadgeDefs] = useState([]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const [myRes, browseRes] = await Promise.all([
        projectsAPI.getMy(),
        projectsAPI.getAll({ search }),
      ]);
      setMyProjects(myRes.data);
      setBrowseProjects(browseRes.data);
      // Update notification badge with pending join requests across owned projects
      const total = myRes.data.reduce((sum, p) => sum + (p.pendingRequests?.length || 0), 0);
      setPendingCount(total);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchProjects, 300);
    return () => clearTimeout(timeout);
  }, [fetchProjects]);

  useEffect(() => {
    if (user?.badges?.length > 0) {
      meritAPI.getBadgeDefinitions().then(({ data }) => setBadgeDefs(data)).catch(() => {});
    }
  }, [user?.badges?.length]);

  const handleCreated = (project) => {
    setMyProjects((p) => [project, ...p]);
    setActiveTab('my');
  };

  const handleJoin = async (projectId) => {
    try {
      await projectsAPI.join(projectId);
      toast.success('Join request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  const displayProjects = activeTab === 'my' ? myProjects : browseProjects;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">Together we build. Let's see what you're working on.</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary shrink-0">
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FolderOpen} label="My Projects" value={myProjects.length} color="bg-blue-500" />
          <StatCard icon={Users} label="Team Members" value={myProjects.reduce((a, p) => a + (p.members?.length || 0), 0)} color="bg-purple-500" />
          <StatCard icon={TrendingUp} label="Active" value={myProjects.filter((p) => p.status === 'active').length} color="bg-emerald-500" />
          <StatCard icon={Zap} label="Completed" value={myProjects.filter((p) => p.status === 'completed').length} color="bg-amber-500" />
        </div>
      )}

      {/* Earned Badges */}
      {user?.badges?.length > 0 && (
        <div className="glass p-4 rounded-2xl">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Your Badges</p>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badge) => {
              const def = badgeDefs.find((d) => d.id === badge.id);
              return (
                <span
                  key={badge.id}
                  title={def?.description || badge.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-blue-500/10 text-blue-300 border border-blue-500/20"
                >
                  <span role="img" aria-hidden>{def?.icon || '🏅'}</span>
                  <span className="text-xs font-medium">{def?.name || badge.id}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Search projects..."
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-navy-700 border border-navy-500">
          {[
            { key: 'my', label: `My Projects (${myProjects.length})` },
            { key: 'browse', label: 'Browse All' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === key
                  ? 'bg-blue-500 text-white shadow-glow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-navy-700 border border-navy-500 flex items-center justify-center mb-5">
            <FolderOpen size={32} className="text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            {activeTab === 'my' ? 'No projects yet' : 'No projects found'}
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-xs">
            {activeTab === 'my'
              ? 'Create your first project and invite your team to start collaborating.'
              : 'Try a different search term or be the first to create a project!'}
          </p>
          {activeTab === 'my' && (
            <button onClick={() => setCreateOpen(true)} className="btn-primary">
              <Plus size={16} />
              Create First Project
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {displayProjects.map((project, i) => (
            <div key={project._id} className="relative group">
              <ProjectCard project={project} index={i} />
              {/* Browse tab join button */}
              {activeTab === 'browse' && !myProjects.some((p) => p._id === project._id) && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleJoin(project._id); }}
                  className="absolute top-4 right-4 btn-secondary text-xs py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Request to Join
                </button>
              )}
            </div>
          ))}
        </motion.div>
      )}

      <CreateProjectModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </motion.div>
  );
}
