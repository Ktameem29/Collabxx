import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, notificationsAPI } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authAPI.getMe();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        if (data.waitlistStatus === 'pending') setIsWaitlisted(true);
        notificationsAPI.getUnreadCount().then(({ data: n }) => setNotifCount(n.count)).catch(() => {});
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []); // eslint-disable-line

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsWaitlisted(false);
    return data;
  }, []);

  const register = useCallback(async (name, email, password, universityId) => {
    const { data } = await authAPI.register({ name, email, password, universityId });
    if (data.waitlisted) {
      setIsWaitlisted(true);
      return { waitlisted: true, message: data.message };
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  // Called from AuthCallback page after Google OAuth redirect
  const loginWithToken = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData || null);
    setIsWaitlisted(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setPendingCount(0);
    setNotifCount(0);
    setIsWaitlisted(false);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      toast.error('Failed to refresh user data');
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, loginWithToken, updateUser, refreshUser,
      pendingCount, setPendingCount,
      notifCount, setNotifCount,
      isWaitlisted, setIsWaitlisted,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
