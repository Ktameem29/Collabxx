import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
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

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const joinProject = (projectId) => socketRef.current?.emit('project:join', projectId);
  const leaveProject = (projectId) => socketRef.current?.emit('project:leave', projectId);

  const sendMessage = (projectId, content, type = 'text', fileUrl = null, fileName = null) => {
    socketRef.current?.emit('message:send', { projectId, content, type, fileUrl, fileName });
  };

  const startTyping = (projectId) => socketRef.current?.emit('typing:start', { projectId });
  const stopTyping = (projectId) => socketRef.current?.emit('typing:stop', { projectId });

  const on = (event, handler) => socketRef.current?.on(event, handler);
  const off = (event, handler) => socketRef.current?.off(event, handler);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      onlineUsers,
      joinProject,
      leaveProject,
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
