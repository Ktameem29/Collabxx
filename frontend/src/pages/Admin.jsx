import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FolderOpen, MessageSquare, CheckSquare, Upload,
  ShieldCheck, Trash2, UserCheck, UserX, Search, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { adminAPI } from '../api';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-100">{value?.toLocaleString()}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </motion.div>
);

export default function Admin() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [projPage, setProjPage] = useState(1);
  const [projTotal, setProjTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const PAGE = 15;

  const loadStats = useCallback(async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data);
    } catch { toast.error('Failed to load stats'); }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await adminAPI.getUsers({ search: userSearch, page: userPage, limit: PAGE });
      setUsers(data.users);
      setUserTotal(data.total);
    } catch { toast.error('Failed to load users'); }
  }, [userSearch, userPage]);

  const loadProjects = useCallback(async () => {
    try {
      const { data } = await adminAPI.getProjects({ search: projectSearch, page: projPage, limit: PAGE });
      setProjects(data.projects);
      setProjTotal(data.total);
    } catch { toast.error('Failed to load projects'); }
  }, [projectSearch, projPage]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadUsers(), loadProjects()]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { loadProjects(); }, [loadProjects]);

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const { data } = await adminAPI.updateUser(userId, { isActive: !isActive });
      setUsers((p) => p.map((u) => u._id === userId ? data : u));
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed'); }
  };

  const setUserRole = async (userId, role) => {
    try {
      const { data } = await adminAPI.updateUser(userId, { role });
      setUsers((p) => p.map((u) => u._id === userId ? data : u));
      toast.success(`Role updated to ${role}`);
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers((p) => p.filter((u) => u._id !== userId));
      setUserTotal((t) => t - 1);
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project and all its data?')) return;
    try {
      await adminAPI.deleteProject(projectId);
      setProjects((p) => p.filter((pr) => pr._id !== projectId));
      setProjTotal((t) => t - 1);
      toast.success('Project deleted');
    } catch { toast.error('Failed'); }
  };

  const tabs = [
    { id: 'stats', label: 'Overview', icon: ShieldCheck },
    { id: 'users', label: `Users (${userTotal})`, icon: Users },
    { id: 'projects', label: `Projects (${projTotal})`, icon: FolderOpen },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <ShieldCheck size={20} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Admin Panel</h1>
          <p className="text-sm text-gray-500">Manage users, projects, and platform settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-navy-700 border border-navy-500 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === id ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard icon={Users} label="Total Users" value={stats.stats.users} color="bg-blue-500" />
            <StatCard icon={FolderOpen} label="Projects" value={stats.stats.projects} color="bg-purple-500" />
            <StatCard icon={CheckSquare} label="Tasks" value={stats.stats.tasks} color="bg-emerald-500" />
            <StatCard icon={MessageSquare} label="Messages" value={stats.stats.messages} color="bg-amber-500" />
            <StatCard icon={Upload} label="Files" value={stats.stats.files} color="bg-cyan-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-200 mb-4">Recent Users</h3>
              <div className="space-y-3">
                {stats.recentUsers?.map((u) => (
                  <div key={u._id} className="flex items-center gap-3">
                    <Avatar user={u} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{u.name}</p>
                      <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-200 mb-4">Recent Projects</h3>
              <div className="space-y-3">
                {stats.recentProjects?.map((p) => (
                  <div key={p._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: (p.coverColor || '#3B82F6') + '20' }}>
                      <FolderOpen size={16} style={{ color: p.coverColor || '#3B82F6' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500">by {p.owner?.name}</p>
                    </div>
                    <Badge variant={p.status === 'active' ? 'emerald' : 'gray'}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="card space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                className="input pl-10"
                placeholder="Search users by name or email..."
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-500">
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-500">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-navy-600/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} size="sm" />
                        <div>
                          <p className="font-medium text-gray-200">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <select
                        value={u.role}
                        onChange={(e) => setUserRole(u._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg bg-navy-700 border border-navy-500 text-gray-300"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <Badge variant={u.isActive ? 'emerald' : 'red'}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleUserStatus(u._id, u.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            u.isActive
                              ? 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/20'
                              : 'text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20'
                          }`}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {userTotal > PAGE && (
            <div className="flex items-center justify-between pt-3 border-t border-navy-500">
              <p className="text-xs text-gray-500">Showing {(userPage - 1) * PAGE + 1}–{Math.min(userPage * PAGE, userTotal)} of {userTotal}</p>
              <div className="flex gap-2">
                <button onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1} className="btn-ghost p-2 disabled:opacity-40">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setUserPage((p) => p + 1)} disabled={userPage * PAGE >= userTotal} className="btn-ghost p-2 disabled:opacity-40">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projects */}
      {tab === 'projects' && (
        <div className="card space-y-4">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={projectSearch}
              onChange={(e) => { setProjectSearch(e.target.value); setProjPage(1); }}
              className="input pl-10"
              placeholder="Search projects..."
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-500">
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-500">
                {projects.map((p) => (
                  <tr key={p._id} className="hover:bg-navy-600/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.coverColor || '#3B82F6' }} />
                        <p className="font-medium text-gray-200 truncate max-w-[200px]">{p.title}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar user={p.owner} size="xs" />
                        <span className="text-gray-400 text-xs">{p.owner?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400">{p.members?.length || 0}</td>
                    <td className="py-3">
                      <Badge variant={p.status === 'active' ? 'emerald' : p.status === 'completed' ? 'blue' : 'gray'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => deleteProject(p._id)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {projTotal > PAGE && (
            <div className="flex items-center justify-between pt-3 border-t border-navy-500">
              <p className="text-xs text-gray-500">{projTotal} total projects</p>
              <div className="flex gap-2">
                <button onClick={() => setProjPage((p) => Math.max(1, p - 1))} disabled={projPage === 1} className="btn-ghost p-2 disabled:opacity-40">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setProjPage((p) => p + 1)} disabled={projPage * PAGE >= projTotal} className="btn-ghost p-2 disabled:opacity-40">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
