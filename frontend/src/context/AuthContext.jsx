import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('campus_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campus_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on mount or refresh
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('campus_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('campus_user', JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.warn('Session verification failed, resetting auth state:', error.message);
        localStorage.removeItem('campus_token');
        localStorage.removeItem('campus_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();

    // Listen for unauthorized 401 broadcast events from Axios interceptor
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = (authToken, authUser) => {
    localStorage.setItem('campus_token', authToken);
    localStorage.setItem('campus_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isStudent = isAuthenticated && user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isStudent,
        login,
        logout
      }}
    >
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
