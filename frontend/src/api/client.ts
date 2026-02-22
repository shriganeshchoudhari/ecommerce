import axios from 'axios';

// Automatically determining API base url from env or local default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the JWT token to requests
api.interceptors.request.use(
  (config) => {
    // We'll manage the token in Zustand, but fallback to localStorage if needed
    const token = typeof window !== 'undefined' ? localStorage.getItem('shopease_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Logic to handle token expiry / logout will be connected here
      if (typeof window !== 'undefined') {
        localStorage.removeItem('shopease_token');
        // Avoid redirecting if already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
