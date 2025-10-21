import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CRITICAL: Read token from localStorage, not a local variable
export const setAccessToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

// Add token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Read token from localStorage on EVERY request
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors - but only for actual auth endpoints
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for 401, not 403
    // And only if we're not already on login page
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
