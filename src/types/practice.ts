/**
 * @file frontend/src/types/practice.ts
 * @description AceWAEC Pro - Unified Practice Session Type Definitions
 * @version 2.0.0
 * 
 * This is the authoritative source for all practice/CBT (Computer Based Test) system types.
 * It consolidates the best features from both:
 *   - practice.ts (comprehensive types)
 *   - practice.types.ts (simplified types with state management)
 * 
 * Last Updated: October 30, 2025
 * Status: Ready for Implementation
 */

// ============================================================================
// TYPE LITERALS & CONSTANTS
// ============================================================================

/**
 * Question difficulty level - uppercase enum-like type
 * @see QUESTION_DIFFICULTIES for validation
 */
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

/**
 * Student category/stream
 * @see STUDENT_CATEGORIES for validation
 */
export type StudentCategory = 'SCIENCE' | 'ART' | 'COMMERCIAL';

/**
 * Practice session status
 * @see SESSION_STATUSES for validation
 */
export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED';

/**
 * Type of practice session
 * @see SESSION_TYPES for validation
 */
export type SessionType = 'PRACTICE' | 'MOCK' | 'COMPREHENSIVE';

/**
 * Constant arrays for validation and UI rendering
 */
export const QUESTION_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
export const STUDENT_CATEGORIES = ['SCIENCE', 'ART', 'COMMERCIAL'] as const;
export const SESSION_STATUSES = ['ACTIVE', 'PAUSED', 'COMPLETED', 'EXPIRED'] as const;
export const SESSION_TYPES = ['PRACTICE', 'MOCK', 'COMPREHENSIVE'] as const;

// ============================================================================
// CORE DOMAIN INTERFACES
// ============================================================================

/**
 * Subject/Course information
 * @example
 * {
 *   id: "subj_123",
 *   name: "English Language",
 *   code: "EN101",
 *   categories: ["SCIENCE", "ART"],
 *   questionCount: 450
 * }
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
 * @example
 * {
 *   id: "topic_456",
 *   name: "Grammar and Syntax",
 *   subjectId: "subj_123"
 * }
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
 * @example
 * {
 *   id: "opt_789",
 *   label: "A",
 *   content: "This is the first option",
 *   isCorrect: true
 * }
 */
export interface QuestionOption {
  id: string;
  label: 'A' | 'B' | 'C' | 'D' | 'E';
  content: string;
  /** Only sent to backend for grading, not to client */
  isCorrect?: boolean;
}

/**
 * Practice question
 * @example
 * {
 *   id: "q_001",
 *   content: "Which of the following is correct?",
 *   difficulty: "MEDIUM",
 *   subject: { name: "English Language" },
 *   options: [...],
 *   tags: ["grammar", "verb-tense"],
 *   explanation: "The correct answer is..."
 * }
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
  /** Tags for filtering and categorization */
  tags?: string[];
  /** Explanation shown after session completion */
  explanation?: string;
}

/**
 * Practice session
 * @example
 * {
 *   id: "sess_123",
 *   name: "English Language - Practice",
 *   userId: "user_456",
 *   type: "PRACTICE",
 *   status: "ACTIVE",
 *   duration: 60,
 *   category: "SCIENCE",
 *   questionCount: 50,
 *   startedAt: "2025-10-30T10:00:00Z",
 *   createdAt: "2025-10-30T10:00:00Z"
 * }
 */
export interface PracticeSession {
  id: string;
  name: string;
  userId?: string;
  type: SessionType;
  status: SessionStatus;
  duration: number; // in minutes
  category?: StudentCategory;
  questionCount?: number;
  startedAt?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
  /** Client-side calculated time remaining */
  timeRemaining?: number;
}

/**
 * User's answer to a question
 * @example
 * {
 *   questionId: "q_001",
 *   selectedAnswer: "A",
 *   correctAnswer: "B",
 *   isCorrect: false,
 *   timeSpent: 45,
 *   flagged: true
 * }
 */
export interface UserAnswer {
  questionId: string;
  selectedAnswer: string | null;
  correctAnswer?: string;
  isCorrect?: boolean;
  /** Time spent answering in seconds */
  timeSpent?: number;
  flagged?: boolean;
  difficulty?: QuestionDifficulty;
}

