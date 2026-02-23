import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FolderOpen, MessageSquare, CheckSquare, Upload,
  ShieldCheck, Trash2, UserCheck, UserX, Search, ChevronLeft, ChevronRight,
  Building2, Clock, Trophy, Medal, RefreshCw, Plus, X,
} from 'lucide-react';
import { adminAPI, universitiesAPI, waitlistAPI, hackathonsAPI, meritAPI } from '../api';
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

const VALID_ROLES = ['student', 'mentor', 'judge', 'admin'];

export default function Admin() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [hackathons, setHackathons] = useState([]);

  const [userSearch, setUserSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [projPage, setProjPage] = useState(1);
  const [projTotal, setProjTotal] = useState(0);
  const [waitlistFilter, setWaitlistFilter] = useState('pending');

  const [loading, setLoading] = useState(true);
  const [uniForm, setUniForm] = useState({ name: '', domain: '', maxStudents: 100, description: '', location: '' });
  const [showUniForm, setShowUniForm] = useState(false);

  const PAGE = 15;

  const loadStats = useCallback(async () => {
    try { const { data } = await adminAPI.getStats(); setStats(data); }
    catch { toast.error('Failed to load stats'); }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await adminAPI.getUsers({ search: userSearch, page: userPage, limit: PAGE });
      setUsers(data.users); setUserTotal(data.total);
    } catch { toast.error('Failed to load users'); }
  }, [userSearch, userPage]);

  const loadProjects = useCallback(async () => {
    try {
      const { data } = await adminAPI.getProjects({ search: projectSearch, page: projPage, limit: PAGE });
      setProjects(data.projects); setProjTotal(data.total);
    } catch { toast.error('Failed to load projects'); }
  }, [projectSearch, projPage]);

  const loadUniversities = useCallback(async () => {
    try { const { data } = await universitiesAPI.getAll(); setUniversities(data); }
    catch { toast.error('Failed to load universities'); }
  }, []);

  const loadWaitlist = useCallback(async () => {
    try {
      const params = {};
      if (waitlistFilter) params.status = waitlistFilter;
      const { data } = await waitlistAPI.getAll(params);
      setWaitlist(data.entries);
    } catch { toast.error('Failed to load waitlist'); }
  }, [waitlistFilter]);

  const loadHackathons = useCallback(async () => {
    try { const { data } = await hackathonsAPI.getAll(); setHackathons(data); }
    catch { toast.error('Failed to load hackathons'); }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadUsers(), loadProjects(), loadUniversities(), loadWaitlist(), loadHackathons()]);
      setLoading(false);
    };
    load();
  }, []); // eslint-disable-line

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => { loadWaitlist(); }, [loadWaitlist]);

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

  const createUniversity = async (e) => {
    e.preventDefault();
    try {
      const { data } = await universitiesAPI.create(uniForm);
      setUniversities((p) => [data, ...p]);
      setUniForm({ name: '', domain: '', maxStudents: 100, description: '', location: '' });
      setShowUniForm(false);
      toast.success('University created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deleteUniversity = async (id) => {
    if (!window.confirm('Deactivate this university?')) return;
    try {
      await universitiesAPI.delete(id);
      setUniversities((p) => p.map((u) => u._id === id ? { ...u, isActive: false } : u));
      toast.success('University deactivated');
    } catch { toast.error('Failed'); }
  };

  const approveWaitlist = async (id) => {
    try {
      await waitlistAPI.approve(id);
      setWaitlist((p) => p.filter((e) => e._id !== id));
      toast.success('Student approved');
      loadUniversities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const rejectWaitlist = async (id) => {
    const note = window.prompt('Rejection reason (optional):') ?? '';
    try {
      await waitlistAPI.reject(id, note);
      setWaitlist((p) => p.filter((e) => e._id !== id));
      toast.success('Student rejected');
    } catch { toast.error('Failed'); }
  };

  const recalcMerit = async (userId) => {
    try {
      await adminAPI.recalculateMerit(userId);
      toast.success('Merit recalculated');
      loadUsers();
    } catch { toast.error('Failed'); }
  };

  const recalcAll = async () => {
    try {
      await meritAPI.recalculateAll();
      toast.success('Merit recalculated for all users');
      loadUsers();
    } catch { toast.error('Failed'); }
  };

  const deleteHackathon = async (id) => {
    if (!window.confirm('Delete this hackathon and all its data?')) return;
    try {
      await hackathonsAPI.delete(id);
      setHackathons((p) => p.filter((h) => h._id !== id));
      toast.success('Hackathon deleted');
    } catch { toast.error('Failed'); }
  };

  const tabs = [
    { id: 'stats', label: 'Overview', icon: ShieldCheck },
    { id: 'users', label: `Users (${userTotal})`, icon: Users },
    { id: 'projects', label: `Projects (${projTotal})`, icon: FolderOpen },
    { id: 'universities', label: `Universities (${universities.length})`, icon: Building2 },
    { id: 'waitlist', label: `Waitlist (${waitlist.length})`, icon: Clock },
    { id: 'hackathons', label: `Hackathons (${hackathons.length})`, icon: Trophy },
    { id: 'merit', label: 'Merit', icon: Medal },
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
      <div className="flex gap-1 p-1 rounded-xl bg-navy-700 border border-navy-500 w-fit overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              tab === id ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────────── */}
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
                    <Badge variant={u.role === 'admin' ? 'purple' : 'gray'}>{u.role}</Badge>
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

      {/* ── Users ─────────────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="card space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={userSearch} onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }} className="input pl-10" placeholder="Search users..." />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-500">
                  {['User', 'Role', 'Merit', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
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
                      <select value={u.role} onChange={(e) => setUserRole(u._id, e.target.value)} className="text-xs px-2 py-1 rounded-lg bg-navy-700 border border-navy-500 text-gray-300">
                        {VALID_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="py-3">
                      <span className="text-yellow-400 font-semibold text-sm">{u.meritScore || 0}</span>
                    </td>
                    <td className="py-3">
                      <Badge variant={u.isActive ? 'emerald' : 'red'}>{u.isActive ? 'Active' : 'Disabled'}</Badge>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => recalcMerit(u._id)} className="p-1.5 rounded-lg text-yellow-400 hover:bg-yellow-500/10 border border-yellow-500/20 transition-colors" title="Recalculate merit">
                          <RefreshCw size={13} />
                        </button>
                        <button onClick={() => toggleUserStatus(u._id, u.isActive)} className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/20' : 'text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20'}`} title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                        <button onClick={() => deleteUser(u._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {userTotal > PAGE && (
            <div className="flex items-center justify-between pt-3 border-t border-navy-500">
              <p className="text-xs text-gray-500">Showing {(userPage - 1) * PAGE + 1}–{Math.min(userPage * PAGE, userTotal)} of {userTotal}</p>
              <div className="flex gap-2">
                <button onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1} className="btn-ghost p-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
                <button onClick={() => setUserPage((p) => p + 1)} disabled={userPage * PAGE >= userTotal} className="btn-ghost p-2 disabled:opacity-40"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Projects ──────────────────────────────────────────────────────────── */}
      {tab === 'projects' && (
        <div className="card space-y-4">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={projectSearch} onChange={(e) => { setProjectSearch(e.target.value); setProjPage(1); }} className="input pl-10" placeholder="Search projects..." />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-500">
                  {['Project', 'Owner', 'Members', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
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
                    <td className="py-3"><Badge variant={p.status === 'active' ? 'emerald' : p.status === 'completed' ? 'blue' : 'gray'}>{p.status}</Badge></td>
                    <td className="py-3">
                      <div className="flex justify-end">
                        <button onClick={() => deleteProject(p._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"><Trash2 size={13} /></button>
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
                <button onClick={() => setProjPage((p) => Math.max(1, p - 1))} disabled={projPage === 1} className="btn-ghost p-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
                <button onClick={() => setProjPage((p) => p + 1)} disabled={projPage * PAGE >= projTotal} className="btn-ghost p-2 disabled:opacity-40"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Universities ──────────────────────────────────────────────────────── */}
      {tab === 'universities' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowUniForm((p) => !p)} className="btn-primary flex items-center gap-2 text-sm">
              {showUniForm ? <X size={15} /> : <Plus size={15} />}
              {showUniForm ? 'Cancel' : 'Add University'}
            </button>
          </div>

          {showUniForm && (
            <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={createUniversity} className="card space-y-4">
              <h3 className="font-semibold text-gray-200">Add University</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Name *</label>
                  <input value={uniForm.name} onChange={(e) => setUniForm((p) => ({ ...p, name: e.target.value }))} className="input" placeholder="Presidency University" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email Domain *</label>
                  <input value={uniForm.domain} onChange={(e) => setUniForm((p) => ({ ...p, domain: e.target.value }))} className="input" placeholder="presidency.edu.in" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max Students</label>
                  <input type="number" min={1} value={uniForm.maxStudents} onChange={(e) => setUniForm((p) => ({ ...p, maxStudents: Number(e.target.value) }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Location</label>
                  <input value={uniForm.location} onChange={(e) => setUniForm((p) => ({ ...p, location: e.target.value }))} className="input" placeholder="Kolkata, India" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary text-sm">Create University</button>
              </div>
            </motion.form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {universities.map((u) => (
              <div key={u._id} className="card space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-200">{u.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">@{u.domain}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Badge variant={u.isActive ? 'emerald' : 'red'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                    <button onClick={() => deleteUniversity(u._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Capacity</span>
                    <span>{u.currentStudentCount}/{u.maxStudents}</span>
                  </div>
                  <div className="h-1.5 bg-navy-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${u.currentStudentCount >= u.maxStudents ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (u.currentStudentCount / u.maxStudents) * 100)}%` }}
                    />
                  </div>
                </div>
                {u.location && <p className="text-xs text-gray-500">{u.location}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Waitlist ──────────────────────────────────────────────────────────── */}
      {tab === 'waitlist' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected', ''].map((s) => (
              <button key={s} onClick={() => setWaitlistFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${waitlistFilter === s ? 'bg-purple-500 border-purple-500 text-white' : 'border-navy-500 text-gray-400 hover:text-gray-200'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {waitlist.length === 0 ? (
              <div className="card text-center py-8 text-gray-500">No waitlist entries found</div>
            ) : waitlist.map((entry) => (
              <div key={entry._id} className="card flex items-center gap-4 flex-wrap">
                <Avatar user={entry.user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-200">{entry.user?.name}</p>
                  <p className="text-xs text-gray-500">{entry.user?.email}</p>
                  <p className="text-xs text-gray-500 mt-0.5">University: {entry.university?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">Merit at entry</p>
                  <p className="text-yellow-400 font-semibold">{entry.meritScoreAtEntry || 0} pts</p>
                </div>
                <Badge variant={entry.status === 'pending' ? 'amber' : entry.status === 'approved' ? 'emerald' : 'red'}>
                  {entry.status}
                </Badge>
                {entry.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => approveWaitlist(entry._id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                      Approve
                    </button>
                    <button onClick={() => rejectWaitlist(entry._id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Hackathons ────────────────────────────────────────────────────────── */}
      {tab === 'hackathons' && (
        <div className="space-y-4">
          {hackathons.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">No hackathons yet</div>
          ) : (
            <div className="overflow-x-auto card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-500">
                    {['Title', 'Status', 'Teams', 'Judges', 'Actions'].map((h) => (
                      <th key={h} className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-500">
                  {hackathons.map((h) => (
                    <tr key={h._id} className="hover:bg-navy-600/30 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: h.coverColor || '#8B5CF6' }} />
                          <span className="font-medium text-gray-200">{h.title}</span>
                        </div>
                      </td>
                      <td className="py-3"><Badge variant={{ upcoming: 'blue', active: 'emerald', judging: 'purple', completed: 'gray' }[h.status]}>{h.status}</Badge></td>
                      <td className="py-3 text-gray-400">{h.maxTeamSize} max</td>
                      <td className="py-3 text-gray-400">{h.judges?.length || 0}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <a href={`/hackathons/${h._id}`} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 border border-blue-500/20 transition-colors text-xs px-2">View</a>
                          <button onClick={() => deleteHackathon(h._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Merit ─────────────────────────────────────────────────────────────── */}
      {tab === 'merit' && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-200">Merit Score Management</h3>
              <button onClick={recalcAll} className="btn-primary flex items-center gap-2 text-sm">
                <RefreshCw size={14} />
                Recalculate All
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Merit scores update automatically when projects complete or tasks are marked done.
              Use "Recalculate All" to force a full sync.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-center">
              {[
                { label: 'Project completion', pts: '+10 pts' },
                { label: 'Task completed', pts: '+2 pts' },
                { label: 'Hackathon joined', pts: '+10 pts' },
                { label: 'Hackathon win', pts: '+50 pts', highlight: true },
              ].map(({ label, pts, highlight }) => (
                <div key={label} className="p-3 rounded-xl bg-navy-700 border border-navy-500">
                  <p className={`font-bold text-base mb-1 ${highlight ? 'text-yellow-400' : 'text-blue-400'}`}>{pts}</p>
                  <p className="text-gray-500 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top merit users */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-gray-200">Top Students by Merit</h3>
            {users
              .filter((u) => u.meritScore > 0)
              .sort((a, b) => b.meritScore - a.meritScore)
              .slice(0, 10)
              .map((u, i) => (
                <div key={u._id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-5 text-right">#{i + 1}</span>
                  <Avatar user={u} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{u.name}</p>
                  </div>
                  <span className="text-yellow-400 font-semibold text-sm">{u.meritScore} pts</span>
                  <button onClick={() => recalcMerit(u._id)} className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors" title="Recalculate">
                    <RefreshCw size={13} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
