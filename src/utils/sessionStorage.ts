// frontend/src/utils/sessionStorage.ts
// ✅ FIXED - SessionStorageKey type used in all function signatures for proper type safety

/**
 * Session storage keys enum (define first for type safety)
 */
export const SESSION_STORAGE_KEYS = {
  CURRENT_PRACTICE_SESSION: 'currentSession',
  USER_PREFERENCES: 'userPreferences',
  TEMP_FORM_DATA: 'tempFormData',
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
} as const;

/**
 * Type helper - ensures functions only accept valid keys from SESSION_STORAGE_KEYS
 * @example
 * type Key = SessionStorageKey; // 'CURRENT_PRACTICE_SESSION' | 'USER_PREFERENCES' | ...
 */
export type SessionStorageKey = keyof typeof SESSION_STORAGE_KEYS;

/**
 * Session Storage Utility
 * Type-safe wrapper around browser's sessionStorage
 * All functions now properly enforce using keys from SESSION_STORAGE_KEYS
 */

/**
 * Save data to sessionStorage with type safety
 * ✅ FIXED: key parameter now uses SessionStorageKey type
 * 
 * @param key - Storage key (must be from SESSION_STORAGE_KEYS enum)
 * @param value - Value to store (will be JSON stringified)
 * @example
 * setSessionData('USER_DATA', { id: 1, name: 'John' });
 * setSessionData('CURRENT_PRACTICE_SESSION', sessionData);
 */
export function setSessionData<T = unknown>(
  key: SessionStorageKey,
  value: T
): void {
  try {
    const storageKey = SESSION_STORAGE_KEYS[key];
    const serialized = JSON.stringify(value);
    sessionStorage.setItem(storageKey, serialized);
    console.log(`✅ Saved session data [${storageKey}]`, value);
  } catch (error) {
    console.error(`❌ Failed to set session data for key "${key}":`, error);
  }
}

/**
 * Retrieve data from sessionStorage with type safety
 * ✅ FIXED: key parameter now uses SessionStorageKey type
 * 
 * @param key - Storage key (must be from SESSION_STORAGE_KEYS enum)
 * @param defaultValue - Default value if key doesn't exist
 * @returns Parsed value or default value
 * @example
 * const user = getSessionData<User>('USER_DATA', null);
 * const session = getSessionData<Session>('CURRENT_PRACTICE_SESSION');
 */
export function getSessionData<T = unknown>(
  key: SessionStorageKey,
  defaultValue: T | null = null
): T | null {
  try {
    const storageKey = SESSION_STORAGE_KEYS[key];
    const stored = sessionStorage.getItem(storageKey);
    if (stored === null) {
      console.log(`ℹ️ No data found for key "${key}"`);
      return defaultValue;
    }
    const parsed = JSON.parse(stored) as T;
    console.log(`✅ Retrieved session data [${storageKey}]`, parsed);
    return parsed;
  } catch (error) {
    console.error(`❌ Failed to get session data for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Remove data from sessionStorage
 * ✅ FIXED: key parameter now uses SessionStorageKey type
 * 
 * @param key - Storage key (must be from SESSION_STORAGE_KEYS enum)
 * @example
 * removeSessionData('USER_DATA');
 */
export function removeSessionData(key: SessionStorageKey): void {
  try {
    const storageKey = SESSION_STORAGE_KEYS[key];
    sessionStorage.removeItem(storageKey);
    console.log(`✅ Removed session data [${storageKey}]`);
  } catch (error) {
    console.error(`❌ Failed to remove session data for key "${key}":`, error);
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
    console.log('✅ Cleared all session storage');
  } catch (error) {
    console.error('❌ Failed to clear session storage:', error);
  }
}

/**
 * Check if a key exists in sessionStorage
 * ✅ FIXED: key parameter now uses SessionStorageKey type
 * 
 * @param key - Storage key (must be from SESSION_STORAGE_KEYS enum)
 * @returns true if key exists, false otherwise
 * @example
 * if (hasSessionData('USER_DATA')) { ... }
 */
export function hasSessionData(key: SessionStorageKey): boolean {
  try {
    const storageKey = SESSION_STORAGE_KEYS[key];
    const exists = sessionStorage.getItem(storageKey) !== null;
    console.log(`ℹ️ Session data "${key}" exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error(`❌ Failed to check session data for key "${key}":`, error);
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
    console.error('❌ Failed to get session storage keys:', error);
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
    console.log('✅ Retrieved all session data', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to get all session data:', error);
    return {};
  }
}

/**
 * Update existing data in sessionStorage (merge with existing)
 * ✅ FIXED: key parameter now uses SessionStorageKey type
 * 
 * @param key - Storage key (must be from SESSION_STORAGE_KEYS enum)
 * @param updates - Partial updates to merge
 * @example
 * updateSessionData('USER_DATA', { lastActive: Date.now() });
 * updateSessionData('CURRENT_PRACTICE_SESSION', { status: 'COMPLETED' });
 */
export function updateSessionData<T extends Record<string, unknown>>(
  key: SessionStorageKey,
  updates: Partial<T>
): void {
  try {
    const existing = getSessionData<T>(key, {} as T);
    if (existing !== null && typeof existing === 'object') {
      const merged = { ...existing, ...updates };
      setSessionData(key, merged);
      console.log(`✅ Updated session data [${SESSION_STORAGE_KEYS[key]}]`, merged);
    }
  } catch (error) {
    console.error(`❌ Failed to update session data for key "${key}":`, error);
  }
}

/**
 * Type definitions for common session data
 */
export interface SessionData {
  [key: string]: unknown;
}

/**
 * Usage Examples
 * ══════════════
 * 
 * Save session data:
 *   setSessionData('CURRENT_PRACTICE_SESSION', {
 *     session: { id: 'sess-1', ... },
 *     questions: [...],
 *     totalAvailable: 50
 *   });
 * 
 * Retrieve session data:
 *   const session = getSessionData<Session>('CURRENT_PRACTICE_SESSION');
 * 
 * Check if data exists:
 *   if (hasSessionData('USER_DATA')) { ... }
 * 
 * Update existing data:
 *   updateSessionData('USER_DATA', { lastActive: Date.now() });
 * 
 * Remove specific data:
 *   removeSessionData('TEMP_FORM_DATA');
 * 
 * Clear everything:
 *   clearSessionStorage();
 * 
 * TypeScript will error if you try to use invalid keys:
 *   setSessionData('INVALID_KEY', {}); // ❌ TypeScript error
 *   setSessionData('USER_DATA', {});   // ✅ Works perfectly
 */