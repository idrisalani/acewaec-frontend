/**
 * frontend/src/services/questions.service.ts
 * ✅ FIXED VERSION - ESLint no-explicit-any resolved
 * 
 * Fixed issues:
 * - Removed explicit 'any' type from cache
 * - Used proper TypeScript generics
 * - Full type safety throughout
 */

import apiClient from './api';

export interface Question {
  id: string;
  content: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  explanation?: string;
  correctAnswer: string;
  year?: number;
  subject: {
    id: string;
    name: string;
    code: string;
    categories: string[];
  };
  topic?: {
    id: string;
    name: string;
  };
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  label: string;
  content: string;
  isCorrect?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  categories: string[];
  _count?: {
    questions: number;
  };
}

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  _count?: {
    questions: number;
  };
}

export interface RandomQuestionsResponse {
  questions: Question[];
  totalAvailable: number;
}

export interface CheckAnswerResponse {
  isCorrect: boolean;
  explanation?: string;
  correctAnswer: string;
}

/**
 * Generic cache entry type
 * Allows storing any type of data with timestamp
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Questions Service with Request Caching
 * Prevents duplicate API calls for frequently accessed data
 * 
 * Features:
 * - Generic caching with proper TypeScript types
 * - Automatic cache expiration (5 minutes)
 * - Type-safe all operations
 * - No explicit 'any' types
 */
class QuestionsService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all subjects
   * Cached for 5 minutes
   */
  async getSubjects(): Promise<Subject[]> {
    const cacheKey = 'subjects:all';
    const cached = this.getCached<Subject[]>(cacheKey);

    if (cached) {
      console.log('📦 Returning cached subjects');
      return cached;
    }

    console.log('📥 Fetching fresh subjects');
    const response = await apiClient.get<{ data: Subject[] }>(
      '/questions/subjects'
    );
    const subjects = Array.isArray(response.data?.data)
      ? response.data.data
      : [];

    this.setCached(cacheKey, subjects);
    return subjects;
  }

  /**
   * Get topics for a subject
   * Cached individually per subject for 5 minutes
   */
  async getTopics(subjectId: string): Promise<Topic[]> {
    const cacheKey = `topics:${subjectId}`;
    const cached = this.getCached<Topic[]>(cacheKey);

    if (cached) {
      console.log(`📦 Returning cached topics for ${subjectId}`);
      return cached;
    }

    console.log(`📥 Fetching fresh topics for ${subjectId}`);
    const response = await apiClient.get<{ data: Topic[] }>(
      `/questions/subjects/${subjectId}/topics`
    );

    const topics = Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    this.setCached(cacheKey, topics);
    return topics;
  }

  /**
   * Get random questions
   * NOT cached - changes frequently
   */
  async getRandomQuestions(params: {
    count?: number;
    subjectIds?: string[];
    topicIds?: string[];
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    category?: 'SCIENCE' | 'ART' | 'COMMERCIAL';
    excludeIds?: string[];
  }): Promise<RandomQuestionsResponse> {
    const queryParams = new URLSearchParams();

    if (params.count) queryParams.append('count', params.count.toString());
    if (params.difficulty)
      queryParams.append('difficulty', params.difficulty);
    if (params.category) queryParams.append('category', params.category);
    if (params.subjectIds?.length)
      queryParams.append('subjectIds', params.subjectIds.join(','));
    if (params.topicIds?.length)
      queryParams.append('topicIds', params.topicIds.join(','));
    if (params.excludeIds?.length)
      queryParams.append('excludeIds', params.excludeIds.join(','));

    const response = await apiClient.get<{
      data: RandomQuestionsResponse;
    }>(`/questions/random?${queryParams.toString()}`);

    return (
      response.data?.data || { questions: [], totalAvailable: 0 }
    );
  }

  /**
   * Check if answer is correct
   * NOT cached - different each time
   */
  async checkAnswer(
    questionId: string,
    answer: string
  ): Promise<CheckAnswerResponse> {
    const response = await apiClient.post<{
      data: CheckAnswerResponse;
    }>(`/questions/questions/${questionId}/check`, { answer });

    return (
      response.data?.data || {
        isCorrect: false,
        correctAnswer: ''
      }
    );
  }

  /**
   * Get questions with filters
   * NOT cached - filtering changes frequently
   */
  async getQuestions(params: {
    subjectIds?: string[];
    topicIds?: string[];
    difficulty?: string;
    limit?: number;
  }): Promise<Question[]> {
    const queryParams = new URLSearchParams();

    if (params.subjectIds?.length)
      queryParams.append('subjectIds', params.subjectIds.join(','));
    if (params.topicIds?.length)
      queryParams.append('topicIds', params.topicIds.join(','));
    if (params.difficulty)
      queryParams.append('difficulty', params.difficulty);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<{ data: Question[] }>(
      `/questions/questions?${queryParams.toString()}`
    );

    return Array.isArray(response.data?.data) ? response.data.data : [];
  }

  /**
   * Clear cache for a specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      console.log(`🗑️ Cleared cache for ${key}`);
    } else {
      this.cache.clear();
      console.log('🗑️ Cleared all cache');
    }
  }

  /**
   * Get cache statistics (useful for debugging)
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Private helper: Get cached data if not expired
   * Uses generic type parameter for type safety
   */
  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    // Type-safe cast using generic parameter
    return entry.data as T;
  }

  /**
   * Private helper: Set cache
   * Uses generic type parameter for type safety
   */
  private setCached<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
export const questionsService = new QuestionsService();

export default questionsService;