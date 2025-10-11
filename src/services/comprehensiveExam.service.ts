import apiClient from './api';

export const comprehensiveExamService = {
  async createExam(subjects: string[]) {
    const response = await apiClient.post('/comprehensive-exam/create', { subjects });
    return response.data.data;
  },

  async getExam(examId: string) {
    const response = await apiClient.get(`/comprehensive-exam/${examId}`);
    return response.data.data;
  },

  async getUserExams() {
    const response = await apiClient.get('/comprehensive-exam/list');
    return response.data.data;
  },

  async startDay(examId: string, dayNumber: number) {
    const response = await apiClient.post(`/comprehensive-exam/${examId}/day/${dayNumber}/start`);
    return response.data.data;
  },

  async completeDay(examId: string, dayNumber: number, sessionId: string) {
    const response = await apiClient.post(`/comprehensive-exam/${examId}/day/${dayNumber}/complete`, {
      sessionId
    });
    return response.data.data;
  },

  async getResults(examId: string) {
    const response = await apiClient.get(`/comprehensive-exam/${examId}/results`);
    return response.data.data;
  }
};