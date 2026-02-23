import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Plus, Calendar, Users, Clock } from 'lucide-react';
import { hackathonsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import CreateHackathonModal from '../components/hackathons/CreateHackathonModal';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_VARIANT = { upcoming: 'blue', active: 'emerald', judging: 'purple', completed: 'gray' };
const STATUSES = ['', 'upcoming', 'active', 'judging', 'completed'];

function HackathonCard({ hackathon }) {
  const deadline = new Date(hackathon.submissionDeadline);
  const deadlinePassed = isPast(deadline);

  return (
    <Link to={`/hackathons/${hackathon._id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="card overflow-hidden border border-navy-500 hover:border-purple-500/40 transition-all duration-200 cursor-pointer"
        style={{ borderTop: `3px solid ${hackathon.coverColor || '#8B5CF6'}` }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-gray-100 leading-snug">{hackathon.title}</h3>
          <Badge variant={STATUS_VARIANT[hackathon.status]}>{hackathon.status}</Badge>
        </div>

        {hackathon.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{hackathon.description}</p>
        )}

        {hackathon.prizes?.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {hackathon.prizes.slice(0, 2).map((prize) => (
              <span
                key={prize.place}
                className="text-xs px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300"
              >
                {prize.place === 1 ? '🥇' : prize.place === 2 ? '🥈' : '🥉'} {prize.title}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {format(new Date(hackathon.startDate), 'MMM d')} – {format(new Date(hackathon.endDate), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {hackathon.minTeamSize}–{hackathon.maxTeamSize} per team
          </span>
          {!deadlinePassed && (
            <span className="flex items-center gap-1 text-amber-400">
              <Clock size={12} />
              {formatDistanceToNow(deadline, { addSuffix: true })}
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default function Hackathons() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = statusFilter ? { status: statusFilter } : {};
        const { data } = await hackathonsAPI.getAll(params);
        setHackathons(data);
      } catch {
        toast.error('Failed to load hackathons');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [statusFilter]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Trophy size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Hackathons</h1>
            <p className="text-sm text-gray-500">Compete, build, and win</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 rounded-xl bg-navy-700 border border-navy-500">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  statusFilter === s ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>

          {user?.role === 'admin' && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={15} />
              Create
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : hackathons.length === 0 ? (
        <div className="card text-center py-20">
          <Trophy size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No hackathons found</p>
          {user?.role === 'admin' && (
            <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
              Create first hackathon
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {hackathons.map((h, i) => (
            <motion.div
              key={h._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <HackathonCard hackathon={h} />
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateHackathonModal
          onClose={() => setShowCreate(false)}
          onCreated={(h) => {
            setHackathons((prev) => [h, ...prev]);
            setShowCreate(false);
            toast.success('Hackathon created');
          }}
        />
      )}
    </motion.div>
  );
}
