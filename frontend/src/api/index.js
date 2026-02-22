import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  uploadAvatar: (formData) =>
    api.post('/auth/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Projects
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getMy: () => api.get('/projects/my'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  join: (id) => api.post(`/projects/${id}/join`),
  acceptMember: (id, userId) => api.put(`/projects/${id}/accept/${userId}`),
  rejectMember: (id, userId) => api.put(`/projects/${id}/reject/${userId}`),
  leave: (id) => api.delete(`/projects/${id}/leave`),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
};

// Tasks
export const tasksAPI = {
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  reorder: (tasks) => api.put('/tasks/reorder/bulk', { tasks }),
};

// Messages
export const messagesAPI = {
  getByProject: (projectId, params) => api.get(`/messages/project/${projectId}`, { params }),
};

// Files
export const filesAPI = {
  getByProject: (projectId) => api.get(`/files/project/${projectId}`),
  upload: (projectId, formData) =>
    api.post(`/files/project/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/files/${id}`),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getProjects: (params) => api.get('/admin/projects', { params }),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),
};

export default api;
