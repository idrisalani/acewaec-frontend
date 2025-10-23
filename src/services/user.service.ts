// frontend/src/services/user.service.ts
// ✅ User Service - Handles all user/profile related API calls

import apiClient from './api';

export interface StudentInfo {
  id?: string;
  name: string;
  email?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  phone?: string;
  school?: string;
  grade?: string;
}

export interface UserProfile extends StudentInfo {
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  joinDate?: string;
  lastLogin?: string;
}

export const userService = {
  /**
   * Get current student's basic info
   * Used for displaying name, avatar, etc.
   */
  async getStudentInfo(): Promise<StudentInfo> {
    try {
      const response = await apiClient.get('/users/student/me');
      return response.data.data || { name: 'Student' };
    } catch (error) {
      console.error('Failed to fetch student info:', error);
      return { name: 'Student' }; // Fallback
    }
  },

  /**
   * Get complete user profile
   * Includes all user details like bio, date of birth, etc.
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.put('/users/profile', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<{ profilePicture: string; secure_url: string }> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await apiClient.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw error;
    }
  },

  /**
   * Get user by ID (for admin/teacher purposes)
   */
  async getUserById(userId: string): Promise<UserProfile> {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },

  /**
   * Get all users (for admin purposes)
   */
  async getAllUsers(query?: { role?: string; limit?: number; offset?: number }) {
    try {
      const response = await apiClient.get('/users', { params: query });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: string): Promise<UserProfile> {
    try {
      const response = await apiClient.put(`/users/${userId}/role`, { role });
      return response.data.data;
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw error;
    }
  },

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete('/users/account', {
        data: { password },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  },

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  },

  /**
   * Get user preferences/settings
   */
  async getPreferences(): Promise<Record<string, unknown>> {
    try {
      const response = await apiClient.get('/users/preferences');
      return response.data.data || {};
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      return {};
    }
  },

  /**
   * Update user preferences/settings
   */
  async updatePreferences(preferences: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const response = await apiClient.put('/users/preferences', preferences);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  },
};

export default userService;