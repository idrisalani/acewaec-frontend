/**
 * frontend/src/services/practice.service.ts
 * ✅ UPDATED - Added imageUrl and duration support
 * 
 * Updated interfaces:
 * - Question: Added optional imageUrl property
 * - SessionData: Added optional duration property (in minutes)
 * 
 * Fixed issues:
 * - Removed duplicate method definitions
 * - Added proper type annotations (no explicit 'any')
 * - Resolved circular references
 * - Cleaned up conflicting properties/accessors
 * - All 19 ESLint no-explicit-any violations resolved
 */

import apiClient from './api';

export interface PracticeSessionConfig {
  name?: string;
  type?: string;
  duration?: number;
  questionCount: number;
  subjectIds: string[];
  topicIds?: string[];
  difficulty?: string;
  category?: string;
}

export interface AnswerSubmission {
  questionId: string;
  selectedAnswer: string;
  timeSpent: number;
  isFlagged?: boolean;
  isCorrect?: boolean;
}

export interface SessionData {
  id: string;
  name: string;
  type: string;
  status: string;
  score?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  createdAt: string;
  completedAt?: string;
  duration?: number;  // ✅ ADDED - Duration in minutes
}

export interface SessionWithQuestions {
  id:string;
  session: SessionData;
  sessionId?: string;
  questions: Question[];
  totalAvailable?: number;
}

