import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Plus, Trash2 } from 'lucide-react';
import { hackathonsAPI } from '../../api';
import toast from 'react-hot-toast';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export default function CreateHackathonModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    submissionDeadline: '',
    minTeamSize: 1,
    maxTeamSize: 4,
    coverColor: '#8B5CF6',
    isPublic: true,
  });
  const [prizes, setPrizes] = useState([
    { place: 1, title: '', description: '' },
    { place: 2, title: '', description: '' },
    { place: 3, title: '', description: '' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await hackathonsAPI.create({
        ...form,
        prizes: prizes.filter((p) => p.title.trim()),
      });
      onCreated(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create hackathon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-navy-700 border border-navy-500 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-navy-500">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-purple-400" />
            <h2 className="font-semibold text-gray-100">Create Hackathon</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-navy-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="input"
              placeholder="Hackathon name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="input resize-none"
              rows={3}
              placeholder="What's this hackathon about?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Start Date *</label>
              <input type="datetime-local" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">End Date *</label>
              <input type="datetime-local" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} className="input" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Submission Deadline *</label>
            <input type="datetime-local" value={form.submissionDeadline} onChange={(e) => setForm((p) => ({ ...p, submissionDeadline: e.target.value }))} className="input" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Min Team Size</label>
              <input type="number" min={1} max={10} value={form.minTeamSize} onChange={(e) => setForm((p) => ({ ...p, minTeamSize: Number(e.target.value) }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Max Team Size</label>
              <input type="number" min={1} max={10} value={form.maxTeamSize} onChange={(e) => setForm((p) => ({ ...p, maxTeamSize: Number(e.target.value) }))} className="input" />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Cover Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, coverColor: c }))}
                  className={`w-7 h-7 rounded-full transition-all ${form.coverColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-navy-700' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Prizes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Prizes (optional)</label>
            <div className="space-y-2">
              {prizes.map((prize, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-lg shrink-0">{prize.place === 1 ? '🥇' : prize.place === 2 ? '🥈' : '🥉'}</span>
                  <input
                    value={prize.title}
                    onChange={(e) => setPrizes((p) => p.map((pr, j) => j === i ? { ...pr, title: e.target.value } : pr))}
                    className="input flex-1"
                    placeholder={`${prize.place === 1 ? '1st' : prize.place === 2 ? '2nd' : '3rd'} place prize`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-navy-500 text-gray-400 hover:text-gray-200 hover:bg-navy-600 transition-all text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Create Hackathon'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
