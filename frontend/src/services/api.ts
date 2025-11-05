import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Project {
  id: string;
  name: string;
  symbol: string;
  description: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  tokenAddress: string;
  tokenMint: string;
  tokenDecimals: number;
  tokenSupply?: string;
  launchDate?: string;
  launchPrice?: string;
  currentPrice?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FEATURED' | 'ARCHIVED';
  views: number;
  favorites: number;
  swapVolume: string;
  liquidity: string;
  holders: number;
  logoUrl?: string;
  bannerUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    walletAddress: string;
    username?: string;
  };
}

export interface CreateProjectData {
  name: string;
  symbol: string;
  description: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  tokenAddress: string;
  tokenMint: string;
  logoUrl?: string;
  bannerUrl?: string;
  tags?: string[];
}

export const projectApi = {
  // Get all projects
  getProjects: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    tag?: string;
  }) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Get project by ID
  getProject: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data as Project;
  },

  // Get project by token mint
  getProjectByToken: async (tokenMint: string) => {
    const response = await api.get(`/projects/token/${tokenMint}`);
    return response.data as Project;
  },

  // Submit new project
  createProject: async (data: CreateProjectData) => {
    const response = await api.post('/projects', data);
    return response.data as Project;
  },

  // Toggle favorite
  toggleFavorite: async (projectId: string) => {
    const response = await api.post(`/projects/${projectId}/favorite`);
    return response.data;
  },

  // Get featured projects
  getFeatured: async () => {
    const response = await api.get('/projects/featured/list');
    return response.data as Project[];
  },
};

export const metricsApi = {
  // Get project metrics
  getProjectMetrics: async (projectId: string, days: number = 30) => {
    const response = await api.get(`/metrics/project/${projectId}`, {
      params: { days },
    });
    return response.data;
  },

  // Get trending projects
  getTrending: async (limit: number = 10) => {
    const response = await api.get('/metrics/trending', {
      params: { limit },
    });
    return response.data as Project[];
  },
};

export const adminApi = {
  // Get all projects (admin)
  getProjects: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get('/admin/projects', { params });
    return response.data;
  },

  // Update project status
  updateProjectStatus: async (
    projectId: string,
    status: string,
    rejectionReason?: string
  ) => {
    const response = await api.patch(`/admin/projects/${projectId}/status`, {
      status,
      rejectionReason,
    });
    return response.data;
  },

  // Get admin stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

export default api;

