// frontend/src/context/auth.context.ts
// ✅ Context creation and types in separate file
// This satisfies ESLint - no components exported from here

import { createContext } from 'react';
import type { User } from '../types/auth.types';
import type { LoginData } from '../types/auth.types';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

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

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

AuthContext.displayName = 'AuthContext';