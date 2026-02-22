import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0); // join request notification badge

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authAPI.getMe();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
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
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setPendingCount(0);
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
      login, register, logout, updateUser, refreshUser,
      pendingCount, setPendingCount,
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