export interface Question {
  id: string;
  content: string;
  imageUrl?: string;  // ✅ ADDED - Optional image URL for question illustration
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  explanation?: string;
  correctAnswer: string;
  subject?: {
    id: string;
    name: string;
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
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  categories?: string[];
  description?: string;
  questionCount?: number;
}

export interface PracticeResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface SessionListItem {
  id: string;
  name: string;
  score: number;
  date: string;
  correct: number;
  questions: number;
  status: string;
  completedAt?: string;
  duration?: number;
  startedAt?: string;
}

export interface SessionResults {
  session: SessionData;
  answers: SessionAnswer[];
}

export interface SessionAnswer {
  questionId: string;
  selectedAnswer?: string;
  isCorrect: boolean;
  timeSpent?: number;
  isFlagged: boolean;
  question: Question;
}

/**
 * Practice service for managing practice sessions
 * Handles: sessions, answers, results, and state management
 */
export const practiceService = {
  /**
   * Get all available subjects
   * Optionally filtered by category
   */
  async getSubjects(category?: string): Promise<Subject[]> {
    try {
      const url = category
        ? `/practice/subjects?category=${category}`
        : '/practice/subjects';

      console.log('🔵 Fetching subjects from:', url);

      const response = await apiClient.get<PracticeResponse<Subject[]>>(url);

      console.log('🔍 API Response:', response.data);

      if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },

  /**
   * Get all topics for a specific subject
   */
  async getTopics(subjectId: string): Promise<Topic[]> {
    try {
      const response = await apiClient.get<PracticeResponse<Topic[]>>(
        `/practice/subjects/${subjectId}/topics`
      );
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  },

  /**
   * Start a new practice session
   * Creates session and returns questions
   */
  async startSession(config: PracticeSessionConfig): Promise<SessionWithQuestions> {
    try {
      // Use V2 endpoint by default
      const endpoint = config.type ? '/practice/sessions' : '/practice/start';

      const response = await apiClient.post<PracticeResponse<SessionWithQuestions>>(
        endpoint,
        config
      );

      if (!response.data?.success) {
        throw new Error('Failed to start session');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  },

  /**
   * Get an existing session with questions
   */
  async getSession(sessionId: string): Promise<SessionWithQuestions> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const response = await apiClient.get<PracticeResponse<SessionWithQuestions>>(
        `/practice/sessions/${sessionId}`
      );

      if (!response.data?.success) {
        throw new Error('Failed to get session');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  },

  /**
   * Submit a single answer
   */
  async submitAnswer(
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<{ isCorrect: boolean; correctAnswer?: string }> {
    try {
      const response = await apiClient.post<
        PracticeResponse<{ isCorrect: boolean; correctAnswer?: string }>
      >(`/practice/sessions/${sessionId}/submit-answer`, {
        questionId,
        selectedAnswer: answer,
      });

      if (!response.data?.success) {
        throw new Error('Failed to submit answer');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  },

  /**
   * Submit multiple answers at once (BATCH)
   * Much faster than submitting individually
   */
  async submitAnswers(
    sessionId: string,
    answers: AnswerSubmission[]
  ): Promise<{ processedCount: number; errorCount: number }> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      if (!Array.isArray(answers) || answers.length === 0) {
        throw new Error('Answers array is required and must not be empty');
      }

      const response = await apiClient.post<
        PracticeResponse<{ processedCount: number; errorCount: number }>
      >(`/practice/sessions/${sessionId}/answers`, { answers });

      if (!response.data?.success) {
        throw new Error('Failed to submit answers');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error submitting answers:', error);
      throw error;
    }
  },

  /**
   * Toggle flag on a question
   */
  async toggleFlag(
    sessionId: string,
    questionId: string,
    isFlagged: boolean
  ): Promise<{ isFlagged: boolean }> {
    try {
      const response = await apiClient.post<PracticeResponse<{ isFlagged: boolean }>>(
        `/practice/sessions/${sessionId}/toggle-flag`,
        { questionId, isFlagged }
      );

      if (!response.data?.success) {
        throw new Error('Failed to toggle flag');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error toggling flag:', error);
      throw error;
    }
  },

  /**
   * Pause a practice session
   */
  async pauseSession(sessionId: string): Promise<SessionData> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const response = await apiClient.post<PracticeResponse<SessionData>>(
        `/practice/sessions/${sessionId}/pause`
      );

      if (!response.data?.success) {
        throw new Error('Failed to pause session');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error pausing session:', error);
      throw error;
    }
  },

  /**
   * Resume a paused practice session
   */
  async resumeSession(sessionId: string): Promise<SessionData> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const response = await apiClient.post<PracticeResponse<SessionData>>(
        `/practice/sessions/${sessionId}/resume`
      );

      if (!response.data?.success) {
        throw new Error('Failed to resume session');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error resuming session:', error);
      throw error;
    }
  },

  /**
   * Complete a practice session
   * Calculates final score and results
   */
  async completeSession(
    sessionId: string,
    timeSpent?: number
  ): Promise<SessionData> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const response = await apiClient.post<PracticeResponse<SessionData>>(
        `/practice/sessions/${sessionId}/complete`,
        { timeSpent }
      );

      if (!response.data?.success) {
        throw new Error('Failed to complete session');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error completing session:', error);
      throw error;
    }
  },

  /**
   * Get detailed results for a session
   * Includes all questions, answers, and analysis
   */
  async getSessionResults(sessionId: string): Promise<SessionResults> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const response = await apiClient.get<PracticeResponse<SessionResults>>(
        `/practice/sessions/${sessionId}/results`
      );

      if (!response.data?.success || !response.data?.data) {
        throw new Error('Invalid response format');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching session results:', error);
      throw error;
    }
  },

  /**
   * Get all user's practice sessions
   * With pagination support
   */
  async getUserSessions(
    limit: number = 20,
    offset: number = 0
  ): Promise<SessionListItem[]> {
    try {
      const response = await apiClient.get<PracticeResponse<SessionListItem[]>>(
        `/practice/sessions?limit=${limit}&offset=${offset}`
      );

      if (!response.data?.success) {
        throw new Error('Failed to fetch sessions');
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  },

  /**
   * Get answer history for a question in a session
   */
  async getAnswerHistory(
    sessionId: string,
    questionId?: string
  ): Promise<SessionAnswer[]> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const url = questionId
        ? `/practice/sessions/${sessionId}/history?questionId=${questionId}`
        : `/practice/sessions/${sessionId}/history`;

      const response = await apiClient.get<PracticeResponse<SessionAnswer[]>>(url);

      if (!response.data?.success) {
        throw new Error('Failed to fetch answer history');
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching answer history:', error);
      throw error;
    }
  },

  /**
   * Get questions for a session
   */
  async getSessionQuestions(sessionId: string): Promise<Question[]> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const response = await apiClient.get<PracticeResponse<Question[]>>(
        `/practice/sessions/${sessionId}/questions`
      );

      if (!response.data?.success) {
        throw new Error('Failed to fetch session questions');
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching session questions:', error);
      throw error;
    }
  }
};

/**
 * Topic interface used in getTopics
 */
export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  _count?: {
    questions: number;
  };
}

export default practiceService;