import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gavel, Clock, CheckCircle, Star } from 'lucide-react';
import { hackathonsAPI } from '../api';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';

const CRITERIA = ['innovation', 'technicality', 'presentation', 'impact'];

function ScoreSlider({ label, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs capitalize text-gray-400 font-medium">{label}</label>
        <span className="text-xs font-bold text-blue-400 w-4 text-right">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-blue-500"
      />
      <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
        <span>0</span><span>10</span>
      </div>
    </div>
  );
}

export default function JudgeDashboard() {
  const [hackathons, setHackathons]   = useState([]);
  const [selected, setSelected]       = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [scored, setScored]           = useState({});   // submissionId → true
  const [forms, setForms]             = useState({});   // submissionId → { innovation, ... feedback }
  const [submitting, setSubmitting]   = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    hackathonsAPI.getAll({ status: 'judging' })
      .then(({ data }) => {
        setHackathons(data);
        if (data.length > 0) loadHackathon(data[0]);
        else setLoading(false);
      })
      .catch(() => { toast.error('Failed to load hackathons'); setLoading(false); });
  }, []); // eslint-disable-line

  const loadHackathon = async (hackathon) => {
    setSelected(hackathon);
    try {
      const [subRes, scoreRes] = await Promise.all([
        hackathonsAPI.getSubmissions(hackathon._id),
        hackathonsAPI.getMyScores(hackathon._id),
      ]);

      // Index existing scores by submission id
      const existingBySubId = {};
      for (const s of scoreRes.data) {
        const sid = s.submission?._id ?? s.submission;
        existingBySubId[sid] = s;
      }

      // Build initial form state
      const initialForms = {};
      const initialScored = {};
      for (const sub of subRes.data) {
        const ex = existingBySubId[sub._id];
        initialForms[sub._id] = {
          innovation:    ex?.scores?.innovation    ?? 5,
          technicality:  ex?.scores?.technicality  ?? 5,
          presentation:  ex?.scores?.presentation  ?? 5,
          impact:        ex?.scores?.impact        ?? 5,
          feedback:      ex?.feedback              ?? '',
        };
        if (ex) initialScored[sub._id] = true;
      }

      setSubmissions(subRes.data);
      setForms(initialForms);
      setScored(initialScored);
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getTotal = (form) =>
    CRITERIA.reduce((sum, k) => sum + (Number(form?.[k]) || 0), 0);

  const updateForm = (subId, key, value) =>
    setForms((prev) => ({ ...prev, [subId]: { ...prev[subId], [key]: value } }));

  const submitScore = async (subId) => {
    setSubmitting(subId);
    try {
      const form = forms[subId];
      await hackathonsAPI.submitScore(selected._id, {
        submissionId: subId,
        scores: {
          innovation:   Number(form.innovation),
          technicality: Number(form.technicality),
          presentation: Number(form.presentation),
          impact:       Number(form.impact),
        },
        feedback: form.feedback || '',
      });
      setScored((prev) => ({ ...prev, [subId]: true }));
      toast.success('Score submitted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit score');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <Gavel size={20} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Judge Panel</h1>
          <p className="text-sm text-gray-500">Score hackathon submissions</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : hackathons.length === 0 ? (
        <div className="card text-center py-12">
          <Clock size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">No hackathons in judging phase</p>
          <Link to="/hackathons" className="text-blue-400 text-sm hover:underline">Browse all hackathons →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Hackathon selector */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1 mb-1">Hackathons</p>
            {hackathons.map((h) => (
              <button
                key={h._id}
                onClick={() => loadHackathon(h)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                  selected?._id === h._id
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                    : 'bg-navy-700 border-navy-500 text-gray-400 hover:border-blue-500/30 hover:text-gray-200'
                }`}
              >
                {h.title}
              </button>
            ))}
          </div>

          {/* Submissions */}
          <div className="lg:col-span-3 space-y-4">
            {submissions.length === 0 ? (
              <div className="card text-center py-10 text-gray-500">No submissions yet</div>
            ) : (
              submissions.map((sub) => {
                const form     = forms[sub._id] || {};
                const isScored = Boolean(scored[sub._id]);
                const total    = getTotal(form);

                return (
                  <div
                    key={sub._id}
                    className={`card space-y-4 ${isScored ? 'border border-emerald-500/25' : ''}`}
                  >
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {isScored && <CheckCircle size={14} className="text-emerald-400 shrink-0" />}
                          <h3 className="font-semibold text-gray-200 truncate">{sub.title}</h3>
                        </div>
                        <p className="text-xs text-gray-500">Team: {sub.team?.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-blue-400">
                          {total}<span className="text-sm text-gray-500">/40</span>
                        </p>
                        <p className="text-[10px] text-gray-600 mt-0.5">live total</p>
                      </div>
                    </div>

                    {/* Links */}
                    {(sub.repoUrl || sub.demoUrl) && (
                      <div className="flex gap-4 text-sm">
                        {sub.repoUrl && <a href={sub.repoUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Repository ↗</a>}
                        {sub.demoUrl && <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Demo ↗</a>}
                      </div>
                    )}

                    {sub.description && (
                      <p className="text-sm text-gray-500 leading-relaxed">{sub.description}</p>
                    )}

                    {/* Score sliders */}
                    <div className="grid grid-cols-2 gap-4">
                      {CRITERIA.map((criterion) => (
                        <ScoreSlider
                          key={criterion}
                          label={criterion}
                          value={form[criterion] ?? 5}
                          onChange={(v) => updateForm(sub._id, criterion, v)}
                        />
                      ))}
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Feedback (optional)</label>
                      <textarea
                        value={form.feedback || ''}
                        onChange={(e) => updateForm(sub._id, 'feedback', e.target.value)}
                        className="input resize-none text-sm"
                        rows={2}
                        placeholder="Your feedback for the team…"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={() => submitScore(sub._id)}
                      disabled={submitting === sub._id}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {submitting === sub._id
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <><Star size={14} /> {isScored ? 'Update Score' : 'Submit Score'}</>}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
