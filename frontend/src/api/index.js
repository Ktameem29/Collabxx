import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
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
  googleLogin: () => { window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/google`; },
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
  recalculateMerit: (userId) => api.post(`/admin/merit/recalculate/${userId}`),
};

// Universities
export const universitiesAPI = {
  getAll: () => api.get('/universities'),
  getById: (id) => api.get(`/universities/${id}`),
  create: (data) => api.post('/universities', data),
  update: (id, data) => api.put(`/universities/${id}`, data),
  delete: (id) => api.delete(`/universities/${id}`),
  uploadLogo: (id, formData) =>
    api.post(`/universities/${id}/logo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Waitlist
export const waitlistAPI = {
  getAll: (params) => api.get('/waitlist', { params }),
  approve: (id) => api.post(`/waitlist/${id}/approve`),
  reject: (id, adminNote) => api.post(`/waitlist/${id}/reject`, { adminNote }),
};

// Hackathons
export const hackathonsAPI = {
  getAll: (params) => api.get('/hackathons', { params }),
  getById: (id) => api.get(`/hackathons/${id}`),
  create: (data) => api.post('/hackathons', data),
  update: (id, data) => api.put(`/hackathons/${id}`, data),
  delete: (id) => api.delete(`/hackathons/${id}`),
  updateStatus: (id, status) => api.put(`/hackathons/${id}/status`, { status }),
  addJudge: (id, userId) => api.post(`/hackathons/${id}/judges`, { userId }),
  removeJudge: (id, userId) => api.delete(`/hackathons/${id}/judges/${userId}`),
  setWinners: (id, winners) => api.post(`/hackathons/${id}/winners`, { winners }),

  // Teams
  getTeams: (id) => api.get(`/hackathons/${id}/teams`),
  getMyTeam: (id) => api.get(`/hackathons/${id}/teams/my`),
  createTeam: (id, data) => api.post(`/hackathons/${id}/teams`, data),
  inviteToTeam: (id, teamId, userId) => api.post(`/hackathons/${id}/teams/${teamId}/invite`, { userId }),
  acceptInvite: (id, teamId) => api.post(`/hackathons/${id}/teams/${teamId}/accept`),
  declineInvite: (id, teamId) => api.post(`/hackathons/${id}/teams/${teamId}/decline`),
  leaveTeam: (id, teamId) => api.delete(`/hackathons/${id}/teams/${teamId}/leave`),

  // Submissions
  getSubmissions: (id) => api.get(`/hackathons/${id}/submissions`),
  getMySubmission: (id) => api.get(`/hackathons/${id}/submissions/my`),
  submit: (id, data) => api.post(`/hackathons/${id}/submissions`, data),
  updateSubmission: (id, sid, data) => api.put(`/hackathons/${id}/submissions/${sid}`, data),

  // Scoring
  getMyScores: (id) => api.get(`/hackathons/${id}/scores`),
  submitScore: (id, data) => api.post(`/hackathons/${id}/scores`, data),

  // Leaderboard
  getLeaderboard: (id) => api.get(`/hackathons/${id}/leaderboard`),
};

// Merit
export const meritAPI = {
  getLeaderboard: (params) => api.get('/merit/leaderboard', { params }),
  getUniversityLeaderboard: (uniId, params) => api.get(`/merit/leaderboard/university/${uniId}`, { params }),
  getMe: () => api.get('/merit/me'),
  recalculate: (userId) => api.post(`/merit/recalculate/${userId}`),
  recalculateAll: () => api.post('/merit/recalculate/all'),
};

export default api;
