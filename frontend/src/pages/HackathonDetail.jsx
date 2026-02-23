import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, Users, Clock, Calendar, Target, Send,
  Gavel, BarChart3, Crown,
} from 'lucide-react';
import { hackathonsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const STATUS_VARIANT = { upcoming: 'blue', active: 'emerald', judging: 'purple', completed: 'gray' };

const TABS = [
  { id: 'overview',     label: 'Overview',     icon: Target    },
  { id: 'team',         label: 'My Team',       icon: Users     },
  { id: 'submission',   label: 'Submission',    icon: Send      },
  { id: 'leaderboard',  label: 'Leaderboard',   icon: BarChart3 },
];

export default function HackathonDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { joinHackathon, leaveHackathon, on, off } = useSocket();

  const [hackathon, setHackathon]   = useState(null);
  const [myTeam, setMyTeam]         = useState(null);
  const [submission, setSubmission] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('overview');
  const [teamName, setTeamName]     = useState('');
  const [subForm, setSubForm]       = useState({ title: '', description: '', repoUrl: '', demoUrl: '', techStack: '' });
  const [working, setWorking]       = useState(false);

  const isAdmin     = user?.role === 'admin';
  const isLeader    = myTeam?.leader && (myTeam.leader._id ?? myTeam.leader).toString() === user?._id?.toString();
  const deadlinePast = hackathon ? isPast(new Date(hackathon.submissionDeadline)) : false;
  const inJudging   = hackathon ? ['judging', 'completed'].includes(hackathon.status) : false;

  const load = useCallback(async () => {
    try {
      const [hRes, teamRes, subRes] = await Promise.all([
        hackathonsAPI.getById(id),
        hackathonsAPI.getMyTeam(id),
        hackathonsAPI.getMySubmission(id),
      ]);
      setHackathon(hRes.data);
      setMyTeam(teamRes.data);
      setSubmission(subRes.data);
      if (['judging', 'completed'].includes(hRes.data.status)) {
        const lbRes = await hackathonsAPI.getLeaderboard(id);
        setLeaderboard(lbRes.data);
      }
    } catch {
      toast.error('Failed to load hackathon');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    joinHackathon(id);

    const onLbUpdate      = ({ leaderboard: lb }) => setLeaderboard(lb);
    const onStatusChange  = ({ status }) => setHackathon((h) => h ? { ...h, status } : h);
    const onWinners       = ({ winners }) => setHackathon((h) => h ? { ...h, winners, status: 'completed' } : h);

    on('hackathon:leaderboard:update', onLbUpdate);
    on('hackathon:status:change',      onStatusChange);
    on('hackathon:winners:announced',  onWinners);

    return () => {
      leaveHackathon(id);
      off('hackathon:leaderboard:update', onLbUpdate);
      off('hackathon:status:change',      onStatusChange);
      off('hackathon:winners:announced',  onWinners);
    };
  }, [id]); // eslint-disable-line

  const createTeam = async () => {
    if (!teamName.trim()) return;
    setWorking(true);
    try {
      const { data } = await hackathonsAPI.createTeam(id, { name: teamName });
      setMyTeam(data);
      toast.success('Team created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    } finally {
      setWorking(false);
    }
  };

  const submitProject = async (e) => {
    e.preventDefault();
    setWorking(true);
    try {
      const payload = {
        ...subForm,
        techStack: subForm.techStack.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await hackathonsAPI.submit(id, payload);
      setSubmission(data);
      toast.success('Project submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setWorking(false);
    }
  };

  const changeStatus = async (status) => {
    try {
      await hackathonsAPI.updateStatus(id, status);
      setHackathon((h) => ({ ...h, status }));
      toast.success(`Status → ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!hackathon) return (
    <div className="text-gray-500 text-center py-20">Hackathon not found</div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl space-y-6">

      {/* ── Header card ───────────────────────────────────────────────────────── */}
      <div className="card" style={{ borderTop: `3px solid ${hackathon.coverColor || '#8B5CF6'}` }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant={STATUS_VARIANT[hackathon.status]}>{hackathon.status}</Badge>
              {hackathon.participatingUniversities?.length > 0 && (
                <Badge variant="gray">{hackathon.participatingUniversities.length} unis</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-100 mb-1">{hackathon.title}</h1>
            {hackathon.description && (
              <p className="text-gray-400 text-sm">{hackathon.description}</p>
            )}
          </div>

          {isAdmin && (
            <div className="flex gap-1.5 flex-wrap shrink-0">
              {['upcoming', 'active', 'judging', 'completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  disabled={hackathon.status === s}
                  className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-all disabled:opacity-40 ${
                    hackathon.status === s
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'border-navy-500 text-gray-400 hover:border-purple-500/50 hover:text-purple-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {format(new Date(hackathon.startDate), 'MMM d')} – {format(new Date(hackathon.endDate), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            Deadline: {format(new Date(hackathon.submissionDeadline), 'MMM d, h:mm a')}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} />
            {hackathon.minTeamSize}–{hackathon.maxTeamSize} per team
          </span>
          {hackathon.judges?.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Gavel size={14} />
              {hackathon.judges.length} judge{hackathon.judges.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Winners banner */}
        {hackathon.status === 'completed' && hackathon.winners?.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <p className="text-sm font-semibold text-yellow-300 flex items-center gap-2 mb-2">
              <Crown size={15} className="text-yellow-400" />
              Winners Announced
            </p>
            <div className="flex gap-2 flex-wrap">
              {hackathon.winners.map((w) => (
                <span key={w.place} className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 px-2 py-1 rounded-lg">
                  {w.place === 1 ? '🥇' : w.place === 2 ? '🥈' : '🥉'} {w.team?.name || 'Team'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-xl bg-navy-700 border border-navy-500 w-fit overflow-x-auto">
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            onClick={() => setTab(tid)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === tid ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview ──────────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hackathon.prizes?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-purple-400" /> Prizes
              </h3>
              <div className="space-y-3">
                {hackathon.prizes.map((prize) => (
                  <div key={prize.place} className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{prize.place === 1 ? '🥇' : prize.place === 2 ? '🥈' : '🥉'}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-200">{prize.title}</p>
                      {prize.description && <p className="text-xs text-gray-500 mt-0.5">{prize.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hackathon.judges?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Gavel size={16} className="text-blue-400" /> Judges
              </h3>
              <div className="space-y-2">
                {hackathon.judges.map((j) => (
                  <div key={j._id} className="flex items-center gap-3">
                    <Avatar user={j} size="sm" />
                    <div>
                      <p className="text-sm text-gray-200">{j.name}</p>
                      <p className="text-xs text-gray-500">{j.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hackathon.participatingUniversities?.length > 0 && (
            <div className="card lg:col-span-2">
              <h3 className="font-semibold text-gray-200 mb-3">Participating Universities</h3>
              <div className="flex flex-wrap gap-2">
                {hackathon.participatingUniversities.map((u) => (
                  <span key={u._id} className="text-sm px-3 py-1.5 rounded-xl bg-navy-700 border border-navy-500 text-gray-300">
                    {u.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── My Team ───────────────────────────────────────────────────────────── */}
      {tab === 'team' && (
        !myTeam ? (
          <div className="card text-center py-10">
            {hackathon.status === 'active' ? (
              <>
                <Users size={40} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-5">You're not on a team yet</p>
                <div className="flex gap-2 max-w-xs mx-auto">
                  <input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createTeam()}
                    className="input flex-1"
                    placeholder="Team name…"
                  />
                  <button
                    onClick={createTeam}
                    disabled={working || !teamName.trim()}
                    className="btn-primary"
                  >
                    {working ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create'}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Team registration is closed.</p>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-100">{myTeam.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {myTeam.members.length} member{myTeam.members.length !== 1 ? 's' : ''}
                  {myTeam.hasSubmitted && (
                    <span className="ml-2 text-emerald-400 font-medium">✓ Submitted</span>
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {myTeam.members.map((m) => (
                <div key={m.user?._id || m.user} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-800 border border-navy-500">
                  <Avatar user={m.user} size="sm" />
                  <p className="text-sm text-gray-200 flex-1">{m.user?.name}</p>
                  <Badge variant={m.role === 'leader' ? 'blue' : 'gray'}>{m.role}</Badge>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* ── Submission ────────────────────────────────────────────────────────── */}
      {tab === 'submission' && (
        <div className="card">
          {submission ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Send size={15} className="text-emerald-400" />
                </div>
                <h3 className="font-semibold text-gray-200">Your Submission</h3>
              </div>

              {[
                { label: 'Project Title',  value: submission.title },
                { label: 'Description',    value: submission.description },
              ].filter((f) => f.value).map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-gray-200 text-sm">{value}</p>
                </div>
              ))}

              {[
                { label: 'Repository', value: submission.repoUrl },
                { label: 'Demo',       value: submission.demoUrl },
              ].filter((f) => f.value).map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <a href={value} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline break-all">{value}</a>
                </div>
              ))}

              {submission.techStack?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tech Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {submission.techStack.map((t) => (
                      <span key={t} className="text-xs px-2 py-1 rounded-lg bg-navy-700 border border-navy-500 text-gray-300">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {submission.totalScore !== null && submission.totalScore !== undefined && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-gray-500 mb-1">Average Score</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {submission.totalScore.toFixed(1)}
                    <span className="text-sm text-gray-500 ml-1">/40</span>
                  </p>
                </div>
              )}
            </div>
          ) : !myTeam ? (
            <p className="text-gray-500 text-center py-6">Join or create a team first.</p>
          ) : !isLeader ? (
            <p className="text-gray-500 text-center py-6">Only the team leader can submit.</p>
          ) : deadlinePast ? (
            <p className="text-gray-500 text-center py-6">Submission deadline has passed.</p>
          ) : (
            <form onSubmit={submitProject} className="space-y-4">
              <h3 className="font-semibold text-gray-200">Submit your project</h3>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Project Title *</label>
                <input value={subForm.title} onChange={(e) => setSubForm((p) => ({ ...p, title: e.target.value }))} className="input" placeholder="My Awesome App" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                <textarea value={subForm.description} onChange={(e) => setSubForm((p) => ({ ...p, description: e.target.value }))} className="input resize-none" rows={3} placeholder="What does your project do?" />
              </div>

              {[
                { key: 'repoUrl',   label: 'Repository URL', placeholder: 'https://github.com/…' },
                { key: 'demoUrl',   label: 'Demo URL',        placeholder: 'https://yourapp.com'  },
                { key: 'techStack', label: 'Tech Stack',      placeholder: 'React, Node.js, MongoDB (comma separated)' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
                  <input value={subForm[key]} onChange={(e) => setSubForm((p) => ({ ...p, [key]: e.target.value }))} className="input" placeholder={placeholder} />
                </div>
              ))}

              <button type="submit" disabled={working} className="btn-primary w-full">
                {working
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Submit Project'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── Leaderboard ───────────────────────────────────────────────────────── */}
      {tab === 'leaderboard' && (
        !inJudging ? (
          <div className="card text-center py-10 text-gray-500">
            Leaderboard is visible once judging begins.
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="card text-center py-10 text-gray-500">
            No submissions scored yet.
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((s, i) => (
              <motion.div
                key={s._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`card flex items-center gap-4 ${s.isWinner ? 'border border-yellow-500/30 bg-yellow-500/5' : ''}`}
              >
                <div className="w-8 text-center text-lg shrink-0">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-sm text-gray-500">#{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-200 truncate">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.team?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-purple-400">
                    {s.totalScore !== null && s.totalScore !== undefined ? s.totalScore.toFixed(1) : '—'}
                  </p>
                  <p className="text-xs text-gray-500">avg score</p>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </motion.div>
  );
}
