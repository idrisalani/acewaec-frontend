// frontend/src/context/hooks/useAuthRole.ts
// ✅ useAuthRole hook - separate file with string literal checks

import { useAuth } from './useAuth';
import type { UserRole } from '../../types/auth.types';

/**
 * Hook to check if user has specific role(s)
 * Provides role-based conditional rendering
 *
 * Usage:
 * const { isAdmin, hasRole } = useAuthRole();
 * if (isAdmin) { ... }
 * if (hasRole(['TEACHER', 'TUTOR'])) { ... }
 *
 * @returns Object with role check utilities
 */
export function useAuthRole() {
  const { user } = useAuth();

  const hasRole = (role: UserRole | UserRole[]) => {
    if (Array.isArray(role)) {
      // Check if user has any of the roles
      return user ? role.includes(user.role) : false;
    }
    // Check if user has specific role
    return user?.role === role;
  };

  return {
    // Individual role checks (using string literals instead of enum)
    isStudent: user?.role === 'STUDENT',
    isTeacher: user?.role === 'TEACHER',
    isTutor: user?.role === 'TUTOR',
    isSchoolAdmin: user?.role === 'SCHOOL_ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',

    // Combined checks
    isAdmin:
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'SCHOOL_ADMIN',

    // Flexible role checking
    hasRole,
  };
}