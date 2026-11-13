import apiClient from './apiClient';

export const notificationService = {
  async getNotifications() {
    return apiClient.get('/notifications');
  },

  async markAsRead(id) {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return apiClient.patch('/notifications/read-all');
  },
};
