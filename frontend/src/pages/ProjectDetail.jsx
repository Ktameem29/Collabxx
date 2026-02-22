import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, KanbanSquare, MessageSquare, Upload,
  Settings, UserPlus, LogOut, Crown, Tag, Globe, Lock,
  Trash2, MoreVertical,
} from 'lucide-react';
import { projectsAPI, tasksAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { SkeletonProjectDetail } from '../components/ui/Skeleton';
import KanbanBoard from '../components/kanban/KanbanBoard';
import ChatWindow from '../components/chat/ChatWindow';
import FileUpload from '../components/files/FileUpload';
import FileList from '../components/files/FileList';
import JoinRequests from '../components/projects/JoinRequests';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Users },
  { id: 'kanban', label: 'Kanban', icon: KanbanSquare },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'files', label: 'Files', icon: Upload },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [fileRefresh, setFileRefresh] = useState(0);
  const [joining, setJoining] = useState(false);
  const [taskStats, setTaskStats] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await projectsAPI.getById(id);
        setProject(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Project not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const isMember = project?.members?.some((m) => m.user?._id === user?._id);
  const isOwner = project?.owner?._id === user?._id;
  const isPending = project?.pendingRequests?.some((r) => (r._id || r) === user?._id);
  const myRole = project?.members?.find((m) => m.user?._id === user?._id)?.role;

  const handleJoin = async () => {
    setJoining(true);
    try {
      await projectsAPI.join(id);
      toast.success('Join request sent!');
      setProject((p) => ({ ...p, pendingRequests: [...(p.pendingRequests || []), user] }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave this project?')) return;
    try {
      await projectsAPI.leave(id);
      toast.success('Left project');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await projectsAPI.delete(id);
      toast.success('Project deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await projectsAPI.removeMember(id, memberId);
      setProject((p) => ({ ...p, members: p.members.filter((m) => m.user?._id !== memberId) }));
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  // Fetch task stats for overview tab
  useEffect(() => {
    if (!project?._id || (!isMember && !isOwner)) return;
    tasksAPI.getByProject(project._id).then(({ data }) => {
      setTaskStats({
        total: data.length,
        todo: data.filter((t) => t.status === 'todo').length,
        doing: data.filter((t) => t.status === 'doing').length,
        done: data.filter((t) => t.status === 'done').length,
      });
    }).catch(() => {});
  }, [project?._id, isMember, isOwner]); // eslint-disable-line

  if (loading) return <SkeletonProjectDetail />;

  if (!project) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/dashboard')} className="btn-ghost p-2 mt-1">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: project.coverColor || '#3B82F6' }} />
            <h1 className="text-2xl font-bold text-gray-100 truncate">{project.title}</h1>
            <Badge variant={project.status === 'active' ? 'emerald' : project.status === 'completed' ? 'blue' : 'gray'}>
              {project.status}
            </Badge>
            {project.isPublic ? (
              <span className="flex items-center gap-1 text-xs text-gray-500"><Globe size={12} /> Public</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-500"><Lock size={12} /> Private</span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{project.description}</p>
          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {project.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-navy-600 text-gray-400 border border-navy-500">
                  <Tag size={9} />{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isMember && !isOwner && !isPending && (
            <button onClick={handleJoin} disabled={joining} className="btn-primary">
              <UserPlus size={16} /> Request to Join
            </button>
          )}
          {isPending && <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">Request pending</span>}
          {isMember && !isOwner && (
            <button onClick={handleLeave} className="btn-danger">
              <LogOut size={15} /> Leave
            </button>
          )}
          {isOwner && (
            <button onClick={handleDelete} className="btn-danger">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Join requests for owner */}
      {isOwner && project.pendingRequests?.length > 0 && (
        <JoinRequests project={project} onUpdate={setProject} />
      )}

      {/* Tabs */}
      {(isMember || isOwner) && (
        <>
          <div className="flex gap-1 p-1 rounded-xl bg-navy-700 border border-navy-500 w-fit">
            {TABS.map(({ id: tid, label, icon: Icon }) => (
              <button
                key={tid}
                onClick={() => setTab(tid)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === tid ? 'bg-blue-500 text-white shadow-glow' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Overview */}
              {tab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="card">
                      <h3 className="font-semibold text-gray-200 mb-3">About</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{project.description}</p>
                    </div>

                    {/* Task progress */}
                    {taskStats && (
                      <div className="card">
                        <h3 className="font-semibold text-gray-200 mb-4">Task Progress</h3>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {[
                            { label: 'To Do', value: taskStats.todo, color: 'text-gray-300', bg: 'bg-navy-600' },
                            { label: 'In Progress', value: taskStats.doing, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            { label: 'Done', value: taskStats.done, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                          ].map(({ label, value, color, bg }) => (
                            <div key={label} className={`text-center p-3 rounded-xl ${bg} border border-navy-500`}>
                              <p className={`text-2xl font-bold ${color}`}>{value}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="h-2 rounded-full bg-navy-800 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: taskStats.total ? `${(taskStats.done / taskStats.total) * 100}%` : '0%' }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5 text-right">
                          {taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0}% complete · {taskStats.total} total tasks
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Members panel */}
                  <div className="card space-y-4">
                    <h3 className="font-semibold text-gray-200">Team ({project.members?.length})</h3>
                    <div className="space-y-2.5">
                      {project.members?.map(({ user: member, role, joinedAt }) => (
                        member && (
                          <div key={member._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-navy-600 transition-colors group">
                            <Avatar user={member} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-200 truncate">{member.name}</p>
                                {role === 'owner' && <Crown size={12} className="text-amber-400 shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-500 truncate">{member.email}</p>
                            </div>
                            {isOwner && member._id !== user._id && (
                              <button
                                onClick={() => handleRemoveMember(member._id)}
                                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <MoreVertical size={14} />
                              </button>
                            )}
                          </div>
                        )
                      ))}
                    </div>

                    {/* Skills */}
                    {project.members?.some((m) => m.user?.skills?.length > 0) && (
                      <div className="pt-3 border-t border-navy-500">
                        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Team Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[...new Set(project.members?.flatMap((m) => m.user?.skills || []))].slice(0, 12).map((skill) => (
                            <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-navy-600 text-gray-400 border border-navy-500">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Kanban */}
              {tab === 'kanban' && <KanbanBoard project={project} />}

              {/* Chat */}
              {tab === 'chat' && <ChatWindow project={project} />}

              {/* Files */}
              {tab === 'files' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="font-semibold text-gray-200 mb-4">Upload Files</h3>
                    <FileUpload
                      project={project}
                      onUploaded={() => setFileRefresh((n) => n + 1)}
                    />
                  </div>
                  <div className="card">
                    <h3 className="font-semibold text-gray-200 mb-4">Project Files</h3>
                    <FileList project={project} refresh={fileRefresh} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* Non-member view */}
      {!isMember && !isOwner && (
        <div className="card text-center py-12">
          <Lock size={32} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 font-medium">You are not a member of this project</p>
          <p className="text-sm text-gray-600 mt-2 mb-6">Request to join to access the kanban board, chat, and files.</p>
          {!isPending ? (
            <button onClick={handleJoin} disabled={joining} className="btn-primary mx-auto">
              <UserPlus size={16} /> Request to Join
            </button>
          ) : (
            <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">Request pending</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
