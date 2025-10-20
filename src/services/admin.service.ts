import apiClient from './api';

export const adminService = {
  // Dashboard Stats
  async getDashboardStats() {
    const response = await apiClient.get('/api/admin/stats');
    return response.data.data;
  },

  // User Management
  async getAllUsers(filters?: { status?: string; role?: string; page?: number }) {
    const response = await apiClient.get('/api/admin/users', { params: filters });
    return response.data.data;
  },

  async approveUser(userId: string) {
    const response = await apiClient.post(`/api/admin/users/${userId}/approve`);
    return response.data.data;
  },

  async rejectUser(userId: string, reason?: string) {
    const response = await apiClient.post(`/api/admin/users/${userId}/reject`, { reason });
    return response.data.data;
  },

  async suspendUser(userId: string, reason: string) {
    const response = await apiClient.post(`/api/admin/users/${userId}/suspend`, { reason });
    return response.data.data;
  },

  async activateUser(userId: string) {
    const response = await apiClient.post(`/api/admin/users/${userId}/activate`);
    return response.data.data;
  },

  // Question Management
  async getAllQuestions(filters?: { status?: string; subject?: string; page?: number }) {
    const response = await apiClient.get('/api/admin/questions', { params: filters });
    return response.data.data;
  },

  async approveQuestion(questionId: string) {
    const response = await apiClient.post(`/api/admin/questions/${questionId}/approve`);
    return response.data.data;
  },

  async rejectQuestion(questionId: string, reason: string) {
    const response = await apiClient.post(`/api/admin/questions/${questionId}/reject`, { reason });
    return response.data.data;
  },

  async deleteQuestion(questionId: string) {
    const response = await apiClient.delete(`/api/admin/questions/${questionId}`);
    return response.data.data;
  },

  // School Management
  async getAllSchools(page?: number) {
    const response = await apiClient.get('/api/admin/schools', { params: { page } });
    return response.data.data;
  },

  async approveSchool(schoolId: string) {
    const response = await apiClient.post(`/api/admin/schools/${schoolId}/approve`);
    return response.data.data;
  },
};