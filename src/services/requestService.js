import apiClient from './apiClient';

export const requestService = {
  async listRequests(params = {}) {
    return apiClient.get('/requests', { params });
  },

  async getRequestById(id) {
    return apiClient.get(`/requests/${id}`);
  },

  async getMyRequests() {
    return apiClient.get('/requests/my');
  },

  async createRequest(payload) {
    return apiClient.post('/requests', payload);
  },

  async cancelRequest(requestId) {
    return apiClient.patch(`/requests/${requestId}/cancel`);
  },

  async updateRequestStatus(requestId, status, note = '') {
    return apiClient.patch(`/requests/${requestId}/status`, { status, note });
  },

  async inviteDonor(requestId, donorProfileId, note = '') {
    return apiClient.post(`/requests/${requestId}/invitations`, { donorProfileId, note });
  },

  async getMyInvitations() {
    return apiClient.get('/invitations/my');
  },

  async respondToInvitation(invitationId, status, note = '') {
    return apiClient.patch(`/invitations/${invitationId}/respond`, { status, note });
  },

  async reportRequest(requestId, reason, details) {
    return apiClient.post('/reports', {
      targetType: 'BLOOD_REQUEST',
      targetId: requestId,
      reason,
      details,
    });
  },
};
