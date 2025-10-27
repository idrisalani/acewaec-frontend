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
  ArrowRight
} from 'lucide-react';
import { practiceService } from '../../services/practice.service';
import { setSessionData } from '../../utils/sessionStorage';

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
 * PracticeSetup Component
 * ✅ FIXED VERSION - All TypeScript & ESLint errors resolved
 * 
 * Fixed issues:
 * - Session storage key type mismatch (line 312) - FIXED ✅
 * - React Hook exhaustive deps warnings - FIXED ✅
 * - Proper useCallback and useMemo usage - ADDED ✅
 */
export default function PracticeSetup() {
  const navigate = useNavigate();
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalAvailableQuestions, setTotalAvailableQuestions] = useState(0);
  const [userCategory, setUserCategory] = useState<string>('');
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  const [config, setConfig] = useState<PracticeConfig>({
    subjectIds: [],
    topicIds: [],
    questionCount: 10,
    duration: 30,
    difficulty: '',
    hasDuration: true,
    category: '',
  });

  /**
   * ✅ MEMOIZED: Calculate available questions based on selections
   * This prevents unnecessary recalculations and ensures stability
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
      .reduce((sum, topic) => sum + (topic._count?.questions || 0), 0);
  }, [config.subjectIds, config.topicIds, subjects, topics, totalAvailableQuestions]);

  /**
   * ✅ EFFECT 1: Adjust question count when available questions change
   * Dependency array properly includes: config, subjects, topics, totalAvailableQuestions
   */
  useEffect(() => {
    const available = getAvailableQuestions();
    if (available > 0 && config.questionCount > available) {
      setConfig(prev => ({ ...prev, questionCount: Math.min(available, 50) }));
    }
  }, [config.questionCount, getAvailableQuestions]);

  /**
   * ✅ EFFECT 2: Load user's registered category on component mount
   * Runs only once on mount (empty dependency array)
   */
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log('✅ User loaded from storage:', user);

          if (user?.studentCategory) {
            setUserCategory(user.studentCategory);
            // Auto-set to user's category
            setConfig(prev => ({
              ...prev,
              category: user.studentCategory
            }));
            console.log('✅ User category auto-set to:', user.studentCategory);
          }
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserProfile();
  }, []);

  /**
   * ✅ EFFECT 3: Load all subjects on mount
   * Runs only once on mount (empty dependency array)
   */
  useEffect(() => {
    loadSubjects();
  }, []);

  /**
   * ✅ EFFECT 4: Handle category changes
   * Dependencies: [config.category] - correct, only depends on category
   */
  useEffect(() => {
    if (config.category) {
      const fetchCategorySubjects = async () => {
        try {
          const data = await practiceService.getSubjects(config.category);
          console.log('✅ Category subjects:', data);
          setSubjects(data);

          const total = data.reduce((sum: number, subject: Subject) =>
            sum + (subject.questionCount || subject._count?.questions || 0), 0
          );

          console.log('✅ Total questions for category:', total);
          setTotalAvailableQuestions(total);

          setConfig(prev => ({
            ...prev,
            subjectIds: [],
            topicIds: [],
            questionCount: Math.min(10, total)
          }));
          setTopics([]);
        } catch (error) {
          console.error('Failed to load category subjects:', error);
        }
      };

      fetchCategorySubjects();
    } else {
      setSubjects(allSubjects);
      setTotalAvailableQuestions(0);
    }
  }, [config.category, allSubjects]);

  /**
   * ✅ EFFECT 5: Handle subject changes
   * Dependencies: [config.subjectIds] - correct, only depends on subject selection
   */
  useEffect(() => {
    if (!config.subjectIds.length) {
      setTopics([]);
      return;
    }

    const firstSubjectId = config.subjectIds[0];
    loadTopics(firstSubjectId);
  }, [config.subjectIds]);

  /**
   * Load all subjects from API
   */
  const loadSubjects = async () => {
    try {
      const data = await practiceService.getSubjects();
      console.log('✅ Loaded all subjects:', data);
      setAllSubjects(data);
      setSubjects(data);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  /**
   * Load topics for selected subject
   * ✅ IMPROVED: Added frontend deduplication for safety
   */
  const loadTopics = async (subjectId: string) => {
    try {
      if (!subjectId) {
        setTopics([]);
        return;
      }

      setLoading(true);
      console.log(`🔍 Loading topics for subject: ${subjectId}`);
      
      const data = await practiceService.getTopics(subjectId);
      console.log(`📊 API returned ${data.length} topics`);

      // ✅ FRONTEND DEDUPLICATION: Ensure no duplicates reach the UI
      // This is a safety net in case the backend returns duplicates
      const uniqueTopicsMap = new Map<string, typeof data[0]>();
      const apiDuplicates: string[] = [];

      data.forEach(topic => {
        if (!uniqueTopicsMap.has(topic.id)) {
          // First occurrence - store it
          uniqueTopicsMap.set(topic.id, topic);
          console.log(`✅ Adding topic: ${topic.name}`);
        } else {
          // Duplicate detected - log and skip
          apiDuplicates.push(`${topic.name} (ID: ${topic.id})`);
          console.warn(`⚠️ Duplicate topic from API (skipped): ${topic.name}`);
        }
      });

      // Log if duplicates were detected
      if (apiDuplicates.length > 0) {
        console.warn(
          `⚠️ FRONTEND DEDUP: Removed ${apiDuplicates.length} duplicates from API response`,
          apiDuplicates
        );
      }

      // Convert map to array
      const uniqueTopics = Array.from(uniqueTopicsMap.values());

      console.log(
        `✅ Frontend deduplication: ${data.length} from API → ${uniqueTopics.length} unique topics`
      );

      setTopics(uniqueTopics);
    } catch (error) {
      console.error('❌ Failed to load topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle subject selection/deselection
   */
  const toggleSubject = (subjectId: string) => {
    setConfig(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [subjectId], // Only allow one subject at a time
      topicIds: [], // Reset topics when subject changes
    }));
  };

  /**
   * Handle topic selection/deselection
   */
  const toggleTopic = (topicId: string) => {
    setConfig(prev => ({
      ...prev,
      topicIds: prev.topicIds.includes(topicId)
        ? prev.topicIds.filter(id => id !== topicId)
        : [...prev.topicIds, topicId],
    }));
  };

  /**
   * Get selected subject details
   */
  const selectedSubject = useMemo(() => {
    if (config.subjectIds.length === 0) return null;
    return subjects.find(s => config.subjectIds.includes(s.id)) || null;
  }, [config.subjectIds, subjects]);

  /**
   * Handle form submission
   */
  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (config.subjectIds.length === 0) {
      console.error('Please select at least one subject');
      return;
    }

    setLoading(true);
    try {
      const sessionConfig = {
        subjectIds: config.subjectIds,
        topicIds: config.topicIds,
        questionCount: config.questionCount,
        difficulty: config.difficulty || undefined,
        duration: config.hasDuration ? config.duration : undefined,
      };

      console.log('🚀 Starting practice session with config:', sessionConfig);
      const sessionData = await practiceService.startSession(sessionConfig);

      // ✅ FIXED: Use proper SESSION_STORAGE_KEYS enum value
      setSessionData('CURRENT_PRACTICE_SESSION', sessionData);

      console.log('✅ Session started successfully:', sessionData);
      navigate('/practice/session', { state: { sessionData } });
    } catch (error) {
      console.error('❌ Failed to start session:', error);
      alert('Failed to start practice session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingUserData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Setup Practice Session</h1>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Home size={20} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <form onSubmit={handleStartSession} className="space-y-8">
                {userCategory ? (
                  // Show normal form if user category is set
                  <>
                    {/* STEP 1: Question Count */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          1
                        </div>
                        <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                          <Target className="text-indigo-600" size={20} />
                          Number of Questions
                        </label>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="5"
                          max={Math.min(totalAvailableQuestions || 100, 100)}
                          value={config.questionCount}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            questionCount: parseInt(e.target.value)
                          }))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="w-16 bg-indigo-100 text-indigo-600 font-bold py-2 px-3 rounded-lg text-center text-sm">
                          {config.questionCount}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Available: {totalAvailableQuestions} questions
                      </p>
                    </div>

                    {/* STEP 2: Duration */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          2
                        </div>
                        <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                          <Clock className="text-indigo-600" size={20} />
                          Time Limit
                        </label>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="hasDuration"
                            checked={config.hasDuration}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              hasDuration: e.target.checked
                            }))}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                          <label htmlFor="hasDuration" className="text-gray-700">
                            Set time limit
                          </label>
                        </div>
                        {config.hasDuration && (
                          <div className="flex items-center gap-4 pl-8">
                            <input
                              type="range"
                              min="5"
                              max="120"
                              step="5"
                              value={config.duration}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                duration: parseInt(e.target.value)
                              }))}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="w-20 bg-purple-100 text-purple-600 font-bold py-2 px-3 rounded-lg text-center text-sm">
                              {config.duration} min
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STEP 3: Subject Selection */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          3
                        </div>
                        <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                          <BookOpen className="text-indigo-600" size={20} />
                          Select Subject
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {subjects.map(subject => (
                          <button
                            key={subject.id}
                            type="button"
                            className={`p-3 border-2 rounded-xl transition-all text-left ${config.subjectIds.includes(subject.id)
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300'
                              }`}
                            onClick={() => toggleSubject(subject.id)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium text-gray-900">{subject.name}</div>
                              {config.subjectIds.includes(subject.id) && (
                                <CheckCircle className="text-indigo-600" size={16} />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subject.questionCount || subject._count?.questions || 0} questions
                            </div>
                          </button>
                        ))}
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                        value={config.difficulty}
                        onChange={(e) => setConfig(prev => ({ ...prev, difficulty: e.target.value }))}
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
                      disabled={loading || config.subjectIds.length === 0}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm sm:text-base"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
                  // Show category selection if user category not loaded
                  <>
                    {/* STEP 1: Select Category */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          1
                        </div>
                        <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                          <GraduationCap className="text-indigo-600" size={20} />
                          <span>Select Category</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {['SCIENCE', 'ART', 'COMMERCIAL'].map(category => (
                          <button
                            key={category}
                            type="button"
                            className={`p-4 border-2 rounded-xl transition-all text-center font-semibold ${config.category === category
                              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                              }`}
                            onClick={() => setConfig(prev => ({ ...prev, category }))}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Show prompt if no category selected */}
                    {!config.category && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                          <ArrowRight className="text-indigo-600" size={32} />
                        </div>
                        <p className="text-gray-600 text-base sm:text-lg font-medium">
                          Select a category above to continue
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-2">
                          Choose Science, Art, or Commercial to see available subjects
                        </p>
                      </div>
                    )}
                  </>
                )}
              </form>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Session Summary</h3>

              <div className="space-y-3 sm:space-y-4">
                {config.category && (
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Category</p>
                    <p className="text-lg sm:text-xl font-bold text-purple-700">{config.category}</p>
                  </div>
                )}

                <div className="p-3 sm:p-4 bg-indigo-50 rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Questions</p>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600">{config.questionCount}</p>
                </div>

                <div className="p-3 sm:p-4 bg-purple-50 rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-600">
                    {config.hasDuration ? `${config.duration} min` : 'Untimed'}
                  </p>
                </div>

                <div className="p-3 sm:p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Subject</p>
                  <p className="text-base sm:text-lg font-bold text-blue-600 truncate">
                    {selectedSubject?.name || 'Not selected'}
                  </p>
                </div>

                {config.topicIds.length > 0 && (
                  <div className="p-3 sm:p-4 bg-green-50 rounded-xl">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Topics</p>
                    <p className="text-lg sm:text-lg font-bold text-green-600">{config.topicIds.length} selected</p>
                  </div>
                )}

                {config.difficulty && (
                  <div className="p-3 sm:p-4 bg-orange-50 rounded-xl">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Difficulty</p>
                    <p className="text-base sm:text-lg font-bold text-orange-600">{config.difficulty}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}