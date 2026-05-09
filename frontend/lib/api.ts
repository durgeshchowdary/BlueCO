import axios from 'axios';

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
).replace(/\/+$/, '');

if (process.env.NODE_ENV === 'development') {
  // Temporary login diagnostics: confirms the browser bundle is not using stale 5000 or /api/api.
  // eslint-disable-next-line no-console
  console.log('[PlayGrid API] baseURL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('playgrid_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = String(error.config?.url || '').includes('/auth/login');

    if (typeof window !== 'undefined' && !isLoginRequest && [401, 403].includes(error.response?.status)) {
      localStorage.removeItem('playgrid_token');
      localStorage.removeItem('playgrid_user');
      localStorage.removeItem('playgrid_role');
      localStorage.removeItem('playgrid_permissions');
      localStorage.removeItem('isAuthenticated');
      document.cookie = 'pg_role=; Max-Age=0; path=/';
      document.cookie = 'pg_token=; Max-Age=0; path=/';
      document.cookie = 'pg_permissions=; Max-Age=0; path=/';
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
