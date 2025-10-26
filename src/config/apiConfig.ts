/**
 * API Configuration - ENHANCED VERSION
 * Handles environment-specific API endpoints with validation
 * Includes default avatar generation for users without profile pictures
 * Enhanced with security validation and error handling
 * 
 * Compatible with ISSUE5 avatar fix and all other fixes
 */

// Environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const AVATAR_STYLE = import.meta.env.VITE_AVATAR_STYLE || 'avataaars';

/**
 * Validate URL format and security
 * @param url - URL to validate
 * @returns true if URL is valid and safe
 */
export const validateImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  try {
    // Check if it's a valid HTTP(S) URL
    if (url.startsWith('http') || url.startsWith('https')) {
      new URL(url);
      return true;
    }
    // Check if it's a data URL
    if (url.startsWith('data:')) return true;
    // Check if it's a relative path
    if (url.startsWith('/')) return true;
    
    return false;
  } catch {
    return false;
  }
};

/**
 * Get full image URL from relative path
 * Handles Cloudinary URLs, data URLs, and relative paths
 * @param imagePath - Relative path from backend (e.g., '/uploads/avatar.jpg')
 * @returns Full URL or empty string if no path provided
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  // If already a full URL (http/https), return as-is
  if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
    return imagePath;
  }
  
  // If Cloudinary URL, return as-is
  if (imagePath.includes('cloudinary') || imagePath.includes('res.cloudinary')) {
    return imagePath;
  }
  
  // If data URL, return as-is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Get full API endpoint URL
 * @param endpoint - API endpoint path (e.g., '/api/users')
 * @returns Full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Generate default avatar URL for users without profile pictures
 * Uses UI Avatar service for dynamic avatar generation
 * 
 * @param userId - Unique identifier for the user
 * @param name - User's name (for initials display)
 * @param size - Avatar size in pixels (default: 200)
 * @returns Default avatar URL from ui-avatars.com
 * 
 * @example
 * getAvatarUrl('user123', 'John Doe') 
 * // Returns: https://ui-avatars.com/api/?name=John+Doe&background=random&size=200
 */
export const getAvatarUrl = (
  userId: string | undefined,
  name: string | undefined,
  size: number = 200
): string => {
  // Fallback if no name provided
  const displayName = userId || name || 'User';
  
  // Use UI Avatars API for default avatars
  // This generates a colorful avatar with user initials
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
 * Alternative: Generate avatar using DiceBear API
 * More options for avatar styles
 * 
 * @param userId - Unique identifier for the user
 * @param name - User's name
 * @param style - Avatar style ('avataaars', 'big-ears', 'big-smile', etc.)
 * @returns DiceBear avatar URL
 * 
 * @example
 * getAvatarUrlDiceBear('user123', 'John Doe', 'avataaars')
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
 * Get safe image URL with fallback
 * Returns the provided image URL if valid, otherwise returns default avatar
 * 
 * @param imagePath - User's profile image path
 * @param userId - User's ID for default avatar generation
 * @param userName - User's name for default avatar
 * @returns Valid image URL (either user's image or default avatar)
 * 
 * @example
 * getSafeImageUrl(user.profileImage, user.id, user.name)
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
 * Ensures URL is properly formatted before use
 * 
 * @param imagePath - User's image path
 * @param fallbackUserId - Fallback user ID for avatar generation
 * @param fallbackName - Fallback name for avatar generation
 * @returns Valid image URL or default avatar
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

/**
 * Configuration object for API endpoints
 * All endpoints use the configured API_BASE_URL
 */
export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: `${API_BASE_URL}/auth`,
  USERS: `${API_BASE_URL}/users`,
  PROFILES: `${API_BASE_URL}/uploads/profiles`,
  UPLOADS: `${API_BASE_URL}/uploads`,
  QUESTIONS: `${API_BASE_URL}/questions`,
  ANALYTICS: `${API_BASE_URL}/analytics`,
  GOALS: `${API_BASE_URL}/goals`,
  PRACTICE: `${API_BASE_URL}/practice`,
} as const;

export { API_BASE_URL, AVATAR_STYLE };