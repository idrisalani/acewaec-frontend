// frontend/src/context/AuthContext.tsx
// ✅ FINAL FIX - All TypeScript errors resolved
// ✅ Only exports AuthProvider component
// ✅ Context and types moved to separate auth.context.ts file

import {
  useState,
  useEffect,
  type ReactNode,
  type JSX,
} from 'react';
import type { User, LoginData } from '../types/auth.types';
import { authService } from '../services/auth.service';
import apiClient, { setAccessToken } from '../services/api';
import { AuthContext, type AuthContextType } from './auth.context';

// ==========================================
// AUTH PROVIDER COMPONENT ONLY
// ==========================================

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Wraps the application to provide authentication context
 * 
 * Features:
 * - Dual-fetch strategy for optimal UX (cached + fresh data)
 * - Offline support via localStorage caching
 * - Automatic token refresh
 * - Admin role detection
 * - TypeScript strict mode compliant
 * 
 * Usage:
 * ```
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
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
    const initializeAuth = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('accessToken');
        const cachedUser = localStorage.getItem('user');

        if (token && cachedUser) {
          // ✅ Path 1: Token + Cache (Most Common)
          // Immediately restore user from cache to prevent UI flicker
          const parsedUser = JSON.parse(cachedUser) as User;
          setUser(parsedUser);
          setAccessToken(token);

          // Refresh user data in background without blocking UI
          try {
            const response = await apiClient.get('/auth/me');
            const freshUser = response.data.data as User;
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
            const fetchedUser = response.data.data as User;
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
  const login = async (data: LoginData): Promise<void> => {
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
  const register = async (data: FormData): Promise<void> => {
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
  const logout = async (): Promise<void> => {
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
  const refreshToken = async (): Promise<void> => {
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
  const updateUser = (updatedUser: Partial<User>): void => {
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
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SCHOOL_ADMIN';

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

// Export display name for debugging
AuthProvider.displayName = 'AuthProvider';