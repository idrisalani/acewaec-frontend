// frontend/src/services/api.ts
// ✅ PRODUCTION READY - Smart middleware that adapts to environment + Fixed Axios typing

import axios, { 
  AxiosError, 
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios';

// ==========================================
// TYPES
// ==========================================

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Generic error response
 */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// ==========================================
// CONFIGURATION
// ==========================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds - prevents hanging requests

// ==========================================
// AXIOS INSTANCE
// ==========================================

/**
 * Main API client instance
 * - Uses withCredentials for cookie-based auth support
 * - Timeout prevents indefinite hangs
 * - JSON content type by default
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true, // ✅ Send cookies with requests (for httpOnly token support)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// TOKEN MANAGEMENT
// ==========================================

/**
 * Set or clear access token in localStorage
 * 
 * Why localStorage instead of memory variable:
 * - Single source of truth (no sync issues)
 * - Survives page refresh
 * - Easier to debug
 * - Reliable and simple
 * 
 * @param token - JWT token string or null to clear
 */
export const setAccessToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('accessToken', token);
    console.log('✅ Access token saved to localStorage');
  } else {
    localStorage.removeItem('accessToken');
    console.log('✅ Access token cleared from localStorage');
  }
};

/**
 * Get access token from localStorage
 * Used for manual token access (rarely needed)
 * 
 * @returns Current token or null
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Check if user is authenticated
 * @returns true if token exists
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

/**
 * Add authorization token to every request
 * 
 * Why read from localStorage on every request:
 * - Ensures always using latest token
 * - No sync issues with memory variable
 * - Token might be refreshed by another tab
 * 
 * ✅ FIXED: Using InternalAxiosRequestConfig for proper type compatibility
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // ✅ Read token from localStorage on every request
    // This ensures we have the latest token, even if refreshed elsewhere
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Development logging (helps debugging)
    if (import.meta.env.DEV) {
      const method = config.method?.toUpperCase() ?? 'UNKNOWN';
      const baseURL = config.baseURL ?? '';
      const url = config.url ?? '';
      console.log(`📤 ${method} ${baseURL}${url}`);
    }

    return config;
  },
  (error: AxiosError | Error) => {
    console.error('❌ Request error:', error instanceof AxiosError ? error.message : String(error));
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

/**
 * Handle responses and errors
 * 
 * Handles:
 * - Success logging
 * - 401 Unauthorized (token expiry)
 * - 403 Forbidden (access denied)
 * - 422 Validation errors
 * - Network errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // ✅ Development logging
    if (import.meta.env.DEV) {
      const status = response.status;
      const baseURL = response.config.baseURL ?? '';
      const url = response.config.url ?? '';
      console.log(`📥 ${status} ${baseURL}${url}`);
    }

    return response;
  },
  (error: AxiosError<ApiErrorResponse> | Error) => {
    // Type guard to ensure we have an AxiosError
    if (error instanceof AxiosError) {
      // ✅ Your approach: Simple 401 handling
      // Clear tokens and redirect to login
      if (
        error.response?.status === 401 &&
        !window.location.pathname.includes('/login')
      ) {
        console.warn('⚠️ Unauthorized (401) - Redirecting to login');

        // Clear all auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Redirect to login
        window.location.href = '/login?reason=unauthorized';
      }
      // ✅ Enhanced: Handle other error types
      else if (error.response?.status === 403) {
        console.error('❌ Forbidden (403) - Access denied');
      } else if (error.response?.status === 422) {
        console.warn('⚠️ Validation Error (422)', error.response.data);
      } else if (error.response?.status === 500) {
        console.error('❌ Server Error (500)');
      } else if (!error.response) {
        console.error('❌ Network error:', error.message);
      }
    } else {
      console.error('❌ Unknown error:', error instanceof Error ? error.message : String(error));
    }

    return Promise.reject(error);
  }
);

// ==========================================
// API HELPER METHODS
// ==========================================

/**
 * Generic GET request
 * @template T - The type of the response data
 * @param url - The endpoint URL
 * @param config - Optional Axios request configuration
 * @returns Promise with typed response
 */
export const apiGet = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return apiClient.get<T>(url, config);
};

/**
 * Generic POST request
 * @template T - The type of the response data
 * @param url - The endpoint URL
 * @param data - Request payload
 * @param config - Optional Axios request configuration
 * @returns Promise with typed response
 */
export const apiPost = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return apiClient.post<T>(url, data, config);
};

/**
 * Generic PUT request
 * @template T - The type of the response data
 * @param url - The endpoint URL
 * @param data - Request payload
 * @param config - Optional Axios request configuration
 * @returns Promise with typed response
 */
export const apiPut = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return apiClient.put<T>(url, data, config);
};

/**
 * Generic PATCH request
 * @template T - The type of the response data
 * @param url - The endpoint URL
 * @param data - Request payload
 * @param config - Optional Axios request configuration
 * @returns Promise with typed response
 */
export const apiPatch = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return apiClient.patch<T>(url, data, config);
};

/**
 * Generic DELETE request
 * @template T - The type of the response data
 * @param url - The endpoint URL
 * @param config - Optional Axios request configuration
 * @returns Promise with typed response
 */
export const apiDelete = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return apiClient.delete<T>(url, config);
};

// ==========================================
// EXPORTS
// ==========================================

export default apiClient;

/**
 * Usage Examples:
 * 
 * 1. Direct client usage:
 *    apiClient.get('/users')
 * 
 * 2. Helper methods with proper typing:
 *    interface User {
 *      id: string;
 *      email: string;
 *      name: string;
 *    }
 *    
 *    const response = await apiGet<User>('/users/me');
 *    const user = response.data;
 * 
 * 3. Set token after login:
 *    interface LoginResponse {
 *      token: string;
 *      user: User;
 *    }
 *    
 *    const { data } = await apiPost<LoginResponse>('/auth/login', { 
 *      email, 
 *      password 
 *    });
 *    setAccessToken(data.token);
 * 
 * 4. Clear token on logout:
 *    setAccessToken(null);
 * 
 * 5. Check authentication:
 *    if (isAuthenticated()) { 
 *      // show dashboard 
 *    }
 * 
 * 6. POST with payload:
 *    interface CreateUserPayload {
 *      email: string;
 *      password: string;
 *      name: string;
 *    }
 *    
 *    const payload: CreateUserPayload = { 
 *      email, 
 *      password, 
 *      name 
 *    };
 *    await apiPost<User>('/users', payload);
 * 
 * 7. Error handling:
 *    try {
 *      const response = await apiGet<User>('/users/me');
 *      console.log(response.data);
 *    } catch (error) {
 *      if (error instanceof AxiosError) {
 *        console.error(error.response?.data?.message);
 *      }
 *    }
 */