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
    console.warn('Could not read token from storage:', error);
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const eventsApi = {
  getAll: () => api.get('/events'),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

export default api;

