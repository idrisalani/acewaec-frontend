/**
 * API Configuration - FIXED VERSION
 * ✅ Resolves avatar image loading issues
 * ✅ Proper CORS and cross-origin image handling
 * ✅ Handles both Cloudinary and local storage
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ImportMeta {
  env: Record<string, string | undefined>;
}

// ============================================================================
// SAFE ENVIRONMENT DETECTION
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
    // Relative paths without leading slash are also valid
    return /^[a-zA-Z0-9\-._~%!$&'()*+,;=:@/]+$/.test(url);
  } catch {
    return false;
  }
};

/**
 * ⭐ FIXED: Get full image URL from relative path
 * Now properly handles:
 * - Full URLs (http/https)
 * - Cloudinary URLs
 * - Relative paths with/without leading slash
 * - Data URLs
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  // 1. Already a full URL (Cloudinary or external)
  if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
    console.log('✅ Using full URL:', imagePath);
    return imagePath;
  }
  
  // 2. Cloudinary URL without protocol
  if (imagePath.includes('cloudinary') || imagePath.includes('res.cloudinary')) {
    const cloudinaryUrl = imagePath.startsWith('//') ? `https:${imagePath}` : imagePath;
    console.log('✅ Using Cloudinary URL:', cloudinaryUrl);
    return cloudinaryUrl;
  }
  
  // 3. Data URL
  if (imagePath.startsWith('data:')) {
    console.log('✅ Using data URL');
    return imagePath;
  }
  
  // 4. ⭐ FIXED: Relative path - properly construct with API base
  // Ensure path starts with /
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const fullUrl = `${API_BASE_URL}${cleanPath}`;
  
  console.log('✅ Constructed relative URL:', {
    original: imagePath,
    cleanPath,
    apiBase: API_BASE_URL,
    final: fullUrl
  });
  
  return fullUrl;
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
 * Get full API endpoint URL
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
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

// ============================================================================
// AVATAR GENERATION
// ============================================================================

/**
 * Generate default avatar URL using UI Avatars service
 * ✅ Most reliable, minimal dependencies
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
  
  const url = `https://ui-avatars.com/api/?${params.toString()}`;
  console.log('🎭 Generated default avatar URL:', url);
  return url;
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
 * ⭐ FIXED: Get safe image URL with proper fallback
 * Now logs all steps for debugging
 */
export const getSafeImageUrl = (
  imagePath: string | null | undefined,
  userId: string | undefined,
  userName: string | undefined
): string => {
  console.log('🖼️ getSafeImageUrl called with:', {
    imagePath,
    userId,
    userName
  });

  // If user has uploaded an image and it's valid, use it
  if (imagePath && validateImageUrl(imagePath)) {
    const imageUrl = getImageUrl(imagePath);
    if (imageUrl) {
      console.log('✅ Using uploaded image:', imageUrl);
      return imageUrl;
    }
  }
  
  // Otherwise, generate default avatar
  console.log('⚠️ Image path invalid/missing, generating default avatar');
  const defaultAvatar = getAvatarUrl(userId, userName);
  console.log('📌 Default avatar:', defaultAvatar);
  return defaultAvatar;
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
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout'
  },

  // Practice endpoints
  PRACTICE: {
    SUBJECTS: '/api/practice/subjects',
    TOPICS: (subjectId: string) => `/api/practice/subjects/${subjectId}/topics`,
    START_SESSION: '/api/practice/sessions',
    GET_SESSION: (id: string) => `/api/practice/sessions/${id}`,
    GET_SESSIONS: '/api/practice/sessions',
    GET_QUESTIONS: (id: string) => `/api/practice/sessions/${id}/questions`,
    SUBMIT_ANSWER: (id: string) => `/api/practice/sessions/${id}/submit-answer`,
    SUBMIT_ANSWERS: (id: string) => `/api/practice/sessions/${id}/answers`,
    TOGGLE_FLAG: (id: string) => `/api/practice/sessions/${id}/toggle-flag`,
    PAUSE: (id: string) => `/api/practice/sessions/${id}/pause`,
    RESUME: (id: string) => `/api/practice/sessions/${id}/resume`,
    COMPLETE: (id: string) => `/api/practice/sessions/${id}/complete`,
    GET_RESULTS: (id: string) => `/api/practice/sessions/${id}/results`,
    GET_HISTORY: (id: string) => `/api/practice/sessions/${id}/history`
  },

  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard',
    PERFORMANCE: '/api/analytics/performance',
    GOALS: '/api/analytics/goals',
    STREAKS: '/api/analytics/streaks'
  },

  // Users endpoints
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/me',
    AVATAR: '/api/users/avatar',
    UPLOAD_PICTURE: '/api/users/profile/picture'
  },

  // Legacy format for backward compatibility
  AUTH_ENDPOINT: `${API_BASE_URL}/api/auth`,
  USERS_ENDPOINT: `${API_BASE_URL}/api/users`,
  PROFILES: `${API_BASE_URL}/uploads/profiles`,
  UPLOADS: `${API_BASE_URL}/uploads`,
  QUESTIONS: `${API_BASE_URL}/api/questions`,
  ANALYTICS_ENDPOINT: `${API_BASE_URL}/api/analytics`,
  GOALS: `${API_BASE_URL}/api/goals`,
  PRACTICE_ENDPOINT: `${API_BASE_URL}/api/practice`,
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