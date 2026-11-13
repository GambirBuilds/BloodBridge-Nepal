import apiClient from './apiClient';

export const adminService = {
  async fetchDashboardMetrics() {
    return apiClient.get('/admin/dashboard');
  },

  async getUsers(params = {}) {
    return apiClient.get('/admin/users', { params });
  },

  async getDonors() {
    return apiClient.get('/admin/donors');
  },

  async getRequests() {
    return apiClient.get('/admin/requests');
  },

  async getHospitals() {
    return apiClient.get('/admin/hospitals');
  },

  async updateHospitalVerification(hospitalId, verificationStatus, rejectionReason = '') {
    return apiClient.patch(`/admin/hospitals/${hospitalId}/verification`, {
      verificationStatus,
      rejectionReason,
    });
  },

  async updateUserStatus(userId, status) {
    return apiClient.patch(`/admin/users/${userId}/status`, { status });
  },

  async getReports() {
    return apiClient.get('/admin/reports');
  },

  async reviewReport(reportId, status, actionTaken = '') {
    return apiClient.patch(`/reports/${reportId}/review`, { status, actionTaken });
  },

  async getAuditLogs() {
    return apiClient.get('/admin/audit-logs');
  },
};
