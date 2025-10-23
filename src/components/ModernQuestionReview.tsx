import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Flag, ChevronDown, ChevronUp, Lightbulb, Book } from 'lucide-react';

interface Question {
  id: string;
  content: string;
  difficulty: string;
  explanation?: string;
  subject: { name: string };
  options: Array<{
    id: string;
    label: string;
    content: string;
    isCorrect: boolean;
  }>;
}

interface Answer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  isFlagged?: boolean;
  question: Question;
}

interface ModernQuestionReviewProps {
  answers: Answer[];
  showReview: boolean;
}

export default function ModernQuestionReview({ answers, showReview }: ModernQuestionReviewProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect'>('all');

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getDifficultyStyles = (difficulty: string) => {
    const styles = {
      EASY: 'bg-green-100 text-green-700 border-green-200',
      MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      HARD: 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[difficulty as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (!showReview) return null;

  const correctCount = answers.filter(a => a.isCorrect).length;
  const incorrectCount = answers.length - correctCount;

  const filteredAnswers = answers.filter(answer => {
    if (filterType === 'correct') return answer.isCorrect;
    if (filterType === 'incorrect') return !answer.isCorrect;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Review Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Book className="animate-pulse" size={24} />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Question Review</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <span className="font-semibold">{correctCount} Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle size={18} />
            <span className="font-semibold">{incorrectCount} Incorrect</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 sm:gap-3 flex-wrap">
        {['all', 'correct', 'incorrect'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type as 'all' | 'correct' | 'incorrect')}
            className={`px-3 sm:px-4 py-2 rounded-xl font-semibold transition-colors text-xs sm:text-sm ${
              filterType === type
                ? type === 'all'
                  ? 'bg-indigo-600 text-white border-2 border-indigo-600'
                  : type === 'correct'
                  ? 'bg-green-600 text-white border-2 border-green-600'
                  : 'bg-red-600 text-white border-2 border-red-600'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {type === 'all' && `All (${answers.length})`}
            {type === 'correct' && `Correct (${correctCount})`}
            {type === 'incorrect' && `Incorrect (${incorrectCount})`}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-3 sm:space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAnswers.map((answer, idx) => {
            const correctOption = answer.question.options.find(opt => opt.isCorrect);
            const selectedOption = answer.question.options.find(opt => opt.id === answer.selectedAnswer);
            const isExpanded = expandedQuestions.has(answer.questionId);

            return (
              <motion.div
                key={answer.questionId}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.05, type: 'spring', damping: 25 }}
                className="relative"
              >
                <div
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-l-4 ${
                    answer.isCorrect ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  {/* Question Header */}
                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Status Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.05 + 0.2, type: 'spring' }}
                        className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                          answer.isCorrect 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {answer.isCorrect ? (
                          <CheckCircle size={24} />
                        ) : (
                          <XCircle size={24} />
                        )}
                      </motion.div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        {/* Meta Information */}
                        <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm sm:text-base">Q{idx + 1}</span>
                          
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded text-xs font-bold">
                            {answer.question.subject.name}
                          </span>
                          
                          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs font-bold border ${getDifficultyStyles(answer.question.difficulty)}`}>
                            {answer.question.difficulty}
                          </span>
                          
                          {answer.isFlagged && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold flex items-center gap-1"
                            >
                              <Flag size={12} fill="currentColor" />
                              Flagged
                            </motion.span>
                          )}
                        </div>

                        {/* Question Text */}
                        <p className="text-gray-900 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                          {answer.question.content}
                        </p>

                        {/* Quick Answer Display */}
                        <div className="space-y-2">
                          <div className={`p-2 sm:p-4 rounded-xl border-2 text-xs sm:text-sm ${
                            answer.isCorrect 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}>
                            <p className="font-semibold text-gray-700 mb-1">Your Answer:</p>
                            <p className={`font-bold ${answer.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {selectedOption?.label}. {selectedOption?.content}
                            </p>
                          </div>

                          {!answer.isCorrect && correctOption && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="p-2 sm:p-4 bg-green-50 border-2 border-green-200 rounded-xl text-xs sm:text-sm"
                            >
                              <p className="font-semibold text-gray-700 mb-1">Correct Answer:</p>
                              <p className="font-bold text-green-700">
                                {correctOption.label}. {correctOption.content}
                              </p>
                            </motion.div>
                          )}
                        </div>

                        {/* Expand/Collapse Button */}
                        {(answer.question.explanation || answer.question.options.length > 0) && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleQuestion(answer.questionId)}
                            className="mt-3 sm:mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-xs sm:text-sm"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp size={16} />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown size={16} />
                                View All Options & Explanation
                              </>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 border-t border-gray-100 pt-3 sm:pt-4 lg:pt-6 space-y-3 sm:space-y-4">
                          {/* All Options */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm lg:text-base">
                              <Book size={16} />
                              All Options
                            </h4>
                            <div className="space-y-2">
                              {answer.question.options.map((option) => {
                                const isSelected = option.id === answer.selectedAnswer;
                                const isCorrectOpt = option.isCorrect;
                                
                                return (
                                  <motion.div
                                    key={option.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm ${
                                      isCorrectOpt
                                        ? 'bg-green-50 border-green-300'
                                        : isSelected
                                        ? 'bg-red-50 border-red-300'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                        isCorrectOpt
                                          ? 'bg-green-500 text-white'
                                          : isSelected
                                          ? 'bg-red-500 text-white'
                                          : 'bg-gray-300 text-gray-700'
                                      }`}>
                                        {option.label}
                                      </span>
                                      <span className={`flex-1 ${
                                        isCorrectOpt ? 'text-green-900 font-semibold' : 'text-gray-700'
                                      }`}>
                                        {option.content}
                                      </span>
                                      {isCorrectOpt && (
                                        <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                                      )}
                                      {isSelected && !isCorrectOpt && (
                                        <XCircle className="text-red-600 flex-shrink-0" size={18} />
                                      )}
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Explanation */}
                          {answer.question.explanation && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl"
                            >
                              <div className="flex items-start gap-2 sm:gap-3">
                                <div className="bg-blue-500 p-1.5 rounded-lg flex-shrink-0">
                                  <Lightbulb className="text-white" size={16} />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-blue-900 mb-1 text-xs sm:text-sm">Explanation</h4>
                                  <p className="text-blue-800 leading-relaxed text-xs sm:text-sm">
                                    {answer.question.explanation}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}