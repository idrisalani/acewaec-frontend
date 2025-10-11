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
  const [totalAvailableQuestions, setTotalAvailableQuestions] = useState(0); // ADD THIS
  const [config, setConfig] = useState<PracticeConfig>({
    subjectIds: [],
    topicIds: [],
    questionCount: 10,
    duration: 30,
    difficulty: '',
    hasDuration: true,
    category: '',
  });

  // Calculate total available questions in selected category
  // const calculateAvailableQuestions = (category: string) => {
  //   const categorySubjects = allSubjects.filter(s =>
  //     s.categories?.includes(category)
  //   );
  //   const total = categorySubjects.reduce((sum, subject) =>
  //     sum + (subject._count?.questions || 0), 0
  //   );
  //   return total;
  // };

  const getAvailableQuestions = () => {
    if (config.subjectIds.length === 0) return totalAvailableQuestions;

    const selectedSubject = subjects.find(s => config.subjectIds.includes(s.id));
    if (!selectedSubject) return 0;

    if (config.topicIds.length === 0) {
      // Use questionCount first, fallback to _count
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

  useEffect(() => {
    loadSubjects();
  }, []);

  // Filter subjects when category changes
  // Effect to fetch subjects when category changes
  useEffect(() => {
    if (config.category) {
      // Fetch subjects for this specific category from API
      const fetchCategorySubjects = async () => {
        try {
          const data = await practiceService.getSubjects(config.category);

          console.log('✅ Category subjects:', data);

          setSubjects(data);

          // Calculate total questions
          const total = data.reduce((sum: number, subject: Subject) =>
            sum + (subject.questionCount || subject._count?.questions || 0), 0
          );

          console.log('✅ Total questions:', total);

          setTotalAvailableQuestions(total);

          // Reset selections
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
      // When no category, show all subjects
      setSubjects(allSubjects);
      setTotalAvailableQuestions(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.category]); // Only depend on config.category

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
      // Fetch ALL subjects first (no category filter on initial load)
      const data = await practiceService.getSubjects();

      console.log('✅ Loaded subjects:', data); // DEBUG

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
      const sessionConfig = {
        ...config,
        duration: config.hasDuration ? config.duration : undefined,
      };

      const result = await practiceService.startSession(sessionConfig);
      localStorage.setItem('currentPracticeSession', JSON.stringify(result));
      navigate(`/practice/${result.session.id}`);
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        alert(axiosError.response?.data?.error || 'Failed to start practice session');
      } else {
        alert('Failed to start practice session');
      }
      setLoading(false);
    }
  };

  const selectedSubject = subjects.find(s => config.subjectIds.includes(s.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <Home size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Start Practice Session</h1>
              <p className="text-gray-600">Follow the steps to configure your practice</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">

              {/* STEP 1: Category Selection */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <GraduationCap className="text-indigo-600" size={20} />
                    Select Your Category
                  </label>
                </div>
                <p className="text-sm text-gray-600 mb-4 ml-10">
                  Choose your academic track to see relevant subjects
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {['SCIENCE', 'ART', 'COMMERCIAL'].map((cat) => {
                    // Show counts only for the selected category
                    const isSelected = config.category === cat;
                    const showCounts = isSelected && subjects.length > 0;

                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`p-5 border-2 rounded-xl transition-all text-center hover:shadow-lg ${isSelected
                          ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 transform scale-105'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                          }`}
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          category: prev.category === cat ? '' : cat
                        }))}
                      >
                        <div className="font-bold text-gray-900 mb-1">{cat}</div>
                        {showCounts ? (
                          <>
                            <div className="text-xs text-gray-500">
                              {subjects.length} subjects
                            </div>
                            <div className="text-xs text-indigo-600 font-semibold mt-1">
                              {totalAvailableQuestions} questions
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-gray-500">
                            Click to view
                          </div>
                        )}
                        {isSelected && (
                          <CheckCircle className="text-indigo-600 mx-auto mt-2" size={20} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Show rest only after category is selected */}
              {config.category && (
                <>
                  {/* Success indicator */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                    <CheckCircle className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        {config.category} Category Selected
                      </p>
                      <p className="text-xs text-green-700">
                        {totalAvailableQuestions} questions available across {subjects.length} subjects
                      </p>
                    </div>
                  </div>

                  {/* STEP 2: Number of Questions */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <label className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Target className="text-indigo-600" size={20} />
                        Number of Questions
                        <span className="text-sm font-normal text-gray-500">
                          (Max: {totalAvailableQuestions})
                        </span>
                      </label>
                    </div>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={config.questionCount}
                      onChange={(e) => setConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                    >
                      {[5, 10, 20, 30, 50, 100].filter(n => n <= totalAvailableQuestions).map(n => (
                        <option key={n} value={n}>{n} Questions</option>
                      ))}
                    </select>
                  </div>

                  {/* STEP 3: Time Limit */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <label className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Clock className="text-indigo-600" size={20} />
                        Time Limit
                      </label>
                    </div>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="hasDuration"
                        checked={config.hasDuration}
                        onChange={(e) => setConfig(prev => ({ ...prev, hasDuration: e.target.checked }))}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <label htmlFor="hasDuration" className="ml-3 text-gray-700">
                        Enable timed practice
                      </label>
                    </div>
                    {config.hasDuration && (
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={config.duration}
                        onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      >
                        <option value="10">10 Minutes</option>
                        <option value="20">20 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="45">45 Minutes</option>
                        <option value="60">1 Hour</option>
                        <option value="90">1.5 Hours</option>
                        <option value="120">2 Hours</option>
                      </select>
                    )}
                  </div>

                  {/* STEP 4: Select Subject */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        4
                      </div>
                      <label className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <BookOpen className="text-indigo-600" size={20} />
                        Select Subject
                        <span className="text-sm font-normal text-gray-500">
                          ({config.category} subjects)
                        </span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          5
                        </div>
                        <label className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <TrendingUp className="text-indigo-600" size={20} />
                          Select Topics (Optional)
                        </label>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {topics.length > 0 ? '6' : '5'}
                      </div>
                      <label className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <TrendingUp className="text-indigo-600" size={20} />
                        Difficulty Level (Optional)
                      </label>
                    </div>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={config.difficulty}
                      onChange={(e) => setConfig(prev => ({ ...prev, difficulty: e.target.value }))}
                    >
                      <option value="">All Levels</option>
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || config.subjectIds.length === 0}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Starting Session...
                      </>
                    ) : (
                      <>
                        Start Practice Session
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Show prompt if no category selected */}
              {!config.category && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <ArrowRight className="text-indigo-600" size={32} />
                  </div>
                  <p className="text-gray-600 text-lg font-medium">
                    Select a category above to continue
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Choose Science, Art, or Commercial to see available subjects
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Session Summary</h3>

              <div className="space-y-4">
                {config.category && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="text-xl font-bold text-purple-700">{config.category}</p>
                  </div>
                )}

                <div className="p-4 bg-indigo-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Questions</p>
                  <p className="text-2xl font-bold text-indigo-600">{config.questionCount}</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {config.hasDuration ? `${config.duration} min` : 'Untimed'}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Subject</p>
                  <p className="text-lg font-bold text-blue-600">
                    {selectedSubject?.name || 'Not selected'}
                  </p>
                </div>

                {config.topicIds.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Topics</p>
                    <p className="text-lg font-bold text-green-600">{config.topicIds.length} selected</p>
                  </div>
                )}

                {config.difficulty && (
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Difficulty</p>
                    <p className="text-lg font-bold text-orange-600">{config.difficulty}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}