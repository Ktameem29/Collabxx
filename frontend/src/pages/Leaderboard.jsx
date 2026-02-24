import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Medal, Star, Building2 } from 'lucide-react';
import { meritAPI, universitiesAPI } from '../api';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = [
  'border-yellow-500/40 bg-yellow-500/5',
  'border-gray-400/30 bg-gray-400/5',
  'border-amber-700/30 bg-amber-700/5',
];

function Podium({ users }) {
  if (users.length < 3) return null;
  // order: 2nd, 1st, 3rd
  const order = [users[1], users[0], users[2]];
  const ranks  = [2, 1, 3];

  return (
    <div className="grid grid-cols-3 gap-4">
      {order.map((u, i) => (
        <motion.div
          key={u._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`card flex flex-col items-center gap-2 py-5 border ${RANK_COLORS[ranks[i] - 1]} ${ranks[i] === 1 ? 'ring-1 ring-yellow-500/20' : ''}`}
        >
          <span className="text-2xl">{RANK_MEDALS[ranks[i] - 1]}</span>
          <Avatar user={u} size="md" />
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-200 truncate max-w-[100px]">{u.name}</p>
            {u.university && (
              <p className="text-xs text-gray-500 truncate max-w-[100px]">{u.university.name}</p>
            )}
          </div>
          <p className={`text-lg font-bold ${ranks[i] === 1 ? 'text-yellow-400' : ranks[i] === 2 ? 'text-gray-300' : 'text-amber-600'}`}>
            {u.meritScore}
          </p>
          <p className="text-xs text-gray-600">pts</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function Leaderboard() {
  const [users, setUsers]             = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedUni, setSelectedUni] = useState('');
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    universitiesAPI.getAll()
      .then(({ data }) => setUniversities(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const req = selectedUni
      ? meritAPI.getUniversityLeaderboard(selectedUni)
      : meritAPI.getLeaderboard();

    req
      .then(({ data }) => setUsers(data.users))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, [selectedUni]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
            <Medal size={20} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Merit Leaderboard</h1>
            <p className="text-sm text-gray-500">Ranked by activity across all features</p>
          </div>
        </div>

        {universities.length > 0 && (
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <select
              value={selectedUni}
              onChange={(e) => setSelectedUni(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-xl bg-navy-700 border border-navy-500 text-gray-300 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Universities</option>
              {universities.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Podium */}
      {!loading && users.length >= 3 && <Podium users={users} />}

      {/* Full list */}
      <div className="card divide-y divide-navy-500">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No users found</div>
        ) : (
          users.map((u, idx) => (
            <motion.div
              key={u._id}
              layout
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.4), duration: 0.3, ease: 'easeOut' }}
              whileHover={{ x: 4, backgroundColor: 'rgba(99,102,241,0.04)' }}
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 -mx-6 px-6 transition-colors rounded-xl"
            >
              <div className="w-8 text-center shrink-0">
                {idx < 3
                  ? <span className="text-lg">{RANK_MEDALS[idx]}</span>
                  : <span className="text-sm text-gray-500">#{idx + 1}</span>}
              </div>

              <Avatar user={u} size="sm" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{u.name}</p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {u.university?.name || u.role}
                </p>
              </div>

              <p className="text-sm font-bold text-yellow-400 shrink-0 w-16 text-right">
                {u.meritScore} <span className="text-xs text-gray-500 font-normal">pts</span>
              </p>

              <div className="hidden sm:grid grid-cols-4 gap-3 text-center text-xs shrink-0 w-48">
                <div>
                  <p className="text-gray-200 font-semibold">{u.meritBreakdown?.projectCompletions ?? 0}</p>
                  <p className="text-gray-600">Projects</p>
                </div>
                <div>
                  <p className="text-gray-200 font-semibold">{u.meritBreakdown?.tasksCompleted ?? 0}</p>
                  <p className="text-gray-600">Tasks</p>
                </div>
                <div>
                  <p className="text-gray-200 font-semibold">{u.meritBreakdown?.hackathonParticipations ?? 0}</p>
                  <p className="text-gray-600">Hackathons</p>
                </div>
                <div>
                  <p className="text-yellow-400 font-semibold">{u.meritBreakdown?.hackathonWins ?? 0}</p>
                  <p className="text-gray-600">Wins</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Scoring legend */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Star size={14} className="text-yellow-400" />
          How merit is calculated
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { label: 'Project completed', pts: '+10',  color: 'text-blue-400'   },
            { label: 'Task completed',    pts: '+2',   color: 'text-blue-400'   },
            { label: 'Hackathon joined',  pts: '+10',  color: 'text-blue-400'   },
            { label: 'Hackathon win',     pts: '+50',  color: 'text-yellow-400' },
          ].map(({ label, pts, color }) => (
            <div key={label} className="p-3 rounded-xl bg-navy-700 border border-navy-500">
              <p className={`font-bold text-lg mb-1 ${color}`}>{pts} pts</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
