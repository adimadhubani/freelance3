import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
      const storedToken = storage.getItem(TOKEN_KEY);
      const storedUser = storage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        try {
          // Sync with server to verify token validity
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        storage.setItem(USER_KEY, JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const saveSession = (receivedToken, receivedUser, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    storage.setItem(TOKEN_KEY, receivedToken);
    storage.setItem(USER_KEY, JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password, remember_me: rememberMe });
      const { token: receivedToken, user: receivedUser } = response.data;
      saveSession(receivedToken, receivedUser, rememberMe);
      return { success: true, user: receivedUser };
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.error || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    saveSession,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
