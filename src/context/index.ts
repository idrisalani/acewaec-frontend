// frontend/src/context/index.ts
// ✅ Central export point for all auth utilities

// Components
export { AuthProvider } from './AuthContext';

// Context & Types
export { AuthContext } from './auth.context';
export type { AuthContextType } from './auth.context';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useAuthRole } from './hooks/useAuthRole';

// Re-export types
export type { User, LoginData, UserRole } from '../types/auth.types';