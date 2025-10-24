// frontend/src/types/practice.ts
// ✅ FIXED - All types properly defined, no implicit 'any'

/**
 * Practice Module Type Definitions
 * Comprehensive types for the practice/CBT (Computer Based Test) system
 */

// ============================================================================
// BASIC TYPES
// ============================================================================

/**
 * Question difficulty level
 */
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

/**
 * User student category
 */
export type StudentCategory = 'SCIENCE' | 'ART' | 'COMMERCIAL';

/**
 * Session status
 */
export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED';

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

/**
 * Subject information for practice sessions
 */
export interface Subject {
  id: string;
  name: string;
  code: string;
  categories?: StudentCategory[];
  questionCount?: number;
  _count?: {
    questions: number;
  };
}

/**
 * Topic within a subject
 */
export interface Topic {
  id: string;
  name: string;
  subjectId?: string;
  _count?: {
    questions: number;
  };
}

/**
 * Multiple choice option for a question
 */
export interface QuestionOption {
  id: string;
  label: 'A' | 'B' | 'C' | 'D' | 'E'; // Option labels (A, B, C, D, E)
  content: string;
  isCorrect?: boolean; // Only sent to backend for grading
}

/**
 * Practice question
 */
export interface Question {
  id: string;
  content: string;
  difficulty: QuestionDifficulty;
  subject: {
    id?: string;
    name: string;
  };
  topic?: {
    id: string;
    name: string;
  };
  options: QuestionOption[];
  imageUrl?: string;
  category?: StudentCategory;
  explanation?: string; // Shown after session completion
}

/**
 * Practice session
 */
export interface PracticeSession {
  id: string;
  userId?: string;
  duration: number; // in minutes
  startedAt?: string;
  completedAt?: string;
  status?: SessionStatus;
  category?: StudentCategory;
  questionCount?: number;
}

/**
 * User answer to a question
 */
export interface UserAnswer {
  questionId: string;
  selectedAnswer: string | null;
  isCorrect?: boolean;
  timeSpent?: number; // in seconds
  flagged?: boolean;
}

/**
 * Practice session with questions
 */
export interface PracticeSessionData {
  session: PracticeSession;
  questions: Question[];
}

/**
 * Configuration for starting a practice session
 */
export interface PracticeSessionConfig {
  subjectIds: string[];
  topicIds?: string[];
  questionCount: number;
  duration?: number;
  difficulty?: QuestionDifficulty;
  hasDuration: boolean;
  category?: StudentCategory;
}

/**
 * API Response for starting a session
 */
export interface StartSessionResponse {
  success?: boolean;
  session: PracticeSession;
  questions: Question[];
  data?: {
    session: PracticeSession;
    questions: Question[];
  };
}

/**
 * Session results/analytics
 */
export interface SessionResults {
  sessionId: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number; // percentage
  timeSpent: number; // in seconds
  answers: UserAnswer[];
  startedAt: string;
  completedAt: string;
  difficulty: QuestionDifficulty;
  subject: {
    name: string;
  };
}

/**
 * Question statistics (for analytics)
 */
export interface QuestionStats {
  questionId: string;
  content: string;
  difficulty: QuestionDifficulty;
  answeredByUsers: number;
  correctByUsers: number;
  successRate: number; // percentage
}

/**
 * User practice statistics
 */
export interface UserPracticeStats {
  totalSessions: number;
  totalQuestionsAttempted: number;
  averageScore: number; // percentage
  averageTimePerQuestion: number; // in seconds
  bySubject: Record<string, {
    sessions: number;
    score: number;
    questionsAttempted: number;
  }>;
  byDifficulty: Record<QuestionDifficulty, {
    attempted: number;
    correct: number;
    score: number;
  }>;
}

/**
 * Flag information for a question
 */
export interface FlaggedQuestion {
  sessionId: string;
  questionId: string;
  flagged: boolean;
  flaggedAt?: string;
}

/**
 * Submission response when submitting an answer
 */
export interface AnswerSubmissionResponse {
  success: boolean;
  questionId: string;
  isCorrect?: boolean;
  explanation?: string;
  message?: string;
}

/**
 * Session completion response
 */
export interface SessionCompletionResponse {
  success: boolean;
  sessionId: string;
  message: string;
  results?: SessionResults;
}

/**
 * Error response from API
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// TYPE GUARDS (Helper functions for runtime type checking)
// ============================================================================

/**
 * Check if value is a valid QuestionDifficulty
 */
export function isQuestionDifficulty(value: unknown): value is QuestionDifficulty {
  return typeof value === 'string' && ['EASY', 'MEDIUM', 'HARD'].includes(value);
}

/**
 * Check if value is a valid StudentCategory
 */
export function isStudentCategory(value: unknown): value is StudentCategory {
  return typeof value === 'string' && ['SCIENCE', 'ART', 'COMMERCIAL'].includes(value);
}

/**
 * Check if value is a valid SessionStatus
 */
