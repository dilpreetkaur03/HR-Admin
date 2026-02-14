import axios from 'axios';

// API Base URL - configurable via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const IS_DEV = import.meta.env.DEV;

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor for logging (only in development)
apiClient.interceptors.request.use(
  (config) => {
    if (IS_DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (IS_DEV) {
      if (error.response) {
        console.error('[API Error]', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('[API Error] No response received - check if backend is running');
      } else {
        console.error('[API Error]', error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

