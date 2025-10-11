import apiClient from './api';

export const analyticsService = {
  async getDashboard() {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data.data;
  },

  async getSubjectAnalytics(subjectId: string) {
    const response = await apiClient.get(`/analytics/subjects/${subjectId}`);
    return response.data.data;
  },

  async getPerformanceTrend() {
    const response = await apiClient.get('/analytics/trend');
    return response.data.data;
  },

  async getWeakAreas() {
    const response = await apiClient.get('/analytics/weak-areas');
    return response.data.data;
  }
};