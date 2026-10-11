import axios from 'axios';

// Base API URL with environment variable fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach JWT token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Automatically clear session and redirect on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user storage
      localStorage.removeItem('campus_token');
      localStorage.removeItem('campus_user');
      
      // Dispatch custom event for AuthContext to pick up immediately
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
