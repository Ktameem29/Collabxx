import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, BookOpen, Edit2, Save, X, Plus, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', skills: user?.skills || [] });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const avatarRef = useRef();

  const startEdit = () => {
    setForm({ name: user?.name || '', bio: user?.bio || '', skills: [...(user?.skills || [])] });
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setSkillInput(''); };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s) && form.skills.length < 20) {
      setForm((p) => ({ ...p, skills: [...p.skills, s] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setForm((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploadingAvatar(true);
    try {
      const { data } = await authAPI.uploadAvatar(formData);
      updateUser({ ...user, avatar: data.avatar });
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Min. 6 characters');
    setSavingPw(true);
    try {
      await authAPI.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Avatar + Info */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar user={user} size="xl" />
            <button
              onClick={() => avatarRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-glow hover:bg-blue-600 transition-colors border-2 border-navy-700"
            >
              {uploadingAvatar
                ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Camera size={14} className="text-white" />
              }
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>

          {/* Name / email */}
          <div className="flex-1">
            {editing ? (
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="input text-lg font-semibold"
                placeholder="Full Name"
                maxLength={60}
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-100">{user?.name}</h2>
            )}
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Mail size={13} />
              <span>{user?.email}</span>
            </div>
            {user?.role === 'admin' && (
              <span className="inline-block mt-2 badge bg-purple-500/10 text-purple-400 border border-purple-500/20">Admin</span>
            )}
          </div>

          {/* Edit button */}
          {!editing ? (
            <button onClick={startEdit} className="btn-secondary">
              <Edit2 size={15} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancelEdit} className="btn-ghost"><X size={15} /></button>
              <button onClick={saveProfile} disabled={saving} className="btn-primary">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={15} /> Save</>}
              </button>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-1.5"><BookOpen size={13} /> Bio</label>
          {editing ? (
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className="input resize-none"
              rows={3}
              placeholder="Tell your team about yourself..."
              maxLength={500}
            />
          ) : (
            <p className="text-sm text-gray-400 leading-relaxed">
              {user?.bio || <span className="text-gray-600 italic">No bio yet</span>}
            </p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <h3 className="font-semibold text-gray-200 mb-4">Skills & Technologies</h3>
        {editing ? (
          <>
            <div className="flex gap-2 mb-3">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                className="input flex-1"
                placeholder="e.g. React, Python, UI/UX..."
                maxLength={30}
              />
              <button onClick={addSkill} type="button" className="btn-secondary px-3"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-navy-600 text-gray-300 border border-navy-500">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            {user?.skills?.length > 0
              ? user.skills.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-full text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20">{s}</span>
                ))
              : <p className="text-sm text-gray-600 italic">No skills added yet</p>
            }
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2"><Lock size={15} /> Change Password</h3>
        <form onSubmit={savePassword} className="space-y-4 max-w-sm">
          {[
            { name: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
            { name: 'newPassword', label: 'New Password', placeholder: 'Min. 6 characters' },
            { name: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm[name]}
                  onChange={(e) => setPwForm((p) => ({ ...p, [name]: e.target.value }))}
                  className="input pr-10"
                  placeholder={placeholder}
                  required
                />
                <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={savingPw} className="btn-primary">
            {savingPw ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="card">
        <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2"><User size={15} /> Account Info</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Member since</p>
            <p className="text-gray-300">{new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Account type</p>
            <p className="text-gray-300 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