/**
 * Session results/analytics
 * @example
 * {
 *   sessionId: "sess_123",
 *   totalQuestions: 50,
 *   answeredQuestions: 48,
 *   correctAnswers: 42,
 *   wrongAnswers: 6,
 *   unanswered: 2,
 *   score: 84,
 *   timeSpent: 2400,
 *   completedAt: "2025-10-30T11:00:00Z"
 * }
 */
export interface SessionResults {
  sessionId: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number; // percentage (0-100)
  /** Total time spent in seconds */
  timeSpent: number;
  answers: UserAnswer[];
  startedAt: string;
  completedAt: string;
  difficulty?: QuestionDifficulty;
  subject?: {
    name: string;
  };
}

/**
 * Flagged question tracking
 * Used for marking questions to review later
 */
export interface FlaggedQuestion {
  sessionId: string;
  questionId: string;
  flagged: boolean;
  flaggedAt?: string;
}

// ============================================================================
// CLIENT STATE MANAGEMENT
// ============================================================================

/**
 * Client-side practice session state
 * Used with React Context or state management
 */
export interface PracticeState {
  session: PracticeSession | null;
  questions: Question[];
  /** Current question index (0-based) */
  currentIndex: number;
  /** Mapping of questionId to selected answer */
  answers: Record<string, string>;
  /** Time left in seconds */
  timeLeft: number;
  loading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Actions for updating practice state
 * Used with React Context or dispatch
 */
export interface PracticeActions {
  setSession: (session: PracticeSession | null) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentIndex: (index: number) => void;
  setAnswer: (questionId: string, answer: string) => void;
  setTimeLeft: (time: number) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

/**
 * Get subjects request
 */
export interface GetSubjectsRequest {
  category?: StudentCategory;
}

/**
 * Get topics request
 */
export interface GetTopicsRequest {
  subjectId: string;
}

/**
 * Start practice session request
 */
export type StartSessionRequest = {
  subjectIds: string[];
  topicIds?: string[];
  questionCount: number;
  duration?: number;
  difficulty?: QuestionDifficulty;
  hasDuration: boolean;
  category?: StudentCategory;
};

/**
 * Submit answer request
 */
export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string;
}

/**
 * Complete session request
 */
export interface CompleteSessionRequest {
  sessionId: string;
}

/**
 * Get results request
 */
export interface GetResultsRequest {
  sessionId: string;
}

/**
 * Toggle flag on question request
 */
export interface ToggleFlagRequest {
  sessionId: string;
  questionId: string;
  flagged: boolean;
}

/**
 * Pause session request
 */
export interface PauseSessionRequest {
  sessionId: string;
}

/**
 * Resume session request
 */
export interface ResumeSessionRequest {
  sessionId: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Get subjects response
 */
export interface GetSubjectsResponse {
  success: boolean;
  data: Subject[];
}

/**
 * Get topics response
 */
export interface GetTopicsResponse {
  success: boolean;
  data: Topic[];
}

/**
 * Get session response
 */
export interface GetSessionResponse {
  success: boolean;
  data: PracticeSession;
}

/**
 * Get session questions response
 */
export interface GetSessionQuestionsResponse {
  success: boolean;
  data: Question[];
}

/**
 * Start session response
 */
export interface StartSessionResponse {
  success: boolean;
  session: PracticeSession;
  questions: Question[];
}

/**
 * Submit answer response
 */
export interface SubmitAnswerResponse {
  success: boolean;
  isCorrect?: boolean;
  message?: string;
}

/**
 * Complete session response
 */
export interface CompleteSessionResponse {
  success: boolean;
  results?: SessionResults;
}

/**
 * Get results response
 */
export interface GetResultsResponse {
  success: boolean;
  data: SessionResults;
}

/**
 * Toggle flag response
 */
export interface ToggleFlagResponse {
  success: boolean;
  message?: string;
}

/**
 * Pause session response
 */
export interface PauseSessionResponse {
  success: boolean;
  message?: string;
}

/**
 * Resume session response
 */
export interface ResumeSessionResponse {
  success: boolean;
  message?: string;
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
 * Generic API response wrapper
 * @template T The type of data being wrapped
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// TYPE GUARDS (Runtime Type Checking)
// ============================================================================

/**
 * Type guard for QuestionDifficulty
 * @example
 * if (isQuestionDifficulty(value)) {
 *   // value is now typed as QuestionDifficulty
 * }
 */
export function isQuestionDifficulty(value: unknown): value is QuestionDifficulty {
  return typeof value === 'string' && QUESTION_DIFFICULTIES.includes(value as QuestionDifficulty);
}

/**
 * Type guard for StudentCategory
 */
export function isStudentCategory(value: unknown): value is StudentCategory {
  return typeof value === 'string' && STUDENT_CATEGORIES.includes(value as StudentCategory);
}

/**
 * Type guard for SessionStatus
 */
export function isSessionStatus(value: unknown): value is SessionStatus {
  return typeof value === 'string' && SESSION_STATUSES.includes(value as SessionStatus);
}

/**
 * Type guard for SessionType
 */
export function isSessionType(value: unknown): value is SessionType {
  return typeof value === 'string' && SESSION_TYPES.includes(value as SessionType);
}

/**
 * Type guard for Question
 * Validates structure and required fields
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
 * Type guard for QuestionOption
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
 * Type guard for PracticeSession
 * Validates structure and required fields
 */
export function isSessionData(value: unknown): value is PracticeSession {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    isSessionType(s.type) &&
    isSessionStatus(s.status)
  );
}

/**
 * Type guard for SessionResults
 */
export function isSessionResults(value: unknown): value is SessionResults {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.sessionId === 'string' &&
    typeof r.totalQuestions === 'number' &&
    typeof r.correctAnswers === 'number' &&
    typeof r.score === 'number' &&
    Array.isArray(r.answers)
  );
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Partial session status update type
 * Useful for PATCH requests
 */
export type SessionStatusUpdate = Partial<Pick<PracticeSession, 'status' | 'completedAt'>>;

/**
 * Question with additional client-side metadata
 * Used in UI components for tracking state
 */
export interface QuestionWithMetadata extends Question {
  isAnswered?: boolean;
  userAnswer?: string | null;
  isFlagged?: boolean;
  timeSpent?: number;
}

/**
 * Extended session data with client-side calculations
 * Used in UI for display
 */
export interface ExtendedSession extends PracticeSession {
  timeRemaining?: number;
  elapsedTime?: number;
  progressPercentage?: number;
}

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * Type exports organized by category:
 *
 * **Type Literals:**
 * - QuestionDifficulty
 * - StudentCategory
 * - SessionStatus
 * - SessionType
 *
 * **Constants for Validation:**
 * - QUESTION_DIFFICULTIES
 * - STUDENT_CATEGORIES
 * - SESSION_STATUSES
 * - SESSION_TYPES
 *
 * **Core Interfaces:**
 * - Subject, Topic, QuestionOption, Question
 * - PracticeSession, UserAnswer, SessionResults, FlaggedQuestion
 *
 * **State Management:**
 * - PracticeState, PracticeActions
 *
 * **API Request Types:**
 * - GetSubjectsRequest, GetTopicsRequest
 * - StartSessionRequest, SubmitAnswerRequest
 * - CompleteSessionRequest, GetResultsRequest
 * - ToggleFlagRequest, PauseSessionRequest, ResumeSessionRequest
 *
 * **API Response Types:**
 * - GetSubjectsResponse, GetTopicsResponse
 * - GetSessionResponse, GetSessionQuestionsResponse
 * - StartSessionResponse, SubmitAnswerResponse
 * - CompleteSessionResponse, GetResultsResponse
 * - ToggleFlagResponse, PauseSessionResponse, ResumeSessionResponse
 * - ErrorResponse, ApiResponse<T>
 *
 * **Type Guards:**
 * - isQuestionDifficulty(), isStudentCategory()
 * - isSessionStatus(), isSessionType()
 * - isQuestion(), isQuestionOption()
 * - isSessionData(), isSessionResults()
 *
 * **Utility Types:**
 * - SessionStatusUpdate
 * - QuestionWithMetadata
 * - ExtendedSession
 */