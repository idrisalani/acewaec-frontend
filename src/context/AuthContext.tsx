// frontend/src/context/AuthContext.tsx
// ✅ RECOMMENDED - Merged Best Practices from Both Implementations

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, LoginData } from '../types/auth.types';
import { authService } from '../services/auth.service';
import apiClient, { setAccessToken } from '../services/api';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  TUTOR = 'TUTOR',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: FormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

// ==========================================
// CONTEXT CREATION
// ==========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// AUTH PROVIDER COMPONENT
// ==========================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // INITIALIZE AUTH ON MOUNT
  // ==========================================

  /**
   * Dual-fetch strategy for optimal UX:
   * 1. Load cached user immediately (no flicker)
   * 2. Refresh data in background
   * 3. Fallback to API if no cache
   * 
   * Benefits:
   * - Instant page load (offline support)
   * - Fresh data via background refresh
   * - Prevents authentication flicker
   * - Graceful error handling
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const cachedUser = localStorage.getItem('user');

        if (token && cachedUser) {
          // ✅ Path 1: Token + Cache (Most Common)
          // Immediately restore user from cache to prevent UI flicker
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
          setAccessToken(token);

          // Refresh user data in background without blocking UI
          try {
            const response = await apiClient.get('/auth/me');
            const freshUser = response.data.data;
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          } catch (error) {
            console.warn(
              '⚠️ Background user refresh failed, using cached data:',
              error
            );
            // Silently fail - keep using cached user
          }
        } else if (token) {
          // ✅ Path 2: Token Only (Cache Miss)
          // Token exists but no cached user, fetch from API
          try {
            const response = await apiClient.get('/auth/me');
            const fetchedUser = response.data.data;
            setUser(fetchedUser);
            localStorage.setItem('user', JSON.stringify(fetchedUser));
            setAccessToken(token);
          } catch (error) {
            // Token invalid or expired
            console.error('❌ Auth token invalid:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setAccessToken(null);
            setUser(null);
          }
        }
        // ✅ Path 3: No Token & No Cache (Not Authenticated)
        // User is not authenticated, setUser remains null
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ==========================================
  // AUTH METHODS
  // ==========================================

  /**
   * Login user with email and password
   */
  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      const result = await authService.login(data);

      // Store token using helper (updates axios headers)
      setAccessToken(result.accessToken);

      // Store user for offline support
      localStorage.setItem('user', JSON.stringify(result.user));

      // Update context state
      setUser(result.user);

      console.log('✅ Login successful:', result.user.email);
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   * Supports FormData for file uploads (profile picture)
   */
  const register = async (data: FormData) => {
    try {
      setIsLoading(true);
      const result = await authService.register(data);

      // Store token
      setAccessToken(result.accessToken);

      // Store user for offline support
      localStorage.setItem('user', JSON.stringify(result.user));

      // Update context state
      setUser(result.user);

      console.log('✅ Registration successful:', result.user.email);
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   * Clears all authentication data
   */
  const logout = async () => {
    try {
      await authService.logout();
      console.log('✅ Logout API call successful');
    } catch (error) {
      console.error('⚠️ Logout API error (continuing with local cleanup):', error);
      // Continue with cleanup even if API call fails
    } finally {
      // Always clear local auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      setUser(null);
      console.log('✅ Local auth data cleared');
    }
  };

  /**
   * Refresh authentication token
   * Called when token is about to expire
   */
  const refreshToken = async () => {
    try {
      setIsLoading(true);
      const response = await authService.refreshToken();

      // Update token
      setAccessToken(response.accessToken);

      // Update user if provided
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      console.log('✅ Token refresh successful');
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      // Clear auth on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user information locally
   * Useful for profile updates, avatar changes, etc.
   */
  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = {
        ...user,
        ...updatedUser,
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      console.log('✅ User data updated:', newUser);
    }
  };

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const isAuthenticated = !!user;
  const isAdmin =
    user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SCHOOL_ADMIN;

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// HOOKS
// ==========================================

/**
 * Hook to use Auth Context
 * Must be called within AuthProvider
 * 
 * Usage:
 * const { user, login, logout, isLoading } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

/**
 * Hook to check if user has specific role(s)
 * Provides role-based conditional rendering
 * 
 * Usage:
 * const { isAdmin, hasRole } = useAuthRole();
 * if (isAdmin) { ... }
 * if (hasRole(['TEACHER', 'TUTOR'])) { ... }
 */
export function useAuthRole() {
  const { user } = useAuth();

  return {
    // Individual role checks
    isStudent: user?.role === UserRole.STUDENT,
    isTeacher: user?.role === UserRole.TEACHER,
    isTutor: user?.role === UserRole.TUTOR,
    isSchoolAdmin: user?.role === UserRole.SCHOOL_ADMIN,
    isSuperAdmin: user?.role === UserRole.SUPER_ADMIN,
    
    // Combined checks
    isAdmin: 
      user?.role === UserRole.SUPER_ADMIN || 
      user?.role === UserRole.SCHOOL_ADMIN,
    
    // Flexible role checking
    hasRole: (role: UserRole | UserRole[]) => {
      if (Array.isArray(role)) {
        // Check if user has any of the roles
        return user ? role.includes(user.role) : false;
      }
      // Check if user has specific role
      return user?.role === role;
    },
  };
}