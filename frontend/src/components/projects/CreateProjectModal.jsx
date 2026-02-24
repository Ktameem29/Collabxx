import { useState } from 'react';
import { X, Plus, Tag, ChevronRight, Sparkles } from 'lucide-react';
import Modal from '../ui/Modal';
import { projectsAPI, tasksAPI } from '../../api';
import toast from 'react-hot-toast';

const COLOR_OPTIONS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
  '#06B6D4', '#EC4899', '#6366F1', '#14B8A6', '#F97316',
];

const TEMPLATES = [
  { id: 'blank', name: 'Blank', icon: '📄', color: '#6366F1', description: 'Start from scratch', tags: [], tasks: [] },
  {
    id: 'hackathon', name: 'Hackathon', icon: '🏆', color: '#F59E0B', description: '24-48h sprint', tags: ['hackathon', 'sprint'],
    tasks: [
      { title: 'Define problem statement', priority: 'high' },
      { title: 'Design system architecture', priority: 'high' },
      { title: 'Set up repository', priority: 'medium' },
      { title: 'Build MVP', priority: 'high' },
      { title: 'Prepare demo & pitch deck', priority: 'high' },
    ],
  },
  {
    id: 'webapp', name: 'Web App', icon: '🌐', color: '#3B82F6', description: 'Full-stack web app', tags: ['web', 'fullstack'],
    tasks: [
      { title: 'Design wireframes & UI', priority: 'medium' },
      { title: 'Set up backend API', priority: 'high' },
      { title: 'Implement authentication', priority: 'high' },
      { title: 'Build core features', priority: 'high' },
      { title: 'Write tests', priority: 'medium' },
      { title: 'Deploy to production', priority: 'medium' },
    ],
  },
  {
    id: 'mobile', name: 'Mobile App', icon: '📱', color: '#10B981', description: 'iOS / Android app', tags: ['mobile', 'react-native'],
    tasks: [
      { title: 'Define app architecture', priority: 'high' },
      { title: 'Design UI/UX mockups', priority: 'high' },
      { title: 'Set up navigation', priority: 'medium' },
      { title: 'Build core screens', priority: 'high' },
      { title: 'Integrate APIs', priority: 'medium' },
      { title: 'Test on device', priority: 'medium' },
    ],
  },
  {
    id: 'research', name: 'Research', icon: '📚', color: '#8B5CF6', description: 'Academic research', tags: ['research', 'academic'],
    tasks: [
      { title: 'Literature review', priority: 'high' },
      { title: 'Define research questions', priority: 'high' },
      { title: 'Data collection', priority: 'medium' },
      { title: 'Analysis & findings', priority: 'high' },
      { title: 'Write draft paper', priority: 'medium' },
      { title: 'Review & submit', priority: 'medium' },
    ],
  },
];

export default function CreateProjectModal({ isOpen, onClose, onCreated }) {
  const [step, setStep] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', coverColor: '#3B82F6', isPublic: true });
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const reset = () => {
    setStep('template'); setSelectedTemplate(null);
    setForm({ title: '', description: '', coverColor: '#3B82F6', isPublic: true });
    setTags([]); setTagInput('');
  };

  const handleClose = () => { reset(); onClose(); };

  const selectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setForm((f) => ({ ...f, coverColor: tpl.color }));
    setTags(tpl.tags);
    setStep('form');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 8) { setTags((p) => [...p, t]); setTagInput(''); }
  };

  const removeTag = (tag) => setTags((p) => p.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.description.trim()) return toast.error('Description is required');
    setLoading(true);
    try {
      const { data: project } = await projectsAPI.create({ ...form, tags });
      if (selectedTemplate?.tasks?.length > 0) {
        await Promise.all(
          selectedTemplate.tasks.map((t) =>
            tasksAPI.create({ projectId: project._id, title: t.title, priority: t.priority, status: 'todo' })
          )
        );
      }
      toast.success('Project created!');
      onCreated(project);
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 'template' ? 'Choose a Template' : 'Create Project'} size="md">
      {step === 'template' ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">Start with a template or from scratch.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEMPLATES.map((tpl) => (
              <button key={tpl.id} onClick={() => selectTemplate(tpl)}
                className="flex items-center gap-3 p-4 rounded-xl bg-navy-800 border border-navy-500 hover:border-blue-500/50 hover:bg-navy-700 transition-all text-left group">
                <span className="text-2xl shrink-0">{tpl.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-200 group-hover:text-white">{tpl.name}</p>
                  <p className="text-xs text-gray-500">{tpl.description}</p>
                  {tpl.tasks.length > 0 && <p className="text-xs text-blue-400 mt-0.5">{tpl.tasks.length} tasks included</p>}
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedTemplate && selectedTemplate.id !== 'blank' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-xs text-blue-300">
                {selectedTemplate.icon} {selectedTemplate.name} template
                {selectedTemplate.tasks.length > 0 && ` · ${selectedTemplate.tasks.length} tasks will be created`}
              </span>
              <button type="button" onClick={() => setStep('template')} className="ml-auto text-xs text-blue-400 hover:text-blue-300">Change</button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Project Name *</label>
            <input name="title" value={form.title} onChange={handleChange} className="input" placeholder="My Awesome Project" maxLength={100} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input resize-none" rows={3} placeholder="What are you building?" maxLength={500} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                className="input flex-1" placeholder="Add a tag and press Enter" maxLength={20} />
              <button type="button" onClick={addTag} className="btn-secondary px-3"><Plus size={16} /></button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-navy-600 text-gray-300 border border-navy-500">
                    <Tag size={10} />{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-gray-500 hover:text-red-400"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button key={color} type="button" onClick={() => setForm((p) => ({ ...p, coverColor: color }))}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none" style={{ backgroundColor: color }}>
                  {form.coverColor === color && <span className="block w-full h-full rounded-full ring-2 ring-offset-2 ring-offset-navy-700" style={{ boxShadow: `0 0 0 2px ${color}` }} />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-navy-800 border border-navy-500">
            <input type="checkbox" id="isPublic" name="isPublic" checked={form.isPublic} onChange={handleChange} className="w-4 h-4 rounded accent-blue-500" />
            <label htmlFor="isPublic" className="flex-1 cursor-pointer">
              <p className="text-sm font-medium text-gray-200">Public Project</p>
              <p className="text-xs text-gray-500 mt-0.5">Anyone can browse and request to join</p>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep('template')} className="btn-secondary flex-1">Back</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</span> : 'Create Project'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
