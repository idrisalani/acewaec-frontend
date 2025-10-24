// frontend/src/services/comprehensiveExam.service.ts
// ✅ RECONCILED - Matches your existing backend endpoints

import apiClient from './api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface ExamDay {
  id: string;
  dayNumber: number;
  subjectId: string;
  subject?: Subject;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  score?: number | null;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent?: number;
}

export interface ComprehensiveExam {
  id: string;
  userId: string;
  subjects: string[];
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  startDate: Date | string;
  completedAt?: Date | string | null;
  currentDay: number;
  totalDays: number;
  totalQuestions: number;
  questionsPerSubject: number;
  correctAnswers: number;
  overallScore?: number | null;
  durationPerDay?: number;
  certificateIssued?: boolean;
  certificateUrl?: string;
  examDays: ExamDay[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Question {
  id: string;
  content: string;
  options: Array<{
    id: string;
    label: string;
    content: string;
  }>;
  subject?: Subject;
  topic?: {
    id: string;
    name: string;
  };
}

export interface PracticeSession {
  id: string;
  userId: string;
  name: string;
  type: string;
  duration?: number;
  questionCount: number;
  subjectIds: string[];
  topicIds: string[];
  status?: string;
}

export interface StartDayResponse {
  session: PracticeSession;
  questions: Question[];
}

export interface CompleteDayResponse {
  day: ExamDay;
  overallScore: number;
  allCompleted: boolean;
}

// ============================================================================
// COMPREHENSIVE EXAM SERVICE - RECONCILED
// ============================================================================
// Updated to match your existing backend endpoints

export const comprehensiveExamService = {
  /**
   * Create a new comprehensive exam
   * Endpoint: POST /comprehensive-exam/create
   * @param subjects - Array of 7 subject IDs
   * @returns Created exam object
   */
  async createExam(subjects: string[]): Promise<ComprehensiveExam> {
    try {
      const response = await apiClient.post('/comprehensive-exam/create', {
        subjects
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to create comprehensive exam:', error);
      throw error;
    }
  },

  /**
   * Get all exams for the current user
   * Endpoint: GET /comprehensive-exam/list
   * @returns Array of exams
   */
  async getUserExams(): Promise<ComprehensiveExam[]> {
    try {
      const response = await apiClient.get('/comprehensive-exam/list');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch user exams:', error);
      throw error;
    }
  },

  /**
   * Get a specific exam by ID
   * Endpoint: GET /comprehensive-exam/:examId
   * @param examId - Exam ID
   * @returns Exam object with all details
   */
  async getExam(examId: string): Promise<ComprehensiveExam> {
    try {
      const response = await apiClient.get(`/comprehensive-exam/${examId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch exam:', error);
      throw error;
    }
  },

  /**
   * Start a specific day of the exam
   * Endpoint: POST /comprehensive-exam/:examId/day/:dayNumber/start
   * @param examId - Exam ID
   * @param dayNumber - Day number (1-7)
   * @returns Session and questions for the day
   */
  async startDay(examId: string, dayNumber: number): Promise<StartDayResponse> {
    try {
      const response = await apiClient.post(
        `/comprehensive-exam/${examId}/day/${dayNumber}/start`,
        {}
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to start day ${dayNumber}:`, error);
      throw error;
    }
  },

  /**
   * Complete a day's exam and submit answers
   * Endpoint: POST /comprehensive-exam/:examId/day/:dayNumber/complete
   * @param examId - Exam ID
   * @param dayNumber - Day number (1-7)
   * @param sessionId - Practice session ID
   * @returns Day result and overall score
   */
  async completeDay(
    examId: string,
    dayNumber: number,
    sessionId: string
  ): Promise<CompleteDayResponse> {
    try {
      const response = await apiClient.post(
        `/comprehensive-exam/${examId}/day/${dayNumber}/complete`,
        { sessionId }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to complete day ${dayNumber}:`, error);
      throw error;
    }
  },

  /**
   * Get comprehensive results of a completed exam
   * Endpoint: GET /comprehensive-exam/:examId/results
   * @param examId - Exam ID
   * @returns Exam with all days, sessions, and detailed results
   */
  async getResults(examId: string): Promise<ComprehensiveExam> {
    try {
      const response = await apiClient.get(`/comprehensive-exam/${examId}/results`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch exam results:', error);
      throw error;
    }
  },

  /**
   * Alias for getResults - for backward compatibility
   */
  async getExamResults(examId: string): Promise<ComprehensiveExam> {
    return this.getResults(examId);
  },

  /**
   * Get exam results (alternative naming)
   */
  async fetchExamDetails(examId: string): Promise<ComprehensiveExam> {
    return this.getExam(examId);
  }
};

export default comprehensiveExamService;