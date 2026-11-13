import apiClient from './apiClient';

export const hospitalService = {
  async listHospitals(params = {}) {
    return apiClient.get('/hospitals', { params });
  },

  async getHospitalById(id) {
    return apiClient.get(`/hospitals/${id}`);
  },

  async registerHospital(payload) {
    return apiClient.post('/hospitals/register', payload);
  },

  async updateProfile(payload) {
    return apiClient.patch('/hospitals/profile', payload);
  },

  async getHospitalRequests() {
    return apiClient.get('/hospitals/requests');
  },

  async verifyRequest(requestId, status, note = '') {
    return apiClient.patch(`/hospitals/requests/${requestId}/verify`, { status, note });
  },

  async getVerificationStatus() {
    return apiClient.get('/hospitals/verification-status');
  },
};
