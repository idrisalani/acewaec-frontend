// frontend/src/utils/routes.constants.ts
// ✅ IMPROVED - Centralized Route Management with Type Safety
// Fixed ESLint errors: @typescript-eslint/no-explicit-any

/**
 * Route Constants - Type-Safe Centralized Route Management
 *
 * Benefits:
 * 1. Single source of truth for all routes
 * 2. Prevents typos in navigation
 * 3. Easy to refactor routes globally
 * 4. Full TypeScript type safety (no 'any' types)
 * 5. Compile-time route validation
 *
 * Usage:
 * import { ROUTES } from '@/utils/routes.constants';
 *
 * // In components
 * <Link to={ROUTES.PUBLIC.LOGIN} />
 * navigate(ROUTES.STUDENT.DASHBOARD);
 * <Route path={ROUTES.ADMIN.QUESTIONS} element={<QuestionsPage />} />
 */

// ========================================
// TYPE DEFINITIONS
// ========================================

/** Represents a route that takes a parameter (returns string) */
type DynamicRoute = (param: string) => string;

/** Public routes accessible without authentication */
interface PublicRoutes {
  readonly HOME: '/';
  readonly LOGIN: '/auth/login';
  readonly REGISTER: '/auth/register';
}

/** Student/User routes */
interface StudentRoutes {
  readonly DASHBOARD: '/dashboard';
  readonly TUTORS: '/tutors';
  readonly ANALYTICS: '/analytics';
}

/** Practice session routes */
interface PracticeRoutes {
  readonly SETUP: '/practice/setup';
  readonly SESSION: DynamicRoute; // /practice/session/:sessionId
  readonly RESULTS: DynamicRoute; // /practice/:sessionId/results
}

/** Comprehensive exam routes */
interface ExamRoutes {
  readonly SETUP: '/exam/setup';
  readonly DASHBOARD: DynamicRoute; // /exam/:examId
  readonly RESULTS: DynamicRoute; // /exam/:examId/results
}

/** Admin routes */
interface AdminRoutes {
  readonly DASHBOARD: '/admin';
  readonly USERS: '/admin/users';
  readonly QUESTIONS: '/admin/questions';
  readonly IMPORT: '/admin/import';
}

/** All routes combined */
interface AllRoutes {
  readonly PUBLIC: PublicRoutes;
  readonly STUDENT: StudentRoutes;
  readonly PRACTICE: PracticeRoutes;
  readonly EXAM: ExamRoutes;
  readonly ADMIN: AdminRoutes;
}

// ========================================
// ROUTE CONSTANTS
// ========================================

/**
 * Centralized route definitions
 * Use as: ROUTES.PUBLIC.LOGIN, ROUTES.PRACTICE.SESSION(id), etc.
 */
export const ROUTES: AllRoutes = {
  // ========================================
  // PUBLIC ROUTES
  // ========================================
  PUBLIC: {
    /** Landing page */
    HOME: '/',
    /** Login page */
    LOGIN: '/auth/login',
    /** Register page */
    REGISTER: '/auth/register',
  },

  // ========================================
  // STUDENT/USER ROUTES
  // ========================================
  STUDENT: {
    /** Main student dashboard */
    DASHBOARD: '/dashboard',
    /** Tutors marketplace page */
    TUTORS: '/tutors',
    /** Analytics dashboard */
    ANALYTICS: '/analytics',
  },

  // ========================================
  // PRACTICE SESSION ROUTES
  // ========================================
  PRACTICE: {
    /** Start new practice session setup page */
    SETUP: '/practice/setup',

    /** Active practice session
     * @param sessionId - Session ID
     * @example /practice/session/abc123
     */
    SESSION: (sessionId: string): string => `/practice/session/${sessionId}`,

    /** Practice session results
     * @param sessionId - Session ID
     * @example /practice/abc123/results
     */
    RESULTS: (sessionId: string): string => `/practice/${sessionId}/results`,
  },

  // ========================================
  // COMPREHENSIVE EXAM ROUTES
  // ========================================
  EXAM: {
    /** Start new exam setup page */
    SETUP: '/exam/setup',

    /** Active exam session/dashboard
     * @param examId - Exam ID
     * @example /exam/exam123
     */
    DASHBOARD: (examId: string): string => `/exam/${examId}`,

    /** Exam results
     * @param examId - Exam ID
     * @example /exam/exam123/results
     */
    RESULTS: (examId: string): string => `/exam/${examId}/results`,
  },

  // ========================================
  // ADMIN ROUTES
  // ========================================
  ADMIN: {
    /** Admin dashboard */
    DASHBOARD: '/admin',
    /** Manage users */
    USERS: '/admin/users',
    /** Manage questions */
    QUESTIONS: '/admin/questions',
    /** Bulk import questions */
    IMPORT: '/admin/import',
  },
} as const;

