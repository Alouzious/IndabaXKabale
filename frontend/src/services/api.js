import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
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

// Registrations
export const createRegistration = (data) => api.post('/registrations', data);
export const verifyRegistration = (id) => api.get(`/verify/${id}`);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const setupAdmin = (data) => api.post('/auth/setup', data);

// Cabinet
export const getCabinetStats = () => api.get('/cabinet/stats');

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
