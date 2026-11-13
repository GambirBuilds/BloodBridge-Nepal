import axios from 'axios';
import { readStorage, writeStorage } from '../utils/storage';

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  isMockMode: false,
};

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const session = readStorage('auth_session', null);
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const session = readStorage('auth_session', null);
      if (session?.refreshToken) {
        try {
          const res = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
            refreshToken: session.refreshToken,
          });
          if (res.data?.success && res.data.data?.accessToken) {
            const updated = {
              ...session,
              accessToken: res.data.data.accessToken,
              refreshToken: res.data.data.refreshToken || session.refreshToken,
            };
            writeStorage('auth_session', updated);
            originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
            return axios(originalRequest);
          }
        } catch {
          // Refresh failed
        }
      }
    }

    const normalized = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        'Unable to reach BLOODBRIDGE server. Check connection and retry.',
      errors: error.response?.data?.errors || null,
    };
    return Promise.reject(normalized);
  }
);

export default apiClient;
