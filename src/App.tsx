import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import PracticeSetup from './components/practice/PracticeSetup';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import QuestionsPage from './pages/admin/QuestionsPage';
import BulkImportPage from './pages/admin/BulkImportPage';
import TutorsPage from './pages/TutorsPage'; 
import PracticeResults from './pages/PracticeResults';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ComprehensiveExamSetup from './pages/ComprehensiveExamSetup';
import ComprehensiveExamDashboard from './pages/ComprehensiveExamDashboard';
import ComprehensiveExamResults from './pages/ComprehensiveExamResults';
import LandingPage from './pages/LandingPage';
import PracticeSession from './pages/PracticeSession';
import AdminUsers from './pages/admin/AdminUsers';
import './index.css';

// Helper function to check if user is admin
const isAdmin = (role?: string) => {
  return role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN';
};

function ProtectedRoute({ 
  children, 
  adminOnly = false,
  allowedRoles = [],
}: { 
  children: React.ReactNode;
  adminOnly?: boolean;
  allowedRoles?: string[];
}) {
  const { user } = useAuth();
  
  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Admin-only route
  if (adminOnly && !isAdmin(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Role-specific route
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    if (isAdmin(user.role)) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, isAdmin, isLoading } = useAuth();

  // Show loading screen while checking auth - PREVENTS FLICKER
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading AceWAEC Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth Routes - Redirect if already logged in */}
      <Route 
        path="/login" 
        element={user ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Register />} 
      />
      <Route path="/admin/users" element={<AdminUsers />} />
      
      {/* Student Dashboard */}
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'TUTOR']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Practice Routes - Student only */}
      <Route 
        path="/practice/setup" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <PracticeSetup />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/practice/:sessionId" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <PracticeSession />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/practice/:sessionId/results" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <PracticeResults />
          </ProtectedRoute>
        } 
      />
      
      {/* Comprehensive Exam Routes - Student only */}
      <Route 
        path="/comprehensive-exam/setup" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ComprehensiveExamSetup />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/comprehensive-exam/:examId" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ComprehensiveExamDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/comprehensive-exam/:examId/results" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ComprehensiveExamResults />
          </ProtectedRoute>
        } 
      />
      
      {/* Analytics - Students and Teachers */}
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Tutors Marketplace */}
      <Route 
        path="/tutors" 
        element={
          <ProtectedRoute>
            <TutorsPage />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes - Super Admin and School Admin */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="import" element={<BulkImportPage />} />
        {/* Add more admin routes here */}
      </Route>
      
      {/* Fallback - redirect based on role */}
      <Route 
        path="*" 
        element={
          user ? (
            <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;