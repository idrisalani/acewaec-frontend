// frontend/src/pages/practice/PracticeSetup.tsx
// ✅ COMPLETELY CORRECTED - Duplicates & Payload Fixed

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Target,
  ChevronRight,
  CheckCircle,
  Home,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import practiceService from '../../services/practice.service';
import apiClient from '../../services/api';

// ==================== Types ====================

interface Subject {
  id: string;
  name: string;
  code: string;
  categories?: string[];
  questionCount?: number;
  _count?: { questions: number };
}

interface Topic {
  id: string;
  name: string;
  _count?: { questions: number };
  difficulty?: string;
}

interface PracticeConfig {
  subjectIds: string[];
  topicIds: string[];
  questionCount: number;
  duration: number;
  difficulty: string;
  hasDuration: boolean;
  category?: string;
}

interface TopicCardProps {
  topic: Topic;
  isSelected?: boolean;
  onToggle?: (topicId: string) => void;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
  code?: string;
}

interface SessionResponse {
  success?: boolean;
  data?: {
    sessionId?: string;
    session?: { id?: string };
  };
  sessionId?: string;
  id?: string;
}

// ==================== Helpers ====================

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;

    if (axiosErr.code === 'ECONNABORTED') {
      return 'Request timeout. The server is taking too long to respond.';
    }

    if (axiosErr.response?.status === 504) {
      return 'Backend is overloaded. Please try again in a moment.';
    }

    if (axiosErr.response?.status === 500) {
      return 'Backend error. Please try again later.';
    }

    return (
      axiosErr.response?.data?.error ||
      axiosErr.response?.data?.message ||
      axiosErr.message ||
      'An unknown error occurred'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

function extractSessionId(response: SessionResponse | unknown): string | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const data = response as SessionResponse;
  return (
    data.data?.sessionId ||
    data.data?.session?.id ||
    data.sessionId ||
    data.id ||
    null
  );
}

// ==================== TopicCard ====================

