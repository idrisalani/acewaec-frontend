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

  useEffect(() => {
    loadSubjects();
  }, []);

  // ✅ MODIFIED: Only fetch subjects for the user's category
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.category]);

  useEffect(() => {
    if (config.subjectIds.length === 1) {
      loadTopics(config.subjectIds[0]);
    } else {
      setTopics([]);
      setConfig(prev => ({ ...prev, topicIds: [] }));
    }
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

  const loadTopics = async (subjectId: string) => {
    try {
      const data = await practiceService.getTopics(subjectId);
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics:', error);
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

      // Handle wrapped responses
      const sessionData = response?.data ? response.data : response;

      // Validate structure
      if (!sessionData?.session?.id || !Array.isArray(sessionData?.questions)) {
        throw new Error('Invalid server response structure');
      }

      // ✅ Use utility function for storage
      setSessionData('currentSession', {
        session: sessionData.session,
        questions: sessionData.questions,
      });

      // Only navigate after successful storage
      navigate(`/practice/interface/${sessionData.session.id}`);

    } catch (error) {
      console.error('Failed to start practice session:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  // ✅ NEW: Helper to get selected subject name for summary
  const selectedSubject = subjects.find(s => config.subjectIds.includes(s.id));

  // Show loading while fetching user data
  if (isLoadingUserData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pt-20 pb-12 px-3 sm:px-4">
      <main className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            <Home size={20} />
            Back to Dashboard
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Practice Setup
                </h1>
                <p className="text-gray-600">Configure your practice session</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* ✅ MODIFIED: Show category section based on user data */}
                {userCategory ? (
                  // ✅ NEW: User's category is already selected and shown as read-only
                  <>
                    {/* Read-only user category display */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          1
                        </div>
                        <label className="text-base sm:text-lg font-semibold text-gray-900">
                          Your Category
                        </label>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl">
                        <div className="text-center">
                          <p className="text-lg sm:text-xl font-bold text-indigo-700 mb-2">
                            {userCategory}
                          </p>
                          <p className="text-xs sm:text-sm text-indigo-600">
                            ✓ This is your registered category
                          </p>
                          <p className="text-xs text-gray-600 mt-2">
                            All subjects below are for <span className="font-semibold">{userCategory}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* STEP 2: Select Number of Questions */}
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
                          type="range"
                          min="1"
                          max="50"
                          value={config.questionCount}
                          onChange={(e) => setConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between items-center bg-indigo-50 p-3 sm:p-4 rounded-lg">
                          <span className="text-sm sm:text-base text-gray-600">Questions:</span>
                          <span className="text-lg sm:text-2xl font-bold text-indigo-600">{config.questionCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* STEP 3: Duration Settings */}
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
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.hasDuration}
                            onChange={(e) => setConfig(prev => ({ ...prev, hasDuration: e.target.checked }))}
                            className="w-5 h-5 text-indigo-600 rounded"
                          />
                          <span className="text-sm sm:text-base text-gray-700 font-medium">Set time limit</span>
                        </label>

                        {config.hasDuration && (
                          <div className="space-y-2">
                            <input
                              type="range"
                              min="5"
                              max="180"
                              step="5"
                              value={config.duration}
                              onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between items-center bg-purple-50 p-3 sm:p-4 rounded-lg">
                              <span className="text-sm sm:text-base text-gray-600">Time:</span>
                              <span className="text-lg sm:text-2xl font-bold text-purple-600">{config.duration} min</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STEP 4: Select Subject */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          4
                        </div>
                        <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                          <BookOpen className="text-indigo-600" size={20} />
                          <span>Select Subject</span>
                          <span className="text-xs sm:text-sm font-normal text-gray-500">
                            ({config.category})
                          </span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {subjects.map(subject => (
                          <button
                            key={subject.id}
                            type="button"
                            className={`p-4 border-2 rounded-xl transition-all text-left ${config.subjectIds.includes(subject.id)
                              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 transform scale-105'
                              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                              }`}
                            onClick={() => toggleSubject(subject.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-semibold text-gray-900 text-sm">{subject.name}</div>
                              {config.subjectIds.includes(subject.id) && (
                                <CheckCircle className="text-indigo-600 flex-shrink-0" size={18} />
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