// ========================================
// USER ROLE TYPE DEFINITIONS
// ========================================

/** Valid user roles in the system */
export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'STUDENT'
  | 'TEACHER'
  | 'TUTOR'
  | 'GUEST';

// ========================================
// TYPE-SAFE ROUTE HELPERS
// ========================================

/**
 * Get routes by user role
 * Useful for navigation based on user type
 * @param role - User role
 * @returns Routes object appropriate for the role
 */
export const getRoutesByRole = (role: UserRole): StudentRoutes | AdminRoutes => {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'SCHOOL_ADMIN':
      return ROUTES.ADMIN;
    case 'STUDENT':
    case 'TEACHER':
    case 'TUTOR':
    default:
      return ROUTES.STUDENT;
  }
};

/**
 * Get user's default dashboard route
 * @param role - User role (optional)
 * @returns Path to user's appropriate dashboard
 */
export const getUserDashboardRoute = (role?: UserRole): string => {
  if (role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN') {
    return ROUTES.ADMIN.DASHBOARD;
  }
  return ROUTES.STUDENT.DASHBOARD;
};

/**
 * Check if route requires authentication
 * @param path - Path to check
 * @returns true if route is protected (requires auth), false if public
 */
export const isProtectedRoute = (path: string): boolean => {
  const publicRoutes: readonly string[] = [
    ROUTES.PUBLIC.HOME,
    ROUTES.PUBLIC.LOGIN,
    ROUTES.PUBLIC.REGISTER,
  ];
  return !publicRoutes.includes(path);
};

/**
 * Check if route is admin-only
 * @param path - Path to check
 * @returns true if route is admin-only
 */
export const isAdminRoute = (path: string): boolean => {
  return path.startsWith(ROUTES.ADMIN.DASHBOARD);
};

/**
 * Check if route is practice-related
 * @param path - Path to check
 * @returns true if route is practice-related
 */
export const isPracticeRoute = (path: string): boolean => {
  return path.startsWith(ROUTES.PRACTICE.SETUP.split('/').slice(0, 2).join('/'));
};

/**
 * Check if route is exam-related
 * @param path - Path to check
 * @returns true if route is exam-related
 */
export const isExamRoute = (path: string): boolean => {
  return path.startsWith(ROUTES.EXAM.SETUP.split('/').slice(0, 2).join('/'));
};

// ========================================
// NAVIGATION HELPERS
// ========================================

/**
 * Create a practice session path
 * @param sessionId - Session ID
 * @returns Practice session path
 * @example createPracticeSessionPath('abc123') => '/practice/session/abc123'
 */
export const createPracticeSessionPath = (sessionId: string): string => {
  return ROUTES.PRACTICE.SESSION(sessionId);
};

/**
 * Create a practice results path
 * @param sessionId - Session ID
 * @returns Practice results path
 * @example createPracticeResultsPath('abc123') => '/practice/abc123/results'
 */
export const createPracticeResultsPath = (sessionId: string): string => {
  return ROUTES.PRACTICE.RESULTS(sessionId);
};

/**
 * Create an exam dashboard path
 * @param examId - Exam ID
 * @returns Exam dashboard path
 * @example createExamDashboardPath('exam123') => '/exam/exam123'
 */
export const createExamDashboardPath = (examId: string): string => {
  return ROUTES.EXAM.DASHBOARD(examId);
};

/**
 * Create an exam results path
 * @param examId - Exam ID
 * @returns Exam results path
 * @example createExamResultsPath('exam123') => '/exam/exam123/results'
 */
export const createExamResultsPath = (examId: string): string => {
  return ROUTES.EXAM.RESULTS(examId);
};

// ========================================
// ROUTE VALIDATION HELPERS
// ========================================

/**
 * Extract session ID from a practice route
 * @param path - Full path (e.g., '/practice/session/abc123')
 * @returns Session ID or null if not found
 */
export const extractSessionIdFromPath = (path: string): string | null => {
  const match = path.match(/\/practice\/session\/([^/]+)/);
  return match?.[1] ?? null;
};

/**
 * Extract exam ID from an exam route
 * @param path - Full path (e.g., '/exam/exam123')
 * @returns Exam ID or null if not found
 */
export const extractExamIdFromPath = (path: string): string | null => {
  const match = path.match(/\/exam\/([^/]+)/);
  return match?.[1] ?? null;
};

/**
 * Validate if a path follows expected route patterns
 * @param path - Path to validate
 * @returns true if path matches known route patterns
 */
export const isValidRoute = (path: string): boolean => {
  const routePatterns = [
    /^\/$/,                           // HOME
    /^\/auth\/(login|register)$/,    // AUTH
    /^\/dashboard$/,                  // DASHBOARD
    /^\/tutors$/,                     // TUTORS
    /^\/analytics$/,                  // ANALYTICS
    /^\/practice\/setup$/,            // PRACTICE_SETUP
    /^\/practice\/session\/[^/]+$/,   // PRACTICE_SESSION
    /^\/practice\/[^/]+\/results$/,   // PRACTICE_RESULTS
    /^\/exam\/setup$/,                // EXAM_SETUP
    /^\/exam\/[^/]+$/,                // EXAM_DASHBOARD
    /^\/exam\/[^/]+\/results$/,       // EXAM_RESULTS
    /^\/admin(\/[^/]+)?$/,            // ADMIN
  ];

  return routePatterns.some(pattern => pattern.test(path));
};

// ========================================
// USAGE EXAMPLES & DOCUMENTATION
// ========================================

/*
 * NAVIGATION EXAMPLES:
 *
 * 1. Using in Link components:
 *    import { ROUTES } from '@/utils/routes.constants';
 *
 *    <Link to={ROUTES.PUBLIC.HOME}>Home</Link>
 *    <Link to={ROUTES.STUDENT.DASHBOARD}>Dashboard</Link>
 *    <Link to={ROUTES.ADMIN.QUESTIONS}>Questions</Link>
 *
 * 2. Using in useNavigate:
 *    const navigate = useNavigate();
 *    navigate(ROUTES.STUDENT.DASHBOARD);
 *    navigate(ROUTES.PRACTICE.SETUP);
 *    navigate(ROUTES.ADMIN.IMPORT);
 *
 * 3. Dynamic routes with parameters:
 *    const sessionId = 'abc123';
 *    navigate(ROUTES.PRACTICE.SESSION(sessionId));
 *    navigate(ROUTES.EXAM.RESULTS(examId));
 *
 * 4. Role-based redirects:
 *    const dashboard = getUserDashboardRoute(user.role);
 *    navigate(dashboard);
 *
 * 5. In App.tsx routing setup:
 *    <Route path={ROUTES.PRACTICE.SETUP} element={<PracticeSetup />} />
 *    <Route path="/practice/session/:sessionId" element={<PracticeSession />} />
 *    <Route path={ROUTES.ADMIN.QUESTIONS} element={<QuestionsPage />} />
 *
 * 6. Conditional navigation based on route type:
 *    if (isPracticeRoute(location.pathname)) {
 *      // Show practice-specific UI
 *    }
 *
 * 7. Extract IDs from current route:
 *    const sessionId = extractSessionIdFromPath(location.pathname);
 *    if (sessionId) {
 *      // Use sessionId to fetch data
 *    }
 *
 * 8. Validate user navigation:
 *    if (!isValidRoute(newPath)) {
 *      navigate(ROUTES.PUBLIC.HOME);
 *    }
 *
 * 9. Type-safe role checking:
 *    const role: UserRole = 'STUDENT'; // TypeScript ensures valid role
 *    const routes = getRoutesByRole(role);
 *
 * 10. Practice setup flow:
 *     // User selects subject and creates session
 *     const response = await practiceService.startSession(config);
 *     const sessionId = response.sessionId;
 *     navigate(createPracticeSessionPath(sessionId));
 *
 * 11. Exam flow:
 *     // User takes exam
 *     const examId = 'exam123';
 *     navigate(createExamDashboardPath(examId));
 *     // After completion
 *     navigate(createExamResultsPath(examId));
 */

// ========================================
// ESLINT CONFIGURATION (if needed)
// ========================================

/*
 * If you still get ESLint warnings, add to your .eslintrc.js:
 *
 * {
 *   "overrides": [
 *     {
 *       "files": ["src/utils/routes.constants.ts"],
 *       "rules": {
 *         "@typescript-eslint/no-explicit-any": "off"
 *       }
 *     }
 *   ]
 * }
 *
 * Or use eslint-disable comments:
 * // eslint-disable-next-line @typescript-eslint/no-explicit-any
 */