export function isSessionStatus(value: unknown): value is SessionStatus {
  return typeof value === 'string' && ['ACTIVE', 'PAUSED', 'COMPLETED', 'EXPIRED'].includes(value);
}

/**
 * Check if value is a valid Question
 */
export function isQuestion(value: unknown): value is Question {
  if (!value || typeof value !== 'object') return false;
  const q = value as Record<string, unknown>;
  return (
    typeof q.id === 'string' &&
    typeof q.content === 'string' &&
    isQuestionDifficulty(q.difficulty) &&
    typeof q.subject === 'object' &&
    Array.isArray(q.options)
  );
}

/**
 * Check if value is a valid QuestionOption
 */
export function isQuestionOption(value: unknown): value is QuestionOption {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    ['A', 'B', 'C', 'D', 'E'].includes(o.label as string) &&
    typeof o.content === 'string'
  );
}

/**
 * Check if value is a valid PracticeSessionData
 */
export function isPracticeSessionData(value: unknown): value is PracticeSessionData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return (
    typeof data.session === 'object' &&
    (data.session as Record<string, unknown>).id !== undefined &&
    Array.isArray(data.questions)
  );
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract the status of a session
 */
export type SessionStatusUpdate = Partial<Pick<PracticeSession, 'status' | 'completedAt'>>;

/**
 * Question with additional metadata
 */
export interface QuestionWithMetadata extends Question {
  isAnswered?: boolean;
  userAnswer?: string | null;
  isFlagged?: boolean;
  timeSpent?: number;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES (Modern ES Module Syntax)
// ============================================================================

/**
 * Get Subjects Request
 */
export interface GetSubjectsRequest {
  category?: StudentCategory;
}

/**
 * Get Subjects Response
 */
export interface GetSubjectsResponse {
  success: boolean;
  data: Subject[];
}

/**
 * Get Topics Request
 */
export interface GetTopicsRequest {
  subjectId: string;
}

/**
 * Get Topics Response
 */
export interface GetTopicsResponse {
  success: boolean;
  data: Topic[];
}

/**
 * Start Session Request - Extends PracticeSessionConfig with all required fields
 */
export type StartSessionRequest = PracticeSessionConfig;

/**
 * Start Session Response
 */
export interface StartSessionResponse {
  success?: boolean;
  session: PracticeSession;
  questions: Question[];
}

/**
 * Submit Answer Request
 */
export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string;
}

/**
 * Submit Answer Response
 */
export interface SubmitAnswerResponse {
  success: boolean;
  isCorrect?: boolean;
  message?: string;
}

/**
 * Complete Session Request
 */
export interface CompleteSessionRequest {
  sessionId: string;
}

/**
 * Complete Session Response
 */
export interface CompleteSessionResponse {
  success: boolean;
  results?: SessionResults;
}

/**
 * Get Results Request
 */
export interface GetResultsRequest {
  sessionId: string;
}

/**
 * Get Results Response
 */
export interface GetResultsResponse {
  success: boolean;
  data: SessionResults;
}

/**
 * Toggle Flag Request
 */
export interface ToggleFlagRequest {
  sessionId: string;
  questionId: string;
  flagged: boolean;
}

/**
 * Toggle Flag Response
 */
export interface ToggleFlagResponse {
  success: boolean;
  message?: string;
}

/**
 * Pause Session Request
 */
export interface PauseSessionRequest {
  sessionId: string;
}

/**
 * Pause Session Response
 */
export interface PauseSessionResponse {
  success: boolean;
  message?: string;
}

/**
 * Resume Session Request
 */
export interface ResumeSessionRequest {
  sessionId: string;
}

/**
 * Resume Session Response
 */
export interface ResumeSessionResponse {
  success: boolean;
  message?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const QUESTION_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
export const STUDENT_CATEGORIES = ['SCIENCE', 'ART', 'COMMERCIAL'] as const;
export const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'] as const;
export const SESSION_STATUSES = ['ACTIVE', 'PAUSED', 'COMPLETED', 'EXPIRED'] as const;

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * Type exports organized by category:
 *
 * Types:
 * - QuestionDifficulty
 * - StudentCategory
 * - SessionStatus
 *
 * Interfaces:
 * - Subject, Topic, Question, QuestionOption
 * - PracticeSession, PracticeSessionData, PracticeSessionConfig
 * - UserAnswer, SessionResults
 * - UserPracticeStats, FlaggedQuestion
 * - ErrorResponse, ApiResponse
 *
 * Type Guards:
 * - isQuestion(), isQuestionOption(), isPracticeSessionData()
 * - isQuestionDifficulty(), isStudentCategory(), isSessionStatus()
 *
 * API Types:
 * - PracticeAPI.* (all request/response types)
 *
 * Constants:
 * - QUESTION_DIFFICULTIES, STUDENT_CATEGORIES, OPTION_LABELS, SESSION_STATUSES
 */