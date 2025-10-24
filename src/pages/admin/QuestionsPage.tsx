import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

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
            { label: 'A', content: '4', isCorrect: false },
            { label: 'B', content: '9', isCorrect: false },
            { label: 'C', content: '17', isCorrect: true },
            { label: 'D', content: '20', isCorrect: false },
          ],
        },
        {
          id: '4',
          content: 'What is the chemical formula for water?',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          year: 2024,
          subject: { name: 'Physics', code: 'PHY' },
          topic: { name: 'Basic Chemistry' },
          options: [
            { label: 'A', content: 'H2O', isCorrect: true },
            { label: 'B', content: 'CO2', isCorrect: false },
            { label: 'C', content: 'O2', isCorrect: false },
            { label: 'D', content: 'H2O2', isCorrect: false },
          ],
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'EASY':
        return 'from-green-500 to-emerald-500';
      case 'MEDIUM':
        return 'from-yellow-500 to-orange-500';
      case 'HARD':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getDifficultyBadgeColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'HARD':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 xs:w-16 xs:h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3 xs:mb-4"
          />
          <p className="text-sm xs:text-base text-gray-600 font-medium">Loading questions...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 xs:mb-4 sm:mb-6"
        >
          <div className="flex items-center justify-between gap-2 mb-2 xs:mb-3">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
              Questions
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 text-white p-2 xs:p-2.5 sm:p-3 rounded-lg xs:rounded-xl hover:bg-indigo-700 transition-colors flex-shrink-0"
            >
              <Plus className="w-5 h-5 xs:w-6 xs:h-6" />
            </motion.button>
          </div>
          <p className="text-xs xs:text-sm text-gray-600">
            Manage and organize your question bank
          </p>
        </motion.div>

        {/* Search & Filter Bar - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-3 xs:mb-4 sm:mb-6"
        >
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
            {/* Search Box */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 xs:w-5 xs:h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 xs:pl-10 pr-3 xs:pr-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs xs:text-sm"
              />
            </div>
            
            {/* Filter Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex items-center gap-2 px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg xs:rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all font-semibold text-xs xs:text-sm"
            >
              <Filter className="w-4 h-4 xs:w-5 xs:h-5" />
              <span className="hidden xs:inline">Filter</span>
            </motion.button>
          </div>

          {/* Filter Panel - Mobile Responsive */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 xs:mt-3 sm:mt-4 p-3 xs:p-4 sm:p-6 bg-white rounded-lg xs:rounded-xl shadow-lg border border-gray-200"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                  {/* Subject Filter */}
                  <div>
                    <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <select
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="w-full px-3 py-2 xs:py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs xs:text-sm"
                    >
                      <option value="">All Subjects</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.code}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="w-full px-3 py-2 xs:py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs xs:text-sm"
                    >
                      <option value="">All Levels</option>
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Questions List - Mobile Responsive */}
        {questions.length > 0 ? (
          <div className="space-y-2 xs:space-y-3 sm:space-y-4 mb-4 xs:mb-6 sm:mb-8">
            <AnimatePresence>
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-lg xs:rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <div className="p-3 xs:p-4 sm:p-6">
                    {/* Question Header - Mobile Responsive */}
                    <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-2 xs:gap-3 mb-2 xs:mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1 xs:mb-2">
                          <span className={`text-xs xs:text-sm font-bold px-2 xs:px-3 py-1 rounded-full ${getDifficultyBadgeColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                          <span className="text-xs xs:text-sm text-gray-600 bg-gray-100 px-2 xs:px-3 py-1 rounded-full">
                            {question.year}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 xs:gap-2 text-xs xs:text-sm text-gray-600">
                          <span className="font-semibold">{question.subject.name}</span>
                          <span>•</span>
                          <span>{question.topic.name}</span>
                        </div>
                      </div>

                      {/* Action Buttons - Always Visible on Mobile */}
                      <div className="flex gap-1 xs:gap-2 flex-shrink-0 xs:opacity-0 xs:group-hover:opacity-100 xs:transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 xs:p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 xs:w-4.5 xs:h-4.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 xs:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 xs:w-4.5 xs:h-4.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 xs:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 xs:w-4.5 xs:h-4.5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Question Content - Mobile Responsive */}
                    <p className="text-gray-900 text-sm xs:text-base leading-relaxed mb-2 xs:mb-3 sm:mb-4">
                      {question.content}
                    </p>

                    {/* Options Grid - Mobile Responsive */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 xs:gap-2">
                      {question.options.map((option) => (
                        <div
                          key={option.label}
                          className={`px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg text-xs xs:text-sm transition-all ${
                            option.isCorrect
                              ? 'bg-green-50 border-2 border-green-200 text-green-700 font-semibold'
                              : 'bg-gray-50 border border-gray-200 text-gray-700'
                          }`}
                        >
                          <span className="font-bold mr-1 xs:mr-2">{option.label}.</span>
                          {option.content}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decorative gradient bar */}
                  <div className={`h-1 bg-gradient-to-r ${getDifficultyColor(question.difficulty)}`} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 xs:py-12 sm:py-16 bg-white rounded-lg xs:rounded-xl md:rounded-2xl shadow-lg"
          >
            <p className="text-gray-600 text-sm xs:text-base">No questions found</p>
          </motion.div>
        )}

        {/* Pagination - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4 bg-white rounded-lg xs:rounded-xl md:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6"
        >
          <div className="text-xs xs:text-sm text-gray-700 font-medium text-center xs:text-left">
            Page <span className="text-indigo-600 font-bold">{page}</span> of{' '}
            <span className="text-indigo-600 font-bold">{totalPages}</span>
          </div>

          <div className="flex gap-2 justify-center xs:justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 xs:gap-2 px-2 xs:px-4 py-1.5 xs:py-2 border-2 border-gray-200 rounded-lg xs:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-300 hover:bg-indigo-50 transition-all font-semibold text-xs xs:text-sm"
            >
              <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5" />
              <span className="hidden xs:inline">Previous</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 xs:gap-2 px-2 xs:px-4 py-1.5 xs:py-2 border-2 border-gray-200 rounded-lg xs:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-300 hover:bg-indigo-50 transition-all font-semibold text-xs xs:text-sm"
            >
              <span className="hidden xs:inline">Next</span>
              <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}