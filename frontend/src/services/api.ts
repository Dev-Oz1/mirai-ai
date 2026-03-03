import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '');
const API_BASE_URL = normalizedBaseUrl.endsWith('/api')
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data).then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data),
  oauthStart: (provider: 'google' | 'github', redirectUri: string) =>
    api
      .get(`/auth/oauth/${provider}/start`, {
        params: { redirect_uri: redirectUri },
      })
      .then((res) => res.data),
  oauthExchange: (
    provider: 'google' | 'github',
    payload: { code: string; state: string; redirect_uri: string },
  ) => api.post(`/auth/oauth/${provider}/exchange`, payload).then((res) => res.data),
  heartbeat: () => api.post('/users/heartbeat').then((res) => res.data),
};

export const jobsAPI = {
  getAll: () => api.get('/jobs').then((res) => res.data),
  getById: (id: number) => api.get(`/jobs/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/jobs', data).then((res) => res.data),
  update: (id: number, data: any) => api.put(`/jobs/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/jobs/${id}`).then((res) => res.data),
};

export const coverLettersAPI = {
  getAll: () => api.get('/cover-letters').then((res) => res.data),
  getById: (id: number) => api.get(`/cover-letters/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/cover-letters', data).then((res) => res.data),
  delete: (id: number) => api.delete(`/cover-letters/${id}`).then((res) => res.data),
  generate: (data: any) => api.post('/cover-letters/generate', data).then((res) => res.data),
};
export const settingsAPI = {
  updateProfile: (data: { name?: string; data_sharing_consent?: boolean }) =>
    api.put('/users/me', data).then((res) => res.data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put('/users/password', data).then((res) => res.data),
  updatePrivacy: (dataSharing: boolean) =>
    api
      .put('/users/privacy-settings', null, { params: { data_sharing: dataSharing } })
      .then((res) => res.data),
  deleteAccount: (data: { confirmation_text: string; current_password?: string }) =>
    api.delete('/users/me', { data }).then((res) => res.data),
  getSessionInfo: () => api.get('/users/session-info').then((res) => res.data),
};

const getAdminAuthConfig = () => {
  const adminToken = localStorage.getItem('admin_token');
  if (!adminToken) {
    return {};
  }
  return {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  };
};

export const adminAPI = {
  login: (data: { username: string; password: string }) =>
    api.post('/admin/auth/login', data).then((res) => res.data),
  getSummary: () => api.get('/admin/summary', getAdminAuthConfig()).then((res) => res.data),
  getUsers: (params?: { search?: string; limit?: number; offset?: number }) =>
    api.get('/admin/users', { ...getAdminAuthConfig(), params }).then((res) => res.data),
  getUserSessions: (userId: number, limit = 30) =>
    api
      .get(`/admin/users/${userId}/sessions`, { ...getAdminAuthConfig(), params: { limit } })
      .then((res) => res.data),
  deleteUser: (userId: number) =>
    api.delete(`/admin/users/${userId}`, getAdminAuthConfig()).then((res) => res.data),
  forceLogoutAllUsers: () =>
    api.post('/admin/users/force-logout-all', null, getAdminAuthConfig()).then((res) => res.data),
  forceLogoutUser: (userId: number) =>
    api.post(`/admin/users/${userId}/force-logout`, null, getAdminAuthConfig()).then((res) => res.data),
  getAuditLogs: (params?: { limit?: number; action?: string }) =>
    api.get('/admin/audit-logs', { ...getAdminAuthConfig(), params }).then((res) => res.data),
};
