import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Get API base URL from environment or construct it
const getApiBaseUrl = () => {
  // If VITE_API_BASE_URL is explicitly set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // In production, use the API URL from the environment or construct from window location
  if (import.meta.env.PROD) {
    // Example: If frontend is on https://app.example.com, try https://api.example.com
    return `${import.meta.env.VITE_API_URL || 'https://api.example.com'}/api/v1`;
  }
  
  // In development, use localhost
  return 'http://localhost:8000/api/v1';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Sessions
export const getSessions = () => api.get('/sessions');
export const getSession = (id) => api.get(`/sessions/${id}`);
export const getSessionByToken = (token) => api.get(`/sessions/token/${token}`);
export const getCabinetSessions = () => api.get('/cabinet/sessions');
export const createSession = (data) => api.post('/cabinet/sessions', data);
export const updateSession = (id, data) => api.put(`/admin/sessions/${id}`, data);
export const deleteSession = (id) => api.delete(`/admin/sessions/${id}`);
export const getSessionQrCode = (id) => api.get(`/cabinet/sessions/${id}/qrcode`);
export const getSessionCheckins = (id) => api.get(`/cabinet/sessions/${id}/checkins`);

// Attendees (new system)
export const registerAttendee = (data) => api.post('/attendees', data);
export const searchAttendees = (q) => api.get('/attendees/search', { params: { q } });
export const checkIn = (data) => api.post('/checkin', data);

// Cabinet
export const getCabinetStats = () => api.get('/cabinet/stats');
export const getNeverAttended = () => api.get('/cabinet/never-attended');

// Auth
export const login = (data) => api.post('/auth/login', data);
export const setupAdmin = (data) => api.post('/auth/setup', data);

// Admin
export const getAttendees = (params) => api.get('/admin/attendees', { params });
export const exportCSV = (params) => api.get('/admin/attendees/export', {
  params,
  responseType: 'blob',
});
export const getCabinetUsers = () => api.get('/admin/users');
export const createCabinetUser = (data) => api.post('/admin/users', data);
export const deactivateUser = (id) => api.post(`/admin/users/${id}/deactivate`);
export const getAnalytics = () => api.get('/admin/analytics');

export default api;
