import { useState, useEffect } from 'react';
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
import { practiceService, type SessionWithQuestions } from '../../services/practice.service';
import { setSessionData, SESSION_STORAGE_KEYS } from '../../utils/sessionStorage';

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

export default function PracticeSetup() {
  const navigate = useNavigate();
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalAvailableQuestions, setTotalAvailableQuestions] = useState(0);
  const [userCategory, setUserCategory] = useState<string>(''); // ✅ NEW
  const [isLoadingUserData, setIsLoadingUserData] = useState(true); // ✅ NEW

  const [config, setConfig] = useState<PracticeConfig>({
    subjectIds: [],
    topicIds: [],
    questionCount: 10,
    duration: 30,
    difficulty: '',
    hasDuration: true,
    category: '',
  });

  const getAvailableQuestions = () => {
    if (config.subjectIds.length === 0) return totalAvailableQuestions;

    const selectedSubject = subjects.find(s => config.subjectIds.includes(s.id));
    if (!selectedSubject) return 0;

    if (config.topicIds.length === 0) {
      return selectedSubject.questionCount || selectedSubject._count?.questions || 0;
    }

    return topics
      .filter(t => config.topicIds.includes(t.id))
      .reduce((sum, topic) => sum + (topic._count?.questions || 0), 0);
  };

  useEffect(() => {
    const available = getAvailableQuestions();
    if (available > 0 && config.questionCount > available) {
      setConfig(prev => ({ ...prev, questionCount: Math.min(available, 50) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.subjectIds, config.topicIds, subjects, topics]);

  // ✅ NEW: Load user's registered category on component mount
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

  // ✅ Effect 1: Load all subjects on mount (once)
  useEffect(() => {
    loadSubjects();
  }, []);

  // ✅ Effect 2: Handle category changes - reload subjects for category
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
          setTopics([]); // ✅ Clear topics when category changes
        } catch (error) {
          console.error('Failed to load category subjects:', error);
        }
      };

      fetchCategorySubjects();
    } else {
      setSubjects(allSubjects);
      setTotalAvailableQuestions(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.category]);

  /**
   * ✅ CONSOLIDATED: Effect 3 - Handle subject changes
   * This replaces multiple fetch calls with a single optimized approach
   * 
   * Previously: Would fetch whenever subjectIds changed
   * Now: Fetches ONLY the first selected subject's topics and deduplicates
   */
  useEffect(() => {
    if (!config.subjectIds.length) {
      setTopics([]);
      return;
    }

    // ✅ Get topics for the first (and typically only) selected subject
    const firstSubjectId = config.subjectIds[0];
    loadTopics(firstSubjectId);
  }, [config.subjectIds]);

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
   * Consolidated approach to prevent duplicate fetches and API calls
   */
  const loadTopics = async (subjectId: string) => {
    try {
      if (!subjectId) {
        setTopics([]);
        return;
      }

      setLoading(true);
      
      // ✅ Fetch topics for the subject
      const data: Topic[] = await practiceService.getTopics(subjectId);
      console.log(`📚 Loaded ${data.length} topics for subject ${subjectId}`);

      // ✅ Remove duplicates by ID (if any)
      const seenIds = new Set<string>();
      const uniqueTopics = data.filter((topic: Topic) => {
        if (seenIds.has(topic.id)) {
          console.warn(`⚠️ Duplicate topic detected: ${topic.name} (${topic.id})`);
          return false;
        }
        seenIds.add(topic.id);
        return true;
      });

      if (data.length !== uniqueTopics.length) {
        console.warn(`⚠️ Removed ${data.length - uniqueTopics.length} duplicate topics`);
      }

      // ✅ Replace state completely (don't append)
      setTopics(uniqueTopics);
      console.log(`✅ Set ${uniqueTopics.length} unique topics`);
    } catch (error: unknown) {
      console.error('Failed to load topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setConfig(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? []
        : [subjectId],
      topicIds: []
    }));
  };

  const toggleTopic = (topicId: string) => {
    setConfig(prev => ({
      ...prev,
      topicIds: prev.topicIds.includes(topicId)
        ? prev.topicIds.filter(id => id !== topicId)
        : [...prev.topicIds, topicId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!config.category) {
      alert('Please select a category first');
      return;
    }

    if (config.subjectIds.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    setLoading(true);

    try {
      const response = await practiceService.startSession({
        subjectIds: config.subjectIds,
        topicIds: config.topicIds.length > 0 ? config.topicIds : undefined,
        questionCount: config.questionCount,
        duration: config.hasDuration ? config.duration : undefined,
        difficulty: config.difficulty || undefined,
        category: config.category,
      });

      // ✅ FIXED: SessionWithQuestions has session and questions directly
      // No need to check for response.data since the service already unwraps it
      const sessionData: SessionWithQuestions = response;

      // Validate structure
      if (!sessionData?.session?.id || !Array.isArray(sessionData?.questions)) {
        throw new Error('Invalid server response structure');
      }

      // ✅ Use utility function for storage
      setSessionData(SESSION_STORAGE_KEYS.CURRENT_PRACTICE_SESSION, {
        session: sessionData.session,
        questions: sessionData.questions,
      });

      // Only navigate after successful storage
      navigate(`/practice/interface/${sessionData.session.id}`);
    } catch (error) {
      console.error('Error starting session:', error);
      alert(error instanceof Error ? error.message : 'Failed to start practice session');
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = subjects.find(s => config.subjectIds.includes(s.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home size={20} />
              <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <BookOpen className="text-indigo-600" size={24} />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Practice Setup</h1>
            </div>
            <div className="w-8"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {isLoadingUserData ? (
                  // Loading state
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : userCategory ? (
                  // ✅ If user has category, show full setup
                  <>
                    {/* STEP 1: Category (Auto-Selected) */}
                    <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            ✓
                          </div>
                          <span className="text-sm sm:text-base font-semibold text-indigo-900">
                            Category: {userCategory}
                          </span>
                        </div>
                        <CheckCircle className="text-indigo-600" size={20} />
                      </div>
                    </div>

                    {/* STEP 2: Number of Questions */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          2
                        </div>
                        <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                          <Target className="text-indigo-600" size={20} />
                          Number of Questions
                        </label>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="number"
                          min="1"
                          max={getAvailableQuestions()}
                          value={config.questionCount}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            questionCount: Math.min(
                              parseInt(e.target.value) || 10,
                              getAvailableQuestions()
                            )
                          }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                        />
                        <p className="text-xs sm:text-sm text-gray-500">
                          Available: {getAvailableQuestions()} questions
                        </p>
                      </div>
                    </div>

                    {/* STEP 3: Duration */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          3
                        </div>
                        <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                          <Clock className="text-indigo-600" size={20} />
                          Duration
                        </label>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.hasDuration}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              hasDuration: e.target.checked
                            }))}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="text-sm sm:text-base font-medium text-gray-700">
                            Set time limit
                          </span>
                        </label>
                        {config.hasDuration && (
                          <input
                            type="number"
                            min="5"
                            max="180"
                            value={config.duration}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              duration: parseInt(e.target.value) || 30
                            }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                          />
                        )}
                      </div>
                    </div>

                    {/* STEP 4: Subjects */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          4
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
                              <div className="text-sm font-medium">{subject.name}</div>
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

                    {/* STEP 5: Topics (Optional) */}
                    {topics.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-4">
                          <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            5
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

                    {/* STEP 6: Difficulty (Optional) */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {topics.length > 0 ? '6' : '5'}
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