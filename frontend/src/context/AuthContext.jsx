import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Hydrate state from storage on mount
  useEffect(() => {
    const storedToken =
      localStorage.getItem('stayease_token') ||
      sessionStorage.getItem('stayease_token');
    const storedUser =
      localStorage.getItem('stayease_user') ||
      sessionStorage.getItem('stayease_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupt data — clear
        localStorage.removeItem('stayease_token');
        localStorage.removeItem('stayease_user');
        sessionStorage.removeItem('stayease_token');
        sessionStorage.removeItem('stayease_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    (tokenValue, userData, rememberMe = false) => {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('stayease_token', tokenValue);
      storage.setItem('stayease_user', JSON.stringify(userData));

      // Clear the other storage
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('stayease_token');
      otherStorage.removeItem('stayease_user');

      setToken(tokenValue);
      setUser(userData);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Token may already be invalid — proceed with local cleanup
    }

    localStorage.removeItem('stayease_token');
    localStorage.removeItem('stayease_user');
    sessionStorage.removeItem('stayease_token');
    sessionStorage.removeItem('stayease_user');

    setToken(null);
    setUser(null);
    navigate('/');
  }, [navigate]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
