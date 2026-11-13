import apiClient from './apiClient';

export const donorService = {
  async listPublicDonors(params = {}) {
    return apiClient.get('/donors', { params });
  },

  async getDonorById(id) {
    return apiClient.get(`/donors/${id}`);
  },

  async updateAvailability(payload) {
    return apiClient.patch('/donors/availability', payload);
  },

  async updateProfile(payload) {
    return apiClient.patch('/donors/profile', payload);
  },

  async getDonorRequests() {
    return apiClient.get('/donors/requests');
  },

  async getDonationHistory() {
    return apiClient.get('/donors/history');
  },
};
