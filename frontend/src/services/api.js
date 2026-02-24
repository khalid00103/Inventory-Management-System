// ============================================
// API SERVICE - AXIOS CONFIGURATION
// ============================================

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return Promise.reject(data);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        success: false,
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Something else happened
      return Promise.reject({
        success: false,
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// ============================================
// PRODUCTS API
// ============================================

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
  getCategories: () => api.get('/products/categories'),
};

// ============================================
// TRANSACTIONS API
// ============================================

export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  getToday: () => api.get('/transactions/today'),
  getSummary: (params) => api.get('/transactions/summary', { params }),
  getDailySummary: () => api.get('/transactions/daily-summary'),
  getProductHistory: (productId, limit) =>
    api.get(`/transactions/product/${productId}/history`, { params: { limit } }),
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getSalesAnalytics: (params) => api.get('/dashboard/sales-analytics', { params }),
  getTopSelling: (params) => api.get('/dashboard/top-selling', { params }),
  getStockMovement: (params) => api.get('/dashboard/stock-movement', { params }),
  getCategoryDistribution: () => api.get('/dashboard/category-distribution'),
};

export default api;
