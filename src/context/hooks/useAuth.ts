// frontend/src/context/hooks/useAuth.ts
// ✅ useAuth hook - separate file

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../auth.context';

/**
 * Hook to use Auth Context
 * Must be called within AuthProvider
 *
 * Usage:
 * const { user, login, logout, isLoading } = useAuth();
 *
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}