import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
  id: string;
  content: string;
  type: string;
  difficulty: string;
  year: number;
  subject: { name: string; code: string };
  topic: { name: string };
  options: Array<{ label: string; content: string; isCorrect: boolean }>;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', code: 'MATH' },
    { id: '2', name: 'English Language', code: 'ENG' },
    { id: '3', name: 'Physics', code: 'PHY' },
  ]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages] = useState(5);
  const [showFilters, setShowFilters] = useState(false);


  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setQuestions([
        {
          id: '1',
          content: 'What is the value of π (pi) to two decimal places?',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          year: 2024,
          subject: { name: 'Mathematics', code: 'MATH' },
          topic: { name: 'Basic Geometry' },
          options: [
            { label: 'A', content: '3.12', isCorrect: false },
            { label: 'B', content: '3.14', isCorrect: true },
            { label: 'C', content: '3.16', isCorrect: false },
            { label: 'D', content: '3.18', isCorrect: false },
          ],
        },
        {
          id: '2',
          content: 'Solve for x: 2x + 5 = 15',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'MEDIUM',
          year: 2023,
          subject: { name: 'Mathematics', code: 'MATH' },
          topic: { name: 'Algebra' },
          options: [
            { label: 'A', content: 'x = 3', isCorrect: false },
            { label: 'B', content: 'x = 5', isCorrect: true },
            { label: 'C', content: 'x = 7', isCorrect: false },
            { label: 'D', content: 'x = 10', isCorrect: false },
          ],
        },
        {
          id: '3',
          content: 'Which of the following is a prime number?',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          year: 2024,
          subject: { name: 'Mathematics', code: 'MATH' },
          topic: { name: 'Number Theory' },
          options: [
            { label: 'A', content: '15', isCorrect: false },
            { label: 'B', content: '21', isCorrect: false },
            { label: 'C', content: '23', isCorrect: true },
            { label: 'D', content: '27', isCorrect: false },
          ],
        },
      ]);
      setLoading(false);
    }, 800);
  }, [page, search, subjectFilter, difficultyFilter]);

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      EASY: 'from-green-500 to-emerald-500',
      MEDIUM: 'from-yellow-500 to-orange-500',
      HARD: 'from-red-500 to-pink-500',
    };
    return colors[difficulty as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      EASY: 'bg-green-50 text-green-700 border-green-200',
      MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      HARD: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Questions Bank
            </h1>
            <p className="text-gray-600">Manage and organize your WAEC questions</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} />
            <span className="font-semibold">Add Question</span>
          </motion.button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                showFilters
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Filter size={20} />
              Filters
              {(subjectFilter || difficultyFilter) && (
                <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {[subjectFilter, difficultyFilter].filter(Boolean).length}
                </span>
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                      <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                      >
                        <option value="">All Subjects</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                      <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                      >
                        <option value="">All Difficulties</option>
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>
                  </div>
                  
                  {(subjectFilter || difficultyFilter) && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSubjectFilter('');
                        setDifficultyFilter('');
                      }}
                      className="mt-4 text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"
                    >
                      <X size={16} />
                      Clear all filters
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Questions List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getDifficultyBadge(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                          <span className="text-sm text-gray-500">
                            {question.subject.name} • {question.topic.name}
                          </span>
                          {question.year && (
                            <span className="text-sm text-gray-400">
                              {question.year}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-900 text-lg leading-relaxed mb-4">
                          {question.content}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {question.options.map((option) => (
                            <div
                              key={option.label}
                              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                                option.isCorrect
                                  ? 'bg-green-50 border-2 border-green-200 text-green-700 font-semibold'
                                  : 'bg-gray-50 border border-gray-200 text-gray-700'
                              }`}
                            >
                              <span className="font-bold mr-2">{option.label}.</span>
                              {option.content}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative gradient bar */}
                  <div className={`h-1 bg-gradient-to-r ${getDifficultyColor(question.difficulty)}`} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between mt-8 bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="text-gray-700 font-medium">
            Page <span className="text-indigo-600 font-bold">{page}</span> of{' '}
            <span className="text-indigo-600 font-bold">{totalPages}</span>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-300 hover:bg-indigo-50 transition-all font-semibold"
            >
              <ChevronLeft size={18} />
              Previous
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-300 hover:bg-indigo-50 transition-all font-semibold"
            >
              Next
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}