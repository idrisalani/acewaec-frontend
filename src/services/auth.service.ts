import apiClient, { setAccessToken } from './api';
import type { LoginData } from '../types/auth.types';

export const authService = {
  async login(data: LoginData) {
    const response = await apiClient.post('/auth/login', data);
    
    const { accessToken, user } = response.data.data;
    
    // Store token using setAccessToken (which saves to localStorage)
    setAccessToken(accessToken);
    
    // Also store user
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data;
  },

  async register(data: FormData) {
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
    
    return response.data.data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear everything
    setAccessToken(null);
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};