// frontend/src/context/auth.context.ts
// ✅ Separate file for context definition
// Prevents circular dependencies and type issues

import { createContext } from 'react';
import type { User, LoginData } from '../types/auth.types';

// ==========================================
// AUTH CONTEXT TYPE DEFINITION
// ==========================================

export interface AuthContextType {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;

  // Methods
  login: (data: LoginData) => Promise<void>;
  register: (data: FormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

// ==========================================
// AUTH CONTEXT
// ==========================================

/**
 * AuthContext - Provides authentication state and methods
 * 
 * Default context value has null user (not authenticated)
 * This is safe because AuthProvider wraps the app and provides real values
 */
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => {
    throw new Error('AuthContext not initialized - ensure AuthProvider wraps your app');
  },
  register: async () => {
    throw new Error('AuthContext not initialized - ensure AuthProvider wraps your app');
  },
  logout: async () => {
    throw new Error('AuthContext not initialized - ensure AuthProvider wraps your app');
  },
  refreshToken: async () => {
    throw new Error('AuthContext not initialized - ensure AuthProvider wraps your app');
  },
  updateUser: () => {
    throw new Error('AuthContext not initialized - ensure AuthProvider wraps your app');
  },
});

AuthContext.displayName = 'AuthContext';