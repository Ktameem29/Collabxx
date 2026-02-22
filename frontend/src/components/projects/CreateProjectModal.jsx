import { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import Modal from '../ui/Modal';
import { projectsAPI } from '../../api';
import toast from 'react-hot-toast';

const COLOR_OPTIONS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
  '#06B6D4', '#EC4899', '#6366F1', '#14B8A6', '#F97316',
];

export default function CreateProjectModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', tags: '', coverColor: '#3B82F6', isPublic: true,
  });
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags((p) => [...p, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags((p) => p.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.description.trim()) return toast.error('Description is required');

    setLoading(true);
    try {
      const { data } = await projectsAPI.create({ ...form, tags });
      toast.success('Project created!');
      onCreated(data);
      onClose();
      setForm({ title: '', description: '', tags: '', coverColor: '#3B82F6', isPublic: true });
      setTags([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Name *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input"
            placeholder="My Awesome Project"
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input resize-none"
            rows={3}
            placeholder="What are you building? Describe your project..."
            maxLength={500}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              className="input flex-1"
              placeholder="Add a tag and press Enter"
              maxLength={20}
            />
            <button type="button" onClick={addTag} className="btn-secondary px-3">
              <Plus size={16} />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-navy-600 text-gray-300 border border-navy-500">
                  <Tag size={10} />
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-gray-500 hover:text-red-400 transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((p) => ({ ...p, coverColor: color }))}
                className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none"
                style={{ backgroundColor: color, ring: form.coverColor === color ? `3px solid ${color}` : 'none' }}
              >
                {form.coverColor === color && (
                  <span className="block w-full h-full rounded-full ring-2 ring-offset-2 ring-offset-navy-700" style={{ boxShadow: `0 0 0 2px ${color}` }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-navy-800 border border-navy-500">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={form.isPublic}
            onChange={handleChange}
            className="w-4 h-4 rounded accent-blue-500"
          />
          <label htmlFor="isPublic" className="flex-1 cursor-pointer">
            <p className="text-sm font-medium text-gray-200">Public Project</p>
            <p className="text-xs text-gray-500 mt-0.5">Anyone can browse and request to join</p>
          </label>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-xl border border-navy-500 bg-navy-800">
          <div className="h-1 rounded-full mb-3" style={{ background: `linear-gradient(90deg, ${form.coverColor}, transparent)` }} />
          <p className="text-sm font-semibold text-gray-200">{form.title || 'Project Preview'}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{form.description || 'Your description will appear here...'}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </span>
            ) : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
