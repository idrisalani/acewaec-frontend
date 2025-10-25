// frontend/src/utils/sessionStorage.ts
// ✅ FIXED - All implicit 'any' types removed

/**
 * Session Storage Utility
 * Type-safe wrapper around browser's sessionStorage
 */

/**
 * Save data to sessionStorage with type safety
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified)
 * @example
 * setSessionData('user', { id: 1, name: 'John' });
 */
export function setSessionData<T = unknown>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    sessionStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Failed to set session data for key "${key}":`, error);
  }
}

/**
 * Retrieve data from sessionStorage with type safety
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Parsed value or default value
 * @example
 * const user = getSessionData<User>('user', null);
 */
export function getSessionData<T = unknown>(key: string, defaultValue: T | null = null): T | null {
  try {
    const stored = sessionStorage.getItem(key);
    if (stored === null) {
      return defaultValue;
    }
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Failed to get session data for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Remove data from sessionStorage
 * @param key - Storage key
 * @example
 * removeSessionData('user');
 */
export function removeSessionData(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove session data for key "${key}":`, error);
  }
}

/**
 * Clear all sessionStorage data
 * @example
 * clearSessionStorage();
 */
export function clearSessionStorage(): void {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Failed to clear session storage:', error);
  }
}

/**
 * Check if a key exists in sessionStorage
 * @param key - Storage key
 * @returns true if key exists, false otherwise
 * @example
 * if (hasSessionData('user')) { ... }
 */
export function hasSessionData(key: string): boolean {
  try {
    return sessionStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Failed to check session data for key "${key}":`, error);
    return false;
  }
}

/**
 * Get all keys from sessionStorage
 * @returns Array of all keys
 * @example
 * const keys = getAllSessionKeys();
 */
export function getAllSessionKeys(): string[] {
  try {
    return Object.keys(sessionStorage);
  } catch (error) {
    console.error('Failed to get session storage keys:', error);
    return [];
  }
}

/**
 * Get all data from sessionStorage as a record
 * @returns Object with all key-value pairs
 * @example
 * const allData = getAllSessionData();
 */
export function getAllSessionData(): Record<string, unknown> {
  try {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key !== null) {
        const value = sessionStorage.getItem(key);
        data[key] = value ? JSON.parse(value) : null;
      }
    }
    return data;
  } catch (error) {
    console.error('Failed to get all session data:', error);
    return {};
  }
}

/**
 * Update existing data in sessionStorage (merge with existing)
 * @param key - Storage key
 * @param updates - Partial updates to merge
 * @example
 * updateSessionData('user', { lastActive: Date.now() });
 */
export function updateSessionData<T extends Record<string, unknown>>(
  key: string,
  updates: Partial<T>
): void {
  try {
    const existing = getSessionData<T>(key, {} as T);
    if (existing !== null && typeof existing === 'object') {
      const merged = { ...existing, ...updates };
      setSessionData(key, merged);
    }
  } catch (error) {
    console.error(`Failed to update session data for key "${key}":`, error);
  }
}

/**
 * Type definitions for common session data
 */
export interface SessionData {
  [key: string]: unknown;
}

/**
 * Session storage keys enum (optional, for type safety)
 */
export const SESSION_STORAGE_KEYS = {
  CURRENT_PRACTICE_SESSION: 'currentSession',
  USER_PREFERENCES: 'userPreferences',
  TEMP_FORM_DATA: 'tempFormData',
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
} as const;

export type SessionStorageKey = typeof SESSION_STORAGE_KEYS[keyof typeof SESSION_STORAGE_KEYS];