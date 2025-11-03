/**
 * API Configuration - ESLINT COMPLIANT VERSION
 * ✅ No syntax errors
 * ✅ No TypeScript errors
 * ✅ No ESLint errors (no-explicit-any, no-unused-vars)
 * ✅ Avatar functions included
 * ✅ URL validation included
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ImportMeta {
  env: Record<string, string | undefined>;
}

// ============================================================================
// SAFE ENVIRONMENT DETECTION (No 'process' errors in browser)
// ============================================================================

const isDevelopment = typeof window !== 'undefined' && 
                      (window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1');

/**
 * Get API Base URL - Safely detects environment
 */
const getAPIBaseURL = (): string => {
  // Try Vite environment variable first
  try {
    const meta = import.meta as ImportMeta;
    const viteEnv = meta?.env?.VITE_APP_BASE_URL;
    if (viteEnv) {
      console.log('🌐 Using Vite API URL:', viteEnv);
      return viteEnv;
    }
  } catch {
    // Ignore - might not be Vite
  }

  // Development detection
  if (isDevelopment) {
    console.log('🔧 Using local development API');
    return 'http://localhost:5000';
  }

  // Production
  console.log('🌐 Using production API');
  return 'https://acewaec-backend-1.onrender.com';
};

export const API_BASE_URL = getAPIBaseURL();

const getAvatarStyle = (): string => {
  try {
    const meta = import.meta as ImportMeta;
    return meta?.env?.VITE_AVATAR_STYLE || 'avataaars';
  } catch {
    return 'avataaars';
  }
};

export const AVATAR_STYLE = getAvatarStyle();

// ============================================================================
// URL VALIDATION & CONSTRUCTION
// ============================================================================

/**
 * Validate URL format and security
 */
export const validateImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  try {
    if (url.startsWith('http') || url.startsWith('https')) {
      new URL(url);
      return true;
    }
    if (url.startsWith('data:')) return true;
    if (url.startsWith('/')) return true;
    return false;
  } catch {
    return false;
  }
};

/**
 * Build full URL for API endpoints
 */
export const getFullURL = (endpoint: string): string => {
  const base = API_BASE_URL;
  if (endpoint.startsWith('/')) {
    return `${base}${endpoint}`;
  }
  return `${base}/${endpoint}`;
};

/**
 * Get full image URL from relative path
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  // Already a full URL
  if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
    return imagePath;
  }
  
  // Cloudinary URL
  if (imagePath.includes('cloudinary') || imagePath.includes('res.cloudinary')) {
    return imagePath;
  }
  
  // Data URL
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Relative path
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Alias for compatibility
 */
export const getImageURL = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return getAvatarUrl(undefined, undefined);
  }
  return getImageUrl(imagePath);
};

/**
 * Get full API endpoint URL
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// ============================================================================
// AVATAR GENERATION
// ============================================================================

/**
 * Generate default avatar URL using UI Avatars service
 */
export const getAvatarUrl = (
  userId: string | undefined,
  name: string | undefined,
  size: number = 200
): string => {
  const displayName = userId || name || 'User';
  
  const params = new URLSearchParams({
    name: displayName,
    background: 'random',
    color: 'fff',
    bold: 'true',
    size: size.toString(),
  });
  
  return `https://ui-avatars.com/api/?${params.toString()}`;
};

/**
 * Generate avatar using DiceBear API (alternative)
 */
export const getAvatarUrlDiceBear = (
  userId: string | undefined,
  name: string | undefined,
  style: string = AVATAR_STYLE
): string => {
  const seed = userId || name || 'default';
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&scale=80`;
};

/**
 * Get safe image URL with fallback to default avatar
 */
export const getSafeImageUrl = (
  imagePath: string | null | undefined,
  userId: string | undefined,
  userName: string | undefined
): string => {
  // If user has uploaded an image and it's valid, use it
  if (imagePath && validateImageUrl(imagePath)) {
    const imageUrl = getImageUrl(imagePath);
    if (imageUrl) return imageUrl;
  }
  
  // Otherwise, generate default avatar
  return getAvatarUrl(userId, userName);
};

/**
 * Get valid image URL with validation and error handling
 */
export const getValidImageUrl = (
  imagePath: string | null | undefined,
  fallbackUserId?: string,
  fallbackName?: string
): string => {
  if (validateImageUrl(imagePath)) {
    const url = getImageUrl(imagePath);
    if (url) return url;
  }
  return getAvatarUrl(fallbackUserId, fallbackName);
};

// ============================================================================
// API ENDPOINTS CONFIGURATION
// ============================================================================

export const API_ENDPOINTS = {
  // Base
  BASE: API_BASE_URL,
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },

  // Practice endpoints
  PRACTICE: {
    SUBJECTS: '/practice/subjects',
    TOPICS: (subjectId: string) => `/practice/subjects/${subjectId}/topics`,
    START_SESSION: '/practice/sessions',
    GET_SESSION: (id: string) => `/practice/sessions/${id}`,
    GET_SESSIONS: '/practice/sessions',
    GET_QUESTIONS: (id: string) => `/practice/sessions/${id}/questions`,
    SUBMIT_ANSWER: (id: string) => `/practice/sessions/${id}/submit-answer`,
    SUBMIT_ANSWERS: (id: string) => `/practice/sessions/${id}/answers`,
    TOGGLE_FLAG: (id: string) => `/practice/sessions/${id}/toggle-flag`,
    PAUSE: (id: string) => `/practice/sessions/${id}/pause`,
    RESUME: (id: string) => `/practice/sessions/${id}/resume`,
    COMPLETE: (id: string) => `/practice/sessions/${id}/complete`,
    GET_RESULTS: (id: string) => `/practice/sessions/${id}/results`,
    GET_HISTORY: (id: string) => `/practice/sessions/${id}/history`
  },

  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    PERFORMANCE: '/analytics/performance',
    GOALS: '/analytics/goals',
    STREAKS: '/analytics/streaks'
  },

  // Users endpoints
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    AVATAR: '/users/avatar'
  },

  // Upload endpoints
  UPLOAD: {
    PROFILE_PICTURE: '/upload/profile'
  },

  // Legacy format for backward compatibility
  AUTH_ENDPOINT: `${API_BASE_URL}/auth`,
  USERS_ENDPOINT: `${API_BASE_URL}/users`,
  PROFILES: `${API_BASE_URL}/uploads/profiles`,
  UPLOADS: `${API_BASE_URL}/uploads`,
  QUESTIONS: `${API_BASE_URL}/questions`,
  ANALYTICS_ENDPOINT: `${API_BASE_URL}/analytics`,
  GOALS: `${API_BASE_URL}/goals`,
  PRACTICE_ENDPOINT: `${API_BASE_URL}/practice`,
} as const;

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  AVATAR_STYLE,
  getFullURL,
  getImageURL,
  getImageUrl,
  getApiUrl,
  getAvatarUrl,
  getAvatarUrlDiceBear,
  getSafeImageUrl,
  getValidImageUrl,
  validateImageUrl,
};