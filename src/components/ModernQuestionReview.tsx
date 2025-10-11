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

  const getDifficultyIcon = (difficulty: string) => {
    const icons = {
      EASY: '🌱',
      MEDIUM: '⚡',
      HARD: '🔥'
    };
    return icons[difficulty as keyof typeof icons] || '📝';
  };

  if (!showReview) return null;

  const correctCount = answers.filter(a => a.isCorrect).length;
  const incorrectCount = answers.length - correctCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Review Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Book className="animate-pulse" size={32} />
          <h2 className="text-3xl font-bold">Question Review</h2>
        </div>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} />
            <span className="font-semibold">{correctCount} Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle size={20} />
            <span className="font-semibold">{incorrectCount} Incorrect</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 flex-wrap">
        <button className="px-4 py-2 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
          All ({answers.length})
        </button>
        <button className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
          Correct ({correctCount})
        </button>
        <button className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
          Incorrect ({incorrectCount})
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {answers.map((answer, idx) => {
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
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.05 + 0.2, type: 'spring' }}
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          answer.isCorrect 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {answer.isCorrect ? (
                          <CheckCircle size={28} />
                        ) : (
                          <XCircle size={28} />
                        )}
                      </motion.div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        {/* Meta Information */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="text-lg font-bold text-gray-900">Q{idx + 1}</span>
                          
                          <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-lg text-xs font-bold">
                            {answer.question.subject.name}
                          </span>
                          
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getDifficultyStyles(answer.question.difficulty)}`}>
                            {getDifficultyIcon(answer.question.difficulty)} {answer.question.difficulty}
                          </span>
                          
                          {answer.isFlagged && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold flex items-center gap-1"
                            >
                              <Flag size={12} fill="currentColor" />
                              Flagged
                            </motion.span>
                          )}
                        </div>

                        {/* Question Text */}
                        <p className="text-gray-900 text-lg leading-relaxed mb-4">
                          {answer.question.content}
                        </p>

                        {/* Quick Answer Display */}
                        <div className="space-y-2">
                          <div className={`p-4 rounded-xl border-2 ${
                            answer.isCorrect 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
                            <p className={`font-bold ${answer.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {selectedOption?.label}. {selectedOption?.content}
                            </p>
                          </div>

                          {!answer.isCorrect && correctOption && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="p-4 bg-green-50 border-2 border-green-200 rounded-xl"
                            >
                              <p className="text-sm font-semibold text-gray-700 mb-1">Correct Answer:</p>
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
                            className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp size={18} />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown size={18} />
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
                        <div className="px-6 pb-6 border-t border-gray-100 pt-6 space-y-4">
                          {/* All Options */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Book size={18} />
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
                                    className={`p-3 rounded-lg border-2 ${
                                      isCorrectOpt
                                        ? 'bg-green-50 border-green-300'
                                        : isSelected
                                        ? 'bg-red-50 border-red-300'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
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
                                        <CheckCircle className="text-green-600" size={20} />
                                      )}
                                      {isSelected && !isCorrectOpt && (
                                        <XCircle className="text-red-600" size={20} />
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
                              className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl"
                            >
                              <div className="flex items-start gap-3">
                                <div className="bg-blue-500 p-2 rounded-lg">
                                  <Lightbulb className="text-white" size={20} />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-blue-900 mb-2">Explanation</h4>
                                  <p className="text-blue-800 leading-relaxed">
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