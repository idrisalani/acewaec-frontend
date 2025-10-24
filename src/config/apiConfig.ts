/**
 * API Configuration - RECONCILED VERSION
 * Handles environment-specific API endpoints
 * Includes default avatar generation for users without profile pictures
 * 
 * Usage:
 * - import.meta.env.VITE_API_BASE_URL for API endpoints
 * - getImageUrl(path) for image URLs
 * - getAvatarUrl(userId, name) for default avatars
 */

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
 * @returns Default avatar URL
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
  style: string = 'avataaars'
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
  // If user has uploaded an image, use it
  if (imagePath) {
    const imageUrl = getImageUrl(imagePath);
    if (imageUrl) {
      return imageUrl;
    }
  }
  
  // Otherwise, generate default avatar
  return getAvatarUrl(userId, userName);
};

/**
 * Configuration object for API endpoints
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

export { API_BASE_URL };