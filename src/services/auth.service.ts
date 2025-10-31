// frontend/src/services/auth.service.ts
// ✅ COMPLETE - All auth methods including refreshToken

import apiClient, { setAccessToken } from './api';
import type { LoginData, User } from '../types/auth.types';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

// ==========================================
// AUTH SERVICE
// ==========================================

export const authService = {
  /**
   * Login with email and password
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', data);

      const { accessToken, user } = response.data.data;

      // Store token using setAccessToken (which saves to localStorage)
      setAccessToken(accessToken);

      // Also store user
      localStorage.setItem('user', JSON.stringify(user));

      console.log('✅ Login successful');
      return response.data.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  /**
   * Register new user with profile picture support
   */
  async register(data: FormData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { accessToken, user } = response.data.data;

      // Store token using setAccessToken
      setAccessToken(accessToken);

      // Store user
      localStorage.setItem('user', JSON.stringify(user));

      console.log('✅ Registration successful');
      return response.data.data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  /**
   * Logout user - clear all auth data
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
      console.log('✅ Logout API call successful');
    } catch (error) {
      console.error('⚠️ Logout API error (continuing with cleanup):', error);
      // Continue with cleanup even if API fails
    } finally {
      // Always clear local auth data
      setAccessToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      console.log('✅ Local auth data cleared');
    }
  },

  /**
   * Refresh authentication token
   * ✅ THIS WAS MISSING - Now added
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/refresh-token');

      const { accessToken, user } = response.data.data;

      // Update token
      setAccessToken(accessToken);

      // Update user if provided
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      console.log('✅ Token refresh successful');
      return response.data.data;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // Clear auth on refresh failure
      setAccessToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      throw error;
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? (JSON.parse(userStr) as User) : null;
    } catch (error) {
      console.error('❌ Failed to parse user from localStorage:', error);
      return null;
    }
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post('/auth/verify-email', { token });
      console.log('✅ Email verified');
    } catch (error) {
      console.error('❌ Email verification failed:', error);
      throw error;
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/request-password-reset', { email });
      console.log('✅ Password reset email sent');
    } catch (error) {
      console.error('❌ Password reset request failed:', error);
      throw error;
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
      console.log('✅ Password reset successful');
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },
};

export default authService;