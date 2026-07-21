import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      const savedUserStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (savedUserStr && token) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          if (mounted) setUser(parsedUser);
        } catch (e) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          if (mounted) setUser(null);
          if (mounted) setLoading(false);
          return;
        }
      } else {
        if (mounted) setLoading(false);
        return;
      }
      
      // Finish loading state immediately
      if (mounted) setLoading(false);

      // Validate token in background
      try {
        const response = await apiClient.get('/auth/me');
        if (mounted) {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          if (mounted) setUser(null);
        }
        // Do not clear session for network failure, timeout, 5xx, etc.
        // Do not repeatedly display the service-unavailable toast.
      }
    };
    initAuth();
    return () => { mounted = false; };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      let message = 'Login failed';
      if (!error.response || error.response.status >= 500) {
        message = 'Authentication service is currently unavailable. Please try again shortly.';
      } else if (error.response.status === 401) {
        message = 'Invalid email or password.';
      } else if (error.response.status === 422) {
        message = error.response.data?.detail ? (typeof error.response.data.detail === 'string' ? error.response.data.detail : JSON.stringify(error.response.data.detail)) : 'Validation error';
      } else {
        message = error.response.data?.detail || 'Invalid email or password.';
      }
      toast.error(message);
      throw error;
    }
  };

  const register = async (data) => {
    try {
      // Backend now returns the token on registration for auto-login
      const response = await apiClient.post('/auth/register', data);
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success('Account created successfully.');
      return userData;
    } catch (error) {
      let message = 'Registration failed';
      if (!error.response || error.response.status >= 500) {
        message = 'Authentication service is currently unavailable. Please try again shortly.';
      } else if (error.response.status === 409 || error.response.status === 400) {
        message = error.response.data?.detail || 'Account already exists.';
      } else if (error.response.status === 422) {
        message = error.response.data?.detail ? (typeof error.response.data.detail === 'string' ? error.response.data.detail : JSON.stringify(error.response.data.detail)) : 'Validation error';
      } else if (error.response.status === 401) {
        message = 'Invalid email or password.';
      } else {
        message = error.response.data?.detail || 'Registration failed. Try a different email.';
      }
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
