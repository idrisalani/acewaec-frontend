// frontend/src/pages/practice/PracticeSetup.tsx
// ✅ FINAL RECONCILED VERSION - Production Ready
// Combines best practices from both versions with all fixes applied

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

/**
 * PracticeSetup Component - FINAL RECONCILED VERSION
 * 
 * ✅ ALL ISSUES FIXED:
 * 1. ✅ Topics loading duplicate - Removed redundant useEffect
 * 2. ✅ Navigation to practice interface - Fixed error handling and routing
 * 3. ✅ Subject duplication - Cleaned up rendering logic
 * 4. ✅ Dependency arrays - All properly optimized
 * 5. ✅ Error handling - Comprehensive HTTP error messages
 * 6. ✅ Loading states - Proper async handling
 * 
 * KEY IMPROVEMENTS:
 * - Single source of truth for subject data
 * - Proper cleanup and dependency management
 * - Better error messages for debugging
 * - Fixed API endpoint selection
 * - Direct localStorage handling (no external dependencies)
 * - Robust session ID extraction (handles 3 response formats)
 * - Better type safety throughout
 */
export default function PracticeSetup() {
  const navigate = useNavigate();

  // ==================== State Management ====================

  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [totalAvailableQuestions, setTotalAvailableQuestions] = useState(0);
  const [userCategory, setUserCategory] = useState<string>('');
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
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

  // ==================== Memoized Computations ====================

  /**
   * ✅ MEMOIZED: Calculate available questions based on selections
   * Prevents unnecessary recalculations and re-renders
   */
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

  /**
   * ✅ MEMOIZED: Get selected subject for display
   */
  const selectedSubject = useMemo(() => {
    return subjects.find(s => config.subjectIds.includes(s.id));
  }, [config.subjectIds, subjects]);

  // ==================== Effects ====================

  /**
   * ✅ EFFECT 1: Load user profile ONCE on component mount
   * This effect runs only once (empty dependency array)
   */
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        console.log('👤 Loading user profile...');
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log('✅ User loaded:', user.email);

          if (user?.studentCategory) {
            setUserCategory(user.studentCategory);
            setConfig(prev => ({
              ...prev,
              category: user.studentCategory
            }));
            console.log('✅ User category set to:', user.studentCategory);
          }
        }
      } catch (err) {
        console.error('❌ Failed to load user profile:', err);
        // Don't set error state here - allow app to continue
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserProfile();
  }, []); // ✅ FIXED: Empty dependency array - runs only once on mount

  /**
   * ✅ EFFECT 2: Load all subjects ONCE on component mount
   * This effect runs only once (empty dependency array)
   */
  useEffect(() => {
    const loadAllSubjects = async () => {
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
        setError('Failed to load subjects. Please try again.');
      }
    };

    loadAllSubjects();
  }, []); // ✅ FIXED: Empty dependency array - runs only once on mount

  /**
   * ✅ EFFECT 3: Handle category changes
   * Runs when category selection changes to filter subjects by category
   */
  useEffect(() => {
    const handleCategoryChange = async () => {
      if (!config.category) {
        console.log('📋 No category selected, showing all subjects');
        setSubjects(allSubjects);
        return;
      }

      try {
        console.log('🔍 Fetching subjects for category:', config.category);
        const data = await practiceService.getSubjects(config.category);
        console.log(`✅ Category "${config.category}" loaded: ${data.length} subjects`);
        setSubjects(data);

        const total = data.reduce((sum: number, subject: Subject) =>
          sum + (subject.questionCount || subject._count?.questions || 0), 0
        );

        setTotalAvailableQuestions(total);

        // Reset selections when category changes
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
  }, [config.category, allSubjects]); // ✅ FIXED: Proper dependencies

  /**
   * ✅ EFFECT 4: Load topics for selected subject
   * IMPORTANT: This should only run ONCE per subject selection
   * DO NOT add other dependencies - prevents duplicate loading
   */
  useEffect(() => {
    const loadTopicsForSubject = async () => {
      // Reset topics if no subject selected
      if (!config.subjectIds.length) {
        console.log('📖 No subject selected, clearing topics');
        setTopics([]);
        return;
      }

      // Get the first (and only) selected subject
      const subjectId = config.subjectIds[0];

      try {
        console.log(`📖 Loading topics for subject ID: ${subjectId}`);
        const topicsData = await practiceService.getTopics(subjectId);

        // ✅ NEW: Deduplicate topics in case backend returns duplicates
        const uniqueTopics = Array.from(
          new Map(topicsData.map(t => [t.id, t])).values()
        );

        // Log deduplication result if there were duplicates
        if (uniqueTopics.length < topicsData.length) {
          console.warn(
            `⚠️ Backend returned duplicate topics! ` +
            `Removed ${topicsData.length - uniqueTopics.length} duplicates. ` +
            `${topicsData.length} → ${uniqueTopics.length}`
          );
        }

        console.log(`✅ Loaded ${uniqueTopics.length} unique topics for subject`);
        setTopics(uniqueTopics);
      } catch (err) {
        console.error('❌ Failed to load topics:', err);
        setError('Failed to load topics');
        setTopics([]);
      }
    };

    loadTopicsForSubject();
  }, [config.subjectIds]); // ✅ FIXED: Only depends on subjectIds - prevents duplication

  /**
   * ✅ EFFECT 5: Adjust question count when available questions change
   * Ensures question count doesn't exceed available questions
   */
  useEffect(() => {
    const available = getAvailableQuestions();
    if (available > 0 && config.questionCount > available) {
      setConfig(prev => ({ ...prev, questionCount: Math.min(available, 50) }));
    }
  }, [config.questionCount, getAvailableQuestions]);

  // ==================== Handler Functions ====================

  const toggleSubject = (subjectId: string) => {
    console.log('🔄 Subject toggled:', subjectId);
    setConfig(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [subjectId], // Single selection only
      topicIds: [] // Reset topics when subject changes
    }));
  };

  const toggleTopic = (topicId: string) => {
    console.log('🏷️ Topic toggled:', topicId);
    setConfig(prev => ({
      ...prev,
      topicIds: prev.topicIds.includes(topicId)
        ? prev.topicIds.filter(id => id !== topicId)
        : [...prev.topicIds, topicId]
    }));
  };

  /**
   * ✅ CRITICAL FIX: Proper form submission with robust error handling
   * Handles all response formats and provides good error messages
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (config.subjectIds.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🚀 Starting practice session with config:', config);

      // ✅ CRITICAL: Correct payload structure
      const sessionPayload = {
        subjectIds: config.subjectIds,
        topicIds: config.topicIds.length > 0 ? config.topicIds : undefined,
        questionCount: config.questionCount,
        duration: config.hasDuration ? config.duration : undefined,
        difficulty: config.difficulty || undefined,
        type: config.hasDuration ? 'TIMED' : 'UNTIMED', // Dynamic based on hasDuration
      };

      console.log('📤 Sending to backend:', sessionPayload);

      // ✅ CRITICAL: Call backend to create session
      const response = await practiceService.startSession(sessionPayload);

      console.log('✅ Session created successfully:', response);

      // ✅ CRITICAL: Extract session ID with robust fallback chain
      // Handles multiple response formats from backend
      const sessionId = response.session?.id || response.sessionId || response.id;

      if (!sessionId) {
        console.error('❌ No session ID in response:', response);
        throw new Error('No session ID returned from server');
      }

      console.log('📍 Session ID:', sessionId);

      // ✅ CRITICAL: Cache session data locally for recovery
      localStorage.setItem('practiceSessionData', JSON.stringify({
        sessionId,
        config,
        timestamp: new Date().toISOString()
      }));

      // ✅ CRITICAL: Navigate to practice interface with correct path
      console.log('🔀 Navigating to practice interface...');
      navigate(`/practice/interface/${sessionId}`, { replace: true });

    } catch (err) {
      console.error('❌ Error starting session:', err);

      // ✅ CRITICAL: Comprehensive error message extraction
      let errorMessage = 'Failed to start practice session';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const axiosError = err as {
          response?: { data?: { error?: string; message?: string }; status?: number };
          message?: string;
        };

        if (axiosError.response?.status === 500) {
          errorMessage = 'Backend error. Please try again later.';
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }

      console.error('📋 Error details:', errorMessage);
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // ==================== JSX Render ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
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

      {/* Main Content */}
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
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <BookOpen className="text-indigo-600" size={28} />
                  Setup Practice Session
                </h2>

                {/* Error Alert */}
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
                    // Auto-filled category view
                    <>
                      {/* STEP 1: Selected Category */}
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

                      {/* STEP 2: Select Subject */}
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
                            <p className="text-sm">No subjects available for {userCategory}. Loading...</p>
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
                                onClick={() => toggleSubject(subject.id)}
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

                      {/* STEP 3: Question Count & Duration */}
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

                      {/* STEP 4: Topics (Optional) */}
                      {topics.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 sm:gap-3 mb-4">
                            <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              4
                            </div>
                            <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                              <TrendingUp className="text-indigo-600" size={20} />
                              Select Topics (Optional)
                            </label>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {topics.map(topic => (
                              <button
                                key={topic.id}
                                type="button"
                                className={`p-3 border-2 rounded-xl transition-all text-left ${config.topicIds.includes(topic.id)
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-300'
                                  }`}
                                onClick={() => toggleTopic(topic.id)}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="text-sm font-medium">{topic.name}</div>
                                  {config.topicIds.includes(topic.id) && (
                                    <CheckCircle className="text-indigo-600" size={16} />
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {topic._count?.questions || 0} questions
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* STEP 5: Difficulty */}
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

                      {/* Submit Button */}
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
                    // Category selection view
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

            {/* Summary Panel */}
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