import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, setNotifCount, refreshUser } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    socketRef.current = io(import.meta.env.VITE_API_URL || window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const s = socketRef.current;

    s.on('connect', () => {
      setIsConnected(true);
      s.emit('users:online');
    });

    s.on('disconnect', () => setIsConnected(false));

    s.on('users:online', (users) => setOnlineUsers(users));
    s.on('user:online', ({ userId }) => setOnlineUsers((prev) => [...new Set([...prev, userId])]));
    s.on('user:offline', ({ userId }) => setOnlineUsers((prev) => prev.filter((id) => id !== userId)));

    s.on('notification:new', ({ type, data }) => {
      setNotifCount((c) => c + 1);
      if (type === 'badge_unlock' && data) {
        toast.success(`${data.icon || '🏆'} Badge Unlocked: ${data.name}!`, { duration: 5000 });
        // Refresh user so Profile/Dashboard badge displays update immediately
        refreshUser();
      }
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [token]); // eslint-disable-line

  const joinProject   = useCallback((id) => socketRef.current?.emit('project:join', id), []);
  const leaveProject  = useCallback((id) => socketRef.current?.emit('project:leave', id), []);
  const joinHackathon = useCallback((id) => socketRef.current?.emit('hackathon:join', id), []);
  const leaveHackathon= useCallback((id) => socketRef.current?.emit('hackathon:leave', id), []);

  const sendMessage = useCallback((projectId, content, type = 'text', fileUrl = null, fileName = null) => {
    socketRef.current?.emit('message:send', { projectId, content, type, fileUrl, fileName });
  }, []);

  const startTyping = useCallback((projectId) => socketRef.current?.emit('typing:start', { projectId }), []);
  const stopTyping  = useCallback((projectId) => socketRef.current?.emit('typing:stop', { projectId }), []);

  const on  = useCallback((event, handler) => socketRef.current?.on(event, handler), []);
  const off = useCallback((event, handler) => socketRef.current?.off(event, handler), []);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      onlineUsers,
      joinProject,
      leaveProject,
      joinHackathon,
      leaveHackathon,
      sendMessage,
      startTyping,
      stopTyping,
      on,
      off,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
