import apiClient from './api';

export interface PracticeSessionConfig {
  name?: string;
  type?: string;
  duration?: number;
  questionCount: number;
  subjectIds: string[];
  topicIds?: string[];
  difficulty?: string;
  category?: string; // ADD THIS
}

export const practiceService = {
  async getSubjects(category?: string) {
    const url = category 
      ? `/practice/subjects?category=${category}`
      : '/practice/subjects';
    
    console.log('🔵 Fetching subjects from:', url); // DEBUG
    
    const response = await apiClient.get(url);
    
    console.log('✅ Raw response:', response.data); // DEBUG
    
    return response.data.data; // Return the data array
  },

  async getTopics(subjectId: string) {
    const response = await apiClient.get(`/practice/subjects/${subjectId}/topics`);
    return response.data.data;
  },

  // Creates a NEW session and returns session + questions
  async startSession(config: PracticeSessionConfig) {
    const response = await apiClient.post('/practice/start', config);
    return response.data.data;
  },

  // Gets an EXISTING session with questions (ADD THIS)
  async getSession(sessionId: string) {
    const response = await apiClient.get(`/practice/sessions/${sessionId}`);
    return response.data.data;
  },

  async submitAnswer(sessionId: string, questionId: string, answer: string) {
    const response = await apiClient.post(`/practice/sessions/${sessionId}/answer`, {
      questionId,
      selectedAnswer: answer,
    });
    return response.data.data;
  },

  async completeSession(sessionId: string) {
    const response = await apiClient.post(`/practice/sessions/${sessionId}/complete`);
    return response.data.data;
  },

  async toggleFlag(sessionId: string, questionId: string, isFlagged: boolean) {
    const response = await apiClient.post(
      `/practice/sessions/${sessionId}/questions/${questionId}/flag`,
      { isFlagged }
    );
    return response.data.data;
  },

  async pauseSession(sessionId: string) {
    const response = await apiClient.post(`/practice/sessions/${sessionId}/pause`);
    return response.data.data;
  },

  async resumeSession(sessionId: string) {
    const response = await apiClient.post(`/practice/sessions/${sessionId}/resume`);
    return response.data.data;
  },

  async getSessionResults(sessionId: string) {
    const response = await apiClient.get(`/practice/${sessionId}/results`);
    return response.data.data;
  },

  // Submit all answers at once (ADD THIS for batch submission)
  async submitAnswers(sessionId: string, answers: Array<{
    questionId: string;
    selectedAnswer: string;
    timeSpent: number;
  }>) {
    const response = await apiClient.post(`/practice/sessions/${sessionId}/submit`, { answers });
    return response.data.data;
  }
};