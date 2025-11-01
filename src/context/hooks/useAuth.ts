// frontend/src/hooks/useAuth.ts
// ✅ Custom hook for accessing AuthContext with proper error handling

import { useContext } from 'react';
import { AuthContext } from '../';

/**
 * useAuth - Custom hook for accessing authentication context
 * 
 * Usage:
 * ```
 * const { user, login, logout, isAuthenticated } = useAuth();
 * ```
 * 
 * Throws error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      '❌ useAuth must be used within an AuthProvider. ' +
      'Wrap your component tree with <AuthProvider> in App.tsx'
    );
  }

  return context;
}

export default useAuth;