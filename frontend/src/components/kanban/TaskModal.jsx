import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { tasksAPI } from '../../api';
import toast from 'react-hot-toast';
import { Calendar, User, Flag } from 'lucide-react';
import Avatar from '../ui/Avatar';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['todo', 'doing', 'done'];

const priorityColors = {
  low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function TaskModal({ isOpen, onClose, task, project, onSaved, initialStatus = 'todo' }) {
  const [form, setForm] = useState({
    title: '', description: '', status: initialStatus, priority: 'medium', assignedTo: '', dueDate: '',
  });
  const [loading, setLoading] = useState(false);
  const isEdit = !!task;

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignedTo: task.assignedTo?._id || '',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    } else {
      setForm({ title: '', description: '', status: initialStatus, priority: 'medium', assignedTo: '', dueDate: '' });
    }
  }, [task, initialStatus, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      if (isEdit) {
        const { data } = await tasksAPI.update(task._id, {
          ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null,
        });
        toast.success('Task updated');
        onSaved(data, 'update');
      } else {
        const { data } = await tasksAPI.create({
          projectId: project._id,
          ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null,
        });
        toast.success('Task created');
        onSaved(data, 'create');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const members = project?.members?.map((m) => m.user).filter(Boolean) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Task' : 'Create Task'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Task Title *</label>
          <input name="title" value={form.title} onChange={handleChange} className="input" placeholder="What needs to be done?" maxLength={200} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="input resize-none" rows={3} placeholder="Add details..." maxLength={1000} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s === 'todo' ? 'To Do' : s === 'doing' ? 'In Progress' : 'Done'}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1">
              <Flag size={12} /> Priority
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, priority: p }))}
                  className={`flex-1 py-2 text-xs rounded-lg border font-medium capitalize transition-all ${form.priority === p ? priorityColors[p] : 'border-navy-500 text-gray-500 hover:border-gray-400'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1">
              <User size={12} /> Assign To
            </label>
            <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="input">
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1">
              <Calendar size={12} /> Due Date
            </label>
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="input" min={new Date().toISOString().slice(0, 10)} />
          </div>
        </div>

        {/* Assignee preview */}
        {form.assignedTo && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-navy-800 border border-navy-500">
            <Avatar user={members.find((m) => m._id === form.assignedTo)} size="sm" />
            <div>
              <p className="text-xs text-gray-500">Assigned to</p>
              <p className="text-sm font-medium text-gray-200">{members.find((m) => m._id === form.assignedTo)?.name}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isEdit ? 'Saving...' : 'Creating...'}
              </span>
            ) : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