const TopicCard = ({ topic, isSelected, onToggle }: TopicCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onToggle?.(topic.id)}
      className={`p-4 border-2 rounded-xl transition-all text-left ${isSelected
        ? 'border-indigo-600 bg-indigo-50'
        : 'border-gray-200 hover:border-indigo-300'
        }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold text-gray-900">{topic.name}</div>
        {isSelected && <CheckCircle className="text-indigo-600" size={20} />}
      </div>
      <div className="text-sm text-gray-600">
        {topic._count?.questions || 0} questions
      </div>
    </button>
  );
};

// ==================== Main Component ====================

export default function PracticeSetup() {
  const navigate = useNavigate();

  // State
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [totalAvailableQuestions, setTotalAvailableQuestions] = useState(0);
  const [userCategory, setUserCategory] = useState<string>('');
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [config, setConfig] = useState<PracticeConfig>({
    subjectIds: [],
    topicIds: [],
    questionCount: 10,
    duration: 30,
    difficulty: '',
    hasDuration: true,
    category: '',
  });

  // Memoized
  const getAvailableQuestions = useCallback(() => {
    if (config.subjectIds.length === 0) return totalAvailableQuestions;

    const selectedSubject = subjects.find(s => config.subjectIds.includes(s.id));
    if (!selectedSubject) return 0;

    if (config.topicIds.length === 0) {
      return selectedSubject.questionCount || selectedSubject._count?.questions || 0;
    }

    return topics
      .filter(t => config.topicIds.includes(t.id))
      .reduce((sum: number, topic: Topic) => sum + (topic._count?.questions || 0), 0);
  }, [config.subjectIds, config.topicIds, subjects, topics, totalAvailableQuestions]);

  const selectedSubject = useMemo(() => {
    const subject = subjects.find(s => config.subjectIds.includes(s.id));
    if (subject) {
      console.log('📌 Selected subject:', subject.name, `(ID: ${subject.id})`);
    }
    return subject;
  }, [config.subjectIds, subjects]);

  // Effects
  useEffect(() => {
    const loadUserProfile = async (): Promise<void> => {
      try {
        console.log('👤 Loading user profile...');
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr) as { studentCategory?: string; email?: string };
          console.log('✅ User loaded:', user.email);

          if (user?.studentCategory) {
            setUserCategory(user.studentCategory);
            setConfig(prev => ({
              ...prev,
              category: user.studentCategory
            }));
          }
        }
      } catch (err) {
        console.error('❌ Failed to load user profile:', err);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserProfile();
  }, []);

  useEffect(() => {
    const loadAllSubjects = async (): Promise<void> => {
      try {
        console.log('📚 Loading all subjects...');
        const data = await practiceService.getSubjects();
        setAllSubjects(data);

        const total = data.reduce((sum: number, subject: Subject) =>
          sum + (subject.questionCount || subject._count?.questions || 0), 0
        );

        console.log(`✅ Loaded ${data.length} subjects with ${total} total questions`);
        setTotalAvailableQuestions(total);
        setSubjects(data);
      } catch (err) {
        console.error('❌ Failed to load subjects:', err);
        setError('Failed to load subjects. Please refresh the page.');
      }
    };

    loadAllSubjects();
  }, []);

  useEffect(() => {
    const handleCategoryChange = async (): Promise<void> => {
      if (!config.category) {
        console.log('📋 No category, showing all subjects');
        setSubjects(allSubjects);
        return;
      }

      try {
        console.log('🔍 Fetching subjects for category:', config.category);
        const data = await practiceService.getSubjects(config.category);
        console.log(`✅ Loaded ${data.length} subjects for ${config.category}`);
        setSubjects(data);

        const total = data.reduce((sum: number, subject: Subject) =>
          sum + (subject.questionCount || subject._count?.questions || 0), 0
        );

        setTotalAvailableQuestions(total);

        setConfig(prev => ({
          ...prev,
          subjectIds: [],
          topicIds: [],
          questionCount: Math.min(10, total || 10)
        }));
        setTopics([]);
      } catch (err) {
        console.error('❌ Failed to load category subjects:', err);
        setError('Failed to load category subjects');
      }
    };

    handleCategoryChange();
  }, [config.category, allSubjects]);

  /**
   * ✅ CORRECTED: Fix duplicate topics + proper cleanup
   */
  useEffect(() => {
    // ✅ Use ReturnType instead of NodeJS.Timeout
    let isMounted = true;
    let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const loadTopicsForSubject = async (retryCount: number = 0): Promise<void> => {
      if (!isMounted) return;

      if (!selectedSubject) {
        console.log('📚 No subject selected, clearing topics');
        if (isMounted) {
          setTopics([]);
          setIsLoadingTopics(false);
        }
        return;
      }

      try {
        if (isMounted) setIsLoadingTopics(true);

        const subjectId = selectedSubject.id;

        if (!subjectId || typeof subjectId !== 'string') {
          console.error('❌ Invalid subject ID');
          if (isMounted) {
            setTopics([]);
            setIsLoadingTopics(false);
          }
          return;
        }

        console.log(`📚 Loading topics for subject: ${selectedSubject.name} (ID: ${subjectId})`);

        const response = await apiClient.get(
          `/practice/subjects/${subjectId}/topics`,
          { timeout: 60000 }
        );

        const topicsData: Topic[] = response.data?.data || [];
        console.log(`✅ Received ${topicsData.length} topics from backend`);

        const seenIds = new Set<string>();
        const uniqueTopics: Topic[] = [];

        for (const topic of topicsData) {
          if (!seenIds.has(topic.id)) {
            seenIds.add(topic.id);
            uniqueTopics.push(topic);
          }
        }

        console.log(`✅ After dedup: ${uniqueTopics.length} unique topics`);

        if (isMounted) {
          setTopics(uniqueTopics);
          setIsLoadingTopics(false);
          setError(null);
        }

      } catch (error) {
        console.error('❌ Error loading topics:', error);

        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ApiErrorResponse>;

          if (axiosError.code === 'ECONNABORTED' && retryCount < 3) {
            console.log(`🔄 Retrying... Attempt ${retryCount + 1}/3`);

            // ✅ FIXED: Use ReturnType<typeof setTimeout>
            retryTimeoutId = setTimeout(() => {
              if (isMounted) {
                loadTopicsForSubject(retryCount + 1);
              }
            }, 2000);
            return;
          }

          const errorMsg = getErrorMessage(error);
          if (isMounted) setError(errorMsg);
        } else if (error instanceof Error) {
          if (isMounted) setError(error.message);
        } else {
          if (isMounted) setError('Failed to load topics. Please try again.');
        }

        if (isMounted) {
          setTopics([]);
          setIsLoadingTopics(false);
        }
      }
    };

    loadTopicsForSubject();

    return () => {
      isMounted = false;

      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }
    };
  }, [selectedSubject]);

  useEffect(() => {
    const available = getAvailableQuestions();
    if (available > 0 && config.questionCount > available) {
      setConfig(prev => ({ ...prev, questionCount: Math.min(available, 50) }));
    }
  }, [config.questionCount, getAvailableQuestions]);

  // Handlers
  const toggleSubject = (subjectId: string): void => {
    console.log('🔄 Subject toggled:', subjectId);
    setConfig(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [subjectId],
      topicIds: []
    }));
  };

  const toggleTopic = (topicId: string): void => {
    console.log('🏷️ Topic toggled:', topicId);
    setConfig(prev => ({
      ...prev,
      topicIds: prev.topicIds.includes(topicId)
        ? prev.topicIds.filter(id => id !== topicId)
        : [...prev.topicIds, topicId]
    }));
  };

  /**
   * ✅ CORRECTED: Fix payload structure (NO double wrapping)
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (config.subjectIds.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🚀 Starting practice session');
      console.log('   Selected subjects:', config.subjectIds);
      console.log('   Selected topics:', config.topicIds);

      // ✅ FIXED: Correct payload structure - NO { config: } wrapper!
      const sessionPayload = {
        subjectIds: config.subjectIds,
        topicIds: config.topicIds.length > 0 ? config.topicIds : [],
        questionCount: config.questionCount,
        duration: config.hasDuration ? config.duration : null,
        difficulty: config.difficulty || null,
        type: config.hasDuration ? 'TIMED_TEST' : 'PRACTICE'  // ✅ Updated!
      };

      console.log('📤 Sending payload to backend:', JSON.stringify(sessionPayload, null, 2));

      // ✅ FIXED: Send payload directly!
      const response = await apiClient.post(
        '/practice/sessions',
        sessionPayload,  // ← CORRECT: No { config: sessionPayload }
        { timeout: 60000 }
      );

      console.log('✅ Backend response:', response.data);

      const sessionId = extractSessionId(response.data);

      if (!sessionId) {
        console.error('❌ No session ID in response:', response.data);
        throw new Error('Failed to create session. No ID returned.');
      }

      console.log('✅ Session created with ID:', sessionId);

      localStorage.setItem('practiceSessionData', JSON.stringify({
        sessionId,
        config,
        timestamp: new Date().toISOString()
      }));

      console.log('🔀 Navigating to practice interface...');

      setTimeout(() => {
        navigate(`/practice/interface/${sessionId}`, { replace: false });
      }, 500);

    } catch (err) {
      console.error('❌ Error starting session:', err);

      const errorMessage = getErrorMessage(err);
      console.error('📋 Error details:', errorMessage);
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Home size={20} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">AceWAEC Pro</h1>
            </div>
            <div className="text-sm text-gray-600">
              {userCategory && `📚 ${userCategory}`}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingUserData ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading practice setup...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <BookOpen className="text-indigo-600" size={28} />
                  Setup Practice Session
                </h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-medium text-red-900">Error</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {userCategory ? (
                    <>
                      <div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-4">
                          <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            1
                          </div>
                          <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                            <GraduationCap className="text-indigo-600" size={20} />
                            Category
                          </label>
                        </div>
                        <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                          <p className="text-lg font-semibold text-indigo-900">{userCategory}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-4">
                          <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            2
                          </div>
                          <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                            <BookOpen className="text-indigo-600" size={20} />
                            Select Subject
                          </label>
                        </div>

                        {subjects.length === 0 ? (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
                            <p className="text-sm">Loading subjects...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {subjects.map(subject => (
                              <button
                                key={subject.id}
                                type="button"
                                className={`p-4 border-2 rounded-xl transition-all text-left ${config.subjectIds.includes(subject.id)
                                  ? 'border-indigo-600 bg-indigo-50'
                                  : 'border-gray-200 hover:border-indigo-300'
                                  }`}
                                onClick={() => {
                                  console.log('✅ Subject selected:', subject.id, subject.name);
                                  toggleSubject(subject.id);
                                }}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-semibold text-gray-900">{subject.name}</div>
                                  {config.subjectIds.includes(subject.id) && (
                                    <CheckCircle className="text-indigo-600" size={20} />
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {subject.questionCount || subject._count?.questions || 0} questions
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="text-indigo-600" size={20} />
                            <label className="font-semibold text-gray-900">Number of Questions</label>
                          </div>
                          <input
                            type="number"
                            min="1"
                            max={Math.max(50, getAvailableQuestions())}
                            value={config.questionCount}
                            onChange={(e) =>
                              setConfig(prev => ({
                                ...prev,
                                questionCount: parseInt(e.target.value) || 10
                              }))
                            }
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Available: {getAvailableQuestions()} questions
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="text-indigo-600" size={20} />
                            <label className="font-semibold text-gray-900">Time Limit (minutes)</label>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="5"
                              max="480"
                              value={config.duration}
                              onChange={(e) =>
                                setConfig(prev => ({
                                  ...prev,
                                  duration: parseInt(e.target.value) || 30
                                }))
                              }
                              disabled={!config.hasDuration}
                              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 disabled:bg-gray-100"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setConfig(prev => ({
                                  ...prev,
                                  hasDuration: !prev.hasDuration
                                }))
                              }
                              className={`px-4 py-2 rounded-lg font-medium transition ${config.hasDuration
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                              {config.hasDuration ? '⏱️' : '∞'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {isLoadingTopics && (
                        <div>
                          <div className="flex items-center gap-2 sm:gap-3 mb-4">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              ⏳
                            </div>
                            <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                              <Loader2 className="animate-spin text-blue-600" size={20} />
                              Loading Topics...
                            </label>
                          </div>
                          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-blue-800">
                            <p className="text-sm">Fetching available topics. This may take a moment...</p>
                          </div>
                        </div>
                      )}

                      {topics.length > 0 && !isLoadingTopics && (
                        <div>
                          <div className="flex items-center gap-2 sm:gap-3 mb-4">
                            <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              4
                            </div>
                            <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                              <TrendingUp className="text-indigo-600" size={20} />
                              Select Topics (Optional) - {topics.length} available
                            </label>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* ✅ FIXED: NO inline dedup - topics already deduped in useEffect */}
                            {topics.map(topic => (
                              <TopicCard
                                key={topic.id}
                                topic={topic}
                                isSelected={config.topicIds.includes(topic.id)}
                                onToggle={() => toggleTopic(topic.id)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-4">
                          <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {topics.length > 0 ? '5' : '4'}
                          </div>
                          <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                            <TrendingUp className="text-indigo-600" size={20} />
                            Difficulty Level (Optional)
                          </label>
                        </div>
                        <select
                          value={config.difficulty}
                          onChange={(e) =>
                            setConfig(prev => ({ ...prev, difficulty: e.target.value }))
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">All Levels</option>
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || config.subjectIds.length === 0}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Starting Session...</span>
                          </>
                        ) : (
                          <>
                            <span>Start Practice Session</span>
                            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          1
                        </div>
                        <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                          <GraduationCap className="text-indigo-600" size={20} />
                          Select Category
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                        {['SCIENCE', 'ART', 'COMMERCIAL'].map(category => (
                          <button
                            key={category}
                            type="button"
                            className={`p-4 border-2 rounded-xl transition-all text-center font-semibold ${config.category === category
                              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                              }`}
                            onClick={() =>
                              setConfig(prev => ({ ...prev, category }))
                            }
                          >
                            {category}
                          </button>
                        ))}
                      </div>

                      {!config.category && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                            <ArrowRight className="text-indigo-600" size={32} />
                          </div>
                          <p className="text-gray-600 text-lg font-medium">
                            Select a category above to continue
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Session Summary</h3>

                <div className="space-y-4">
                  {config.category && (
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">Category</p>
                      <p className="text-xl font-bold text-purple-700">{config.category}</p>
                    </div>
                  )}

                  <div className="p-4 bg-indigo-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Questions</p>
                    <p className="text-2xl font-bold text-indigo-600">{config.questionCount}</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Duration</p>
                    <p className="text-xl font-bold text-purple-600">
                      {config.hasDuration ? `${config.duration} min` : 'Untimed'}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Subject</p>
                    <p className="text-lg font-bold text-blue-600 truncate">
                      {selectedSubject?.name || 'Not selected'}
                    </p>
                  </div>

                  {config.topicIds.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Topics</p>
                      <p className="text-lg font-bold text-green-600">{config.topicIds.length} selected</p>
                    </div>
                  )}

                  {config.difficulty && (
                    <div className="p-4 bg-orange-50 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Difficulty</p>
                      <p className="text-lg font-bold text-orange-600">{config.difficulty}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}