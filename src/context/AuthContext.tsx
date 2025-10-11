import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import apiClient, { setAccessToken } from '../services/api';
import type { User, LoginData } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: FormData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SCHOOL_ADMIN';
  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const cachedUser = localStorage.getItem('user');
      
      if (token && cachedUser) {
        // Immediately set user from cache - prevents flickering
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
        setAccessToken(token);
        
        // Then try to refresh from API in background
        try {
          const response = await apiClient.get('/auth/me');
          setUser(response.data.data);
          localStorage.setItem('user', JSON.stringify(response.data.data));
        } catch {
          // If refresh fails, keep using cached user
          console.log('Using cached user data');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    // Don't change isLoading here - let the login component handle it
    try {
      const result = await authService.login(data);
      setAccessToken(result.accessToken);
      
      // Immediately update user state
      setUser(result.user);
      
      console.log('✅ User state updated:', result.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(data);
      setAccessToken(result.accessToken);
      setUser(result.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        register, 
        logout, 
        isLoading,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};