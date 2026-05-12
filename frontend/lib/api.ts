import axios from 'axios';
import { clearAuthSession, getAuthToken } from './auth';
import { captureFrontendException, createClientRequestId } from './observability';

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
).replace(/\/+$/, '');

if (process.env.NODE_ENV === 'development') {
  // Temporary login diagnostics: confirms the browser bundle is not using stale 5000 or /api/api.
  // eslint-disable-next-line no-console
  console.log('[OUT-PLAY API] baseURL:', API_BASE_URL);
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
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-request-id'] = createClientRequestId();
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || '');
    const isLoginRequest = requestUrl.includes('/auth/login');
    const legacyPrefixes = [
      '/students',
      '/coaches',
      '/batches',
      '/attendance',
      '/payments',
      '/events',
      '/dashboard',
      '/tickets',
      '/announcements',
    ];
    const isLegacyModuleRequest = legacyPrefixes.some(
      (prefix) => requestUrl === prefix || requestUrl.startsWith(`${prefix}/`),
    );

    captureFrontendException(error, {
      category: 'api_failure',
      url: requestUrl,
      method: error.config?.method,
      status: error.response?.status,
      requestId: error.response?.headers?.['x-request-id'],
    });

    if (typeof window !== 'undefined' && !isLoginRequest && !isLegacyModuleRequest && error.response?.status === 401) {
      clearAuthSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
