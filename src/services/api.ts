import axios from 'axios';
import { storage } from '../utils/storage';

// API URL from environment variable (set in Vercel)
// Falls back to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  try {
    const token = storage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Silently fail - token will be null and request will proceed without auth
    // This is expected when storage is blocked
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/users/profile'),
};

export const eventsApi = {
  getAll: () => api.get('/events'),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

export const adminApi = {
  // User management
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  
  // Analytics
  getAnalytics: (params?: any) => api.get('/admin/analytics', { params }),
  getNotifications: () => api.get('/admin/notifications'),
  getActivity: () => api.get('/admin/activity'),
  getFinancialData: (params?: any) => api.get('/admin/financial', { params }),
};

export const safetyApi = {
  getAllAlerts: (params?: any) => api.get('/safety/admin/alerts', { params }),
  getLiveFeed: (params?: any) => api.get('/safety/admin/feed', { params }),
  getUnacknowledgedEmergencies: () => api.get('/safety/admin/emergencies'),
  acknowledgeAlert: (id: string) => api.post(`/safety/admin/acknowledge/${id}`),
  getStatistics: () => api.get('/safety/admin/statistics'),
};

export default api;

