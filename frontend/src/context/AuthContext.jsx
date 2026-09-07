import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/current-user');
      if (response.data?.success) {
        setCurrentUser(response.data.data);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      // 401 Unauthorized means no active session, totally normal.
      // Other errors might indicate network issues, but we still treat as unauthenticated for safety.
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleAuthExpired = () => {
      setCurrentUser(null);
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
