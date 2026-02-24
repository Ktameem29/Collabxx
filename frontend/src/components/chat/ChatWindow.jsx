import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, BarChart2, X, Plus, Trash2 } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { messagesAPI } from '../../api';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

function formatMsgDate(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

function DateDivider({ date }) {
  const d = new Date(date);
  const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy');
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-navy-500" />
      <span className="text-xs text-gray-600 px-2">{label}</span>
      <div className="flex-1 h-px bg-navy-500" />
    </div>
  );
}

function PollMessage({ msg, userId, onVote }) {
  const totalVotes = msg.pollOptions?.reduce((s, o) => s + (o.votes?.length || 0), 0) || 0;
  const myVote = msg.pollOptions?.findIndex((o) => o.votes?.some((v) => (v._id || v) === userId));

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-semibold text-gray-100">{msg.pollQuestion}</p>
      <div className="space-y-2">
        {msg.pollOptions?.map((opt, idx) => {
          const pct = totalVotes > 0 ? Math.round((opt.votes?.length || 0) / totalVotes * 100) : 0;
          const voted = myVote === idx;
          return (
            <button key={opt._id || idx} onClick={() => onVote(msg._id, idx)}
              className={`w-full text-left rounded-xl overflow-hidden border transition-all ${voted ? 'border-blue-500/50' : 'border-navy-500 hover:border-navy-400'}`}>
              <div className="relative px-3 py-2">
                <div className="absolute inset-0 transition-all duration-500" style={{ width: `${pct}%`, background: voted ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)' }} />
                <div className="relative flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-200">{opt.text}</span>
                  <span className="text-xs text-gray-500 shrink-0">{pct}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-600">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
    </div>
  );
}

function PollModal({ isOpen, onClose, onSubmit }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return toast.error('Enter a question');
    const filled = options.filter((o) => o.trim());
    if (filled.length < 2) return toast.error('Add at least 2 options');
    onSubmit(question.trim(), filled);
    setQuestion(''); setOptions(['', '']);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 mx-2 z-20">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-navy-700 border border-navy-500 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-200 flex items-center gap-2"><BarChart2 size={14} className="text-blue-400" />Create Poll</p>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-500 hover:text-gray-300"><X size={14} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={question} onChange={(e) => setQuestion(e.target.value)}
            className="input text-sm" placeholder="Ask a question..." maxLength={200} />
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input value={opt} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                  className="input text-sm flex-1" placeholder={`Option ${i + 1}`} maxLength={100} />
                {options.length > 2 && (
                  <button type="button" onClick={() => setOptions(options.filter((_, j) => j !== i))}
                    className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 5 && (
            <button type="button" onClick={() => setOptions([...options, ''])}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
              <Plus size={12} />Add option
            </button>
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-xs py-2">Cancel</button>
            <button type="submit" className="btn-primary flex-1 text-xs py-2">Create Poll</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ChatWindow({ project }) {
  const { user } = useAuth();
  const { joinProject, leaveProject, sendMessage, on, off, socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [pollOpen, setPollOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!project?._id) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await messagesAPI.getByProject(project._id);
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      } catch { toast.error('Failed to load messages'); } finally { setLoading(false); }
    };
    load();
    joinProject(project._id);
    const handleReconnect = () => joinProject(project._id);
    on('connect', handleReconnect);
    return () => { leaveProject(project._id); off('connect', handleReconnect); };
  }, [project._id]); // eslint-disable-line

  useEffect(() => {
    const handleNew = (msg) => { setMessages((prev) => [...prev, msg]); setTimeout(scrollToBottom, 50); };
    const handlePollUpdated = (msg) => setMessages((prev) => prev.map((m) => m._id === msg._id ? msg : m));
    const handleTypingStart = ({ userId, userName, avatar }) => {
      if (userId === user._id) return;
      setTypingUsers((prev) => prev.some((u) => u.userId === userId) ? prev : [...prev, { userId, userName, avatar }]);
    };
    const handleTypingStop = ({ userId }) => setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    on('message:new', handleNew);
    on('poll:updated', handlePollUpdated);
    on('typing:start', handleTypingStart);
    on('typing:stop', handleTypingStop);
    return () => { off('message:new', handleNew); off('poll:updated', handlePollUpdated); off('typing:start', handleTypingStart); off('typing:stop', handleTypingStop); };
  }, [user._id]); // eslint-disable-line

  const startTyping = () => {
    if (!isTypingRef.current) { isTypingRef.current = true; socket?.emit('typing:start', { projectId: project._id }); }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => { isTypingRef.current = false; socket?.emit('typing:stop', { projectId: project._id }); }, 1500);
  };
  const stopTyping = () => { isTypingRef.current = false; socket?.emit('typing:stop', { projectId: project._id }); };

  const handleTyping = (e) => { setText(e.target.value); startTyping(); };

  const handleSend = (e) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    clearTimeout(typingTimerRef.current);
    stopTyping();
    sendMessage(project._id, msg);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  const handleCreatePoll = (question, options) => {
    socket?.emit('message:send', {
      projectId: project._id, content: `📊 Poll: ${question}`,
      type: 'poll', pollQuestion: question, pollOptions: options,
    });
  };

  const handleVote = (messageId, optionIndex) => {
    socket?.emit('poll:vote', { messageId, optionIndex, projectId: project._id });
  };

  // Group by date
  const grouped = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== lastDate) { grouped.push({ type: 'divider', date: msg.createdAt }); lastDate = msgDate; }
    grouped.push({ type: 'message', data: msg });
  });

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px] rounded-2xl bg-navy-800 border border-navy-500 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-500 bg-navy-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium text-gray-200">Project Chat</span>
        </div>
        <span className="text-xs text-gray-500">{project.members?.length || 0} members</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-navy-700 border border-navy-500 flex items-center justify-center mb-3">
              <Smile size={24} className="text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No messages yet</p>
            <p className="text-xs text-gray-600 mt-1">Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {grouped.map((item, i) => {
              if (item.type === 'divider') return <DateDivider key={`d-${i}`} date={item.date} />;
              const msg = item.data;
              const isPoll = msg.type === 'poll';
              const isMe = msg.sender?._id === user._id;
              const prevMsg = grouped[i - 1];
              const showAvatar = !isMe && (prevMsg?.type !== 'message' || prevMsg.data?.sender?._id !== msg.sender?._id);

              if (isPoll) {
                return (
                  <motion.div key={msg._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                    className="flex gap-2.5 items-end">
                    <div className="w-7 h-7 flex-shrink-0">
                      {showAvatar && <Avatar user={msg.sender} size="xs" />}
                    </div>
                    <div className="flex-1 max-w-[80%]">
                      {showAvatar && <span className="text-xs text-gray-500 mb-1 ml-1 block">{msg.sender?.name}</span>}
                      <div className="p-4 rounded-2xl bg-navy-600 border border-navy-500 rounded-tl-sm">
                        <PollMessage msg={msg} userId={user._id} onVote={handleVote} />
                      </div>
                      <span className="text-xs text-gray-600 mt-1 px-1 block">{formatMsgDate(msg.createdAt)}</span>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div key={msg._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                  {!isMe && <div className="w-7 h-7 flex-shrink-0">{showAvatar && <Avatar user={msg.sender} size="xs" />}</div>}
                  <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {showAvatar && !isMe && <span className="text-xs text-gray-500 mb-1 ml-1">{msg.sender?.name}</span>}
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-navy-600 text-gray-200 border border-navy-500 rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                    <span className="text-xs text-gray-600 mt-1 px-1">{formatMsgDate(msg.createdAt)}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="px-4 py-1.5 border-t border-navy-500">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400"
                    animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }} />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {typingUsers.map((u) => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-4 py-3 border-t border-navy-500 bg-navy-700 relative">
        <PollModal isOpen={pollOpen} onClose={() => setPollOpen(false)} onSubmit={handleCreatePoll} />
        <form onSubmit={handleSend}>
          <div className="flex items-end gap-2">
            <button type="button" onClick={() => setPollOpen((v) => !v)}
              title="Create poll"
              className={`p-2.5 rounded-xl border transition-colors shrink-0 ${pollOpen ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'border-navy-500 text-gray-500 hover:text-gray-300 hover:border-navy-400'}`}>
              <BarChart2 size={16} />
            </button>
            <div className="flex-1">
              <textarea value={text} onChange={handleTyping} onKeyDown={handleKeyDown}
                placeholder="Type a message... (Enter to send)" rows={1}
                className="w-full px-4 py-3 rounded-xl bg-navy-800 border border-navy-500 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-all duration-200"
                style={{ maxHeight: '120px' }} />
            </div>
            <button type="submit" disabled={!text.trim()}
              className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow disabled:shadow-none shrink-0">
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
