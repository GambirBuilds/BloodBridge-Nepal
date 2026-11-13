import apiClient from './apiClient';

export const authService = {
  async register(data) {
    return apiClient.post('/auth/register', data);
  },

  async login(email, password) {
    return apiClient.post('/auth/login', { email, password });
  },

  async refresh(refreshToken) {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  async logout() {
    return apiClient.post('/auth/logout');
  },

  async getMe() {
    return apiClient.get('/auth/me');
  },

  async changePassword(currentPassword, newPassword) {
    return apiClient.post('/auth/change-password', { currentPassword, newPassword });
  },
};
