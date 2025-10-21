import apiClient from './api';

export interface Question {
  id: string;
  content: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  explanation?: string;
  correctAnswer: string;
  year?: number;
  subject: {
    id: string;
    name: string;
    code: string;
    categories: string[];
  };
  topic?: {
    id: string;
    name: string;
  };
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  label: string;
  content: string;
  isCorrect?: boolean; // Only returned after checking answer
}

export interface RandomQuestionsParams {
  count?: number;
  subjectIds?: string[];
  topicIds?: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  category?: 'SCIENCE' | 'ART' | 'COMMERCIAL';
  excludeIds?: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  categories: string[];
  _count?: {
    questions: number;
  };
}

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  _count?: {
    questions: number;
  };
}

export const questionsService = {
  // Get all subjects
  getSubjects: async (): Promise<Subject[]> => {
    const response = await apiClient.get('/questions/subjects');
    return response.data.data;
  },

  // Get topics by subject
  getTopics: async (subjectId: string): Promise<Topic[]> => {
    const response = await apiClient.get(`/questions/subjects/${subjectId}/topics`);
    return response.data.data;
  },

  // Get random questions
  getRandomQuestions: async (params: RandomQuestionsParams) => {
    const queryParams = new URLSearchParams();
    
    if (params.count) queryParams.append('count', params.count.toString());
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params.category) queryParams.append('category', params.category);
    if (params.subjectIds?.length) queryParams.append('subjectIds', params.subjectIds.join(','));
    if (params.topicIds?.length) queryParams.append('topicIds', params.topicIds.join(','));
    if (params.excludeIds?.length) queryParams.append('excludeIds', params.excludeIds.join(','));

    const response = await apiClient.get(`/questions/random?${queryParams.toString()}`);
    return response.data.data;
  },

  // Check answer
  checkAnswer: async (questionId: string, answer: string) => {
    const response = await apiClient.post(`/questions/questions/${questionId}/check`, {
      answer
    });
    return response.data.data;
  },

  // Get questions with filters (existing endpoint)
  getQuestions: async (params: {
    subjectIds?: string[];
    topicIds?: string[];
    difficulty?: string;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params.subjectIds?.length) queryParams.append('subjectIds', params.subjectIds.join(','));
    if (params.topicIds?.length) queryParams.append('topicIds', params.topicIds.join(','));
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/questions/questions?${queryParams.toString()}`);
    return response.data.data;
  }
};