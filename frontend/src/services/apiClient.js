import axios from 'axios';

let baseURL = '';
const isDev = import.meta.env.DEV;

if (isDev) {
  baseURL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:8000/api/v1';
} else {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (!envUrl) {
    throw new Error('CRITICAL: VITE_API_URL is missing in production build! API requests will fail.');
  }
  baseURL = envUrl;
}

const apiClient = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — redirect to login on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired — clear session and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
