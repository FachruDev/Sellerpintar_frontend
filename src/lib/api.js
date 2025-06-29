import axios from 'axios';
import { getCookie } from 'cookies-next';

// Base URL API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sellerpintar-backend.fachru.xyz';

// Buat instance axios dengan default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tambahkan interceptor request untuk menyertakan token auth
api.interceptors.request.use(
  (config) => {
    // Ambil token dari cookie atau localStorage jika kita di browser
    if (typeof window !== 'undefined') {
      const token = getCookie('token') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API Auth
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during registration' };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during login' };
    }
  },
};

// API User
export const userAPI = {
  getProfile: async () => {
    try {
      const response = await api.get('/api/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user profile' };
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update user profile' };
    }
  },

  searchUsers: async (query) => {
    try {
      const response = await api.get(`/api/users/search?email=${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search users' };
    }
  },
};

// API Projects
export const projectsAPI = {
  getAllProjects: async () => {
    try {
      const response = await api.get('/api/projects');
      return { projects: response.data };
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch projects' };
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await api.post('/api/projects', projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create project' };
    }
  },

  getProjectById: async (projectId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch project' };
    }
  },

  updateProject: async (projectId, projectData) => {
    try {
      const response = await api.put(`/api/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update project' };
    }
  },

  deleteProject: async (projectId) => {
    try {
      const response = await api.delete(`/api/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete project' };
    }
  },

  getProjectStats: async (projectId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch project stats' };
    }
  },
};

// API Tasks
export const tasksAPI = {
  getProjectTasks: async (projectId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/tasks`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch tasks' };
    }
  },

  createTask: async (projectId, taskData) => {
    try {
      const response = await api.post(`/api/projects/${projectId}/tasks`, taskData);
      return response.data.task;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create task' };
    }
  },

  getTaskById: async (projectId, taskId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch task' };
    }
  },

  updateTask: async (projectId, taskId, taskData) => {
    try {
      const response = await api.put(`/api/projects/${projectId}/tasks/${taskId}`, taskData);
      return response.data.task;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update task' };
    }
  },

  deleteTask: async (projectId, taskId) => {
    try {
      const response = await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete task' };
    }
  },
};

// API Members
export const membersAPI = {
  getProjectMembers: async (projectId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/members`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch project members' };
    }
  },

  inviteMember: async (projectId, memberData) => {
    try {
      const response = await api.post(`/api/projects/${projectId}/members`, memberData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to invite member' };
    }
  },

  removeMember: async (projectId, membershipId) => {
    try {
      const response = await api.delete(`/api/projects/${projectId}/members/${membershipId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove member' };
    }
  },
};

export default api; 