// frontend/src/App.tsx
// ✅ RECOMMENDED - Combined Best Practices from Both Versions
// This version includes: RBAC, loading states, smart redirects, and consistent routing

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context';

// ==========================================
// IMPORT ALL PAGE COMPONENTS
// ==========================================

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public Pages
import LandingPage from './pages/LandingPage';

// Student/User Dashboard & Pages
import Dashboard from './pages/Dashboard';
import TutorsPage from './pages/TutorsPage';

// Practice Session Flow
import PracticeSetup from './pages/practice/PracticeSetup';
import PracticeInterface from './components/practice/PracticeInterface';
import PracticeResults from './pages/practice/PracticeResults';

// Comprehensive Exam Flow
import ComprehensiveExamSetup from './pages/ComprehensiveExamSetup';
import ComprehensiveExamDashboard from './pages/ComprehensiveExamDashboard';
import ComprehensiveExamResults from './pages/ComprehensiveExamResults';

// Analytics
import AnalyticsDashboard from './pages/AnalyticsDashboard';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import QuestionsPage from './pages/admin/QuestionsPage';
import BulkImportPage from './pages/admin/BulkImportPage';

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Check if user has admin role
 */
const isUserAdmin = (role?: string): boolean => {
  return role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN';
};

/**
 * Get user dashboard based on role
 */
const getUserDashboard = (role?: string): string => {
  return isUserAdmin(role) ? '/admin' : '/dashboard';
};

// ==========================================
// PROTECTED ROUTE COMPONENT
// ==========================================

/**
 * Enhanced ProtectedRoute with Role-Based Access Control (RBAC)
 *
 * Features:
 * - Checks if user is authenticated
 * - Validates user role against allowed roles
 * - Provides admin-only access option
 * - Redirects to appropriate dashboard based on role
 *
 * @param children - React component to render if authorized
 * @param adminOnly - If true, only admins (SUPER_ADMIN, SCHOOL_ADMIN) can access
 * @param allowedRoles - Array of roles allowed to access this route
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  allowedRoles?: string[];
}

function ProtectedRoute({
  children,
  adminOnly = false,
  allowedRoles = [],
}: ProtectedRouteProps) {
  const { user } = useAuth();

  // User not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Admin-only route
  if (adminOnly) {
    if (!isUserAdmin(user.role)) {
      // Non-admin trying to access admin route
      return <Navigate to="/dashboard" replace />;
    }
    // Admin verified, allow access
    return <>{children}</>;
  }

  // Role-specific route
  if (allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // User role not in allowed list
      return <Navigate to={getUserDashboard(user.role)} replace />;
    }
  }

  // All checks passed
  return <>{children}</>;
}

// ==========================================
// LOADING SCREEN COMPONENT
// ==========================================

/**
 * Splash screen shown while authenticating user
 * Prevents route flicker and improves UX
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="text-center">
        {/* Animated Spinner */}
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        
        {/* Loading Text */}
        <p className="text-white text-xl font-semibold">Loading AceWAEC Pro...</p>
        <p className="text-white/70 text-sm mt-2">Authenticating your session</p>
      </div>
    </div>
  );
}

// ==========================================
// ROUTES COMPONENT
// ==========================================

/**
 * Main Routes Component
 *
 * Handles:
 * - Loading state during auth check
 * - Public routes (no auth required)
 * - Protected student/user routes
 * - Protected admin routes
 * - Smart redirects based on user role
 * - 404 fallback handling
 *
 * Flow:
 * 1. Check if still loading auth state
 * 2. If loading, show spinner
 * 3. Otherwise, render appropriate routes
 */
function AppRoutes() {
  const { user, isLoading } = useAuth();

  // ========================================
  // LOADING STATE
  // ========================================

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // ========================================
  // ROUTES
  // ========================================

  return (
    <Routes>
      {/* ========================================
          PUBLIC ROUTES - No Authentication Required
          ======================================== */}

      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes - Redirect if already authenticated */}
      <Route
        path="/auth/login"
        element={
          user ? (
            <Navigate to={getUserDashboard(user.role)} replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/auth/register"
        element={
          user ? (
            <Navigate to={getUserDashboard(user.role)} replace />
          ) : (
            <Register />
          )
        }
      />

      {/* ========================================
          STUDENT/USER PROTECTED ROUTES
          Allowed Roles: STUDENT, TEACHER, TUTOR
          ======================================== */}

      {/* Main Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'TUTOR']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Tutors Marketplace */}
      <Route
        path="/tutors"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'TUTOR']}>
            <TutorsPage />
          </ProtectedRoute>
        }
      />

      {/* ========================================
          PRACTICE SESSION FLOW
          Allowed Roles: STUDENT only
          
          Flow:
          1. /practice/setup              <- Choose subjects, difficulty
          2. /practice/session/:sessionId <- Active practice session
          3. /practice/:sessionId/results <- View results
          ======================================== */}

      {/* Step 1: Practice Setup */}
      <Route
        path="/practice/setup"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <PracticeSetup />
          </ProtectedRoute>
        }
      />

      {/* Step 2: Active Practice Session */}
      <Route
        path="/practice/interface/:sessionId"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <PracticeInterface />
          </ProtectedRoute>
        }
      />

      {/* Step 3: Practice Results */}
      <Route
        path="/practice/:sessionId/results"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <PracticeResults />
          </ProtectedRoute>
        }
      />

      {/* ========================================
          COMPREHENSIVE EXAM FLOW
          Allowed Roles: STUDENT only
          
          Flow:
          1. /exam/setup        <- Configure exam
          2. /exam/:examId      <- Active exam session
          3. /exam/:examId/results <- View exam results
          ======================================== */}

      {/* Step 1: Exam Setup */}
      <Route
        path="/exam/setup"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ComprehensiveExamSetup />
          </ProtectedRoute>
        }
      />

      {/* Step 2: Active Exam Session */}
      <Route
        path="/exam/:examId"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ComprehensiveExamDashboard />
          </ProtectedRoute>
        }
      />

      {/* Step 3: Exam Results */}
      <Route
        path="/exam/:examId/results"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ComprehensiveExamResults />
          </ProtectedRoute>
        }
      />

      {/* ========================================
          ANALYTICS
          Allowed Roles: STUDENT, TEACHER
          ======================================== */}

      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />

      {/* ========================================
          ADMIN ROUTES
          Allowed Roles: SUPER_ADMIN, SCHOOL_ADMIN
          
          Structure:
          /admin           <- Dashboard (index)
          /admin/users     <- Manage users
          /admin/questions <- Manage questions
          /admin/import    <- Bulk import questions
          ======================================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin Dashboard (index) */}
        <Route index element={<AdminDashboard />} />

        {/* Admin: Manage Users */}
        <Route path="users" element={<AdminUsers />} />

        {/* Admin: Manage Questions */}
        <Route path="questions" element={<QuestionsPage />} />

        {/* Admin: Bulk Import */}
        <Route path="import" element={<BulkImportPage />} />
      </Route>

      {/* ========================================
          FALLBACK & 404 HANDLING
          Redirect unknown routes to appropriate dashboard
          ======================================== */}

      <Route
        path="*"
        element={
          user ? (
            // Authenticated user - redirect to their dashboard
            <Navigate to={getUserDashboard(user.role)} replace />
          ) : (
            // Not authenticated - redirect to login
            <Navigate to="/auth/login" replace />
          )
        }
      />
    </Routes>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================

/**
 * Root App Component
 *
 * Structure:
 * 1. Router - BrowserRouter wrapper for routing
 * 2. AuthProvider - Provides authentication context globally
 * 3. AppRoutes - Main routing logic
 *
 * The Router wraps AuthProvider so that useAuth() hook is available
 * throughout the component tree.
 */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

// ==========================================
// EXPORTS
// ==========================================

export { ProtectedRoute, LoadingScreen };