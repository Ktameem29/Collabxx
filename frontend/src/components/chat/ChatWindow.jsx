import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Smile } from 'lucide-react';
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

export default function ChatWindow({ project }) {
  const { user } = useAuth();
  const { joinProject, leaveProject, sendMessage, startTyping, stopTyping, on, off } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load messages + join room
  useEffect(() => {
    if (!project?._id) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await messagesAPI.getByProject(project._id);
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      } catch {
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    load();
    joinProject(project._id);

    // Re-join room on socket reconnect (e.g. after brief disconnect)
    const handleReconnect = () => joinProject(project._id);
    on('connect', handleReconnect);

    return () => {
      leaveProject(project._id);
      off('connect', handleReconnect);
    };
  }, [project._id]); // eslint-disable-line

  // Socket listeners
  useEffect(() => {
    const handleNew = (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(scrollToBottom, 50);
    };

    const handleTypingStart = ({ userId, userName, avatar }) => {
      if (userId === user._id) return;
      setTypingUsers((prev) => prev.some((u) => u.userId === userId) ? prev : [...prev, { userId, userName, avatar }]);
    };

    const handleTypingStop = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    on('message:new', handleNew);
    on('typing:start', handleTypingStart);
    on('typing:stop', handleTypingStop);

    return () => {
      off('message:new', handleNew);
      off('typing:start', handleTypingStart);
      off('typing:stop', handleTypingStop);
    };
  }, [user._id]); // eslint-disable-line

  const handleTyping = (e) => {
    setText(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping(project._id);
    }

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      stopTyping(project._id);
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;

    clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    stopTyping(project._id);

    sendMessage(project._id, msg);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Group messages by date
  const grouped = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== lastDate) {
      grouped.push({ type: 'divider', date: msg.createdAt });
      lastDate = msgDate;
    }
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
              if (item.type === 'divider') {
                return <DateDivider key={`d-${i}`} date={item.date} />;
              }

              const msg = item.data;
              const isMe = msg.sender?._id === user._id;
              const prevMsg = grouped[i - 1];
              const showAvatar = !isMe && (
                prevMsg?.type !== 'message' ||
                prevMsg.data?.sender?._id !== msg.sender?._id
              );

              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end`}
                >
                  {/* Avatar */}
                  {!isMe ? (
                    <div className="w-7 h-7 flex-shrink-0">
                      {showAvatar && <Avatar user={msg.sender} size="xs" />}
                    </div>
                  ) : null}

                  <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {showAvatar && !isMe && (
                      <span className="text-xs text-gray-500 mb-1 ml-1">{msg.sender?.name}</span>
                    )}
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-blue-500 text-white rounded-tr-sm'
                        : 'bg-navy-600 text-gray-200 border border-navy-500 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-xs text-gray-600 mt-1 px-1">
                      {formatMsgDate(msg.createdAt)}
                    </span>
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
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-1.5 border-t border-navy-500"
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-blue-400"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                  />
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
      <form onSubmit={handleSend} className="px-4 py-3 border-t border-navy-500 bg-navy-700">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              rows={1}
              className="w-full px-4 py-3 pr-10 rounded-xl bg-navy-800 border border-navy-500 text-gray-200 placeholder-gray-600
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                text-sm resize-none transition-all duration-200"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow disabled:shadow-none shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
