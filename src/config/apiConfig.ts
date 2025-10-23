/**
 * API Configuration
 * Handles environment-specific API endpoints
 * 
 * Usage:
 * - import.meta.env.VITE_API_BASE_URL for API endpoints
 * - getImageUrl(path) for image URLs
 */

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Get full image URL from relative path
 * @param imagePath - Relative path from backend (e.g., '/uploads/avatar.jpg')
 * @returns Full URL (e.g., https://api.example.com/uploads/avatar.jpg)
 */
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
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

export { API_BASE_URL };