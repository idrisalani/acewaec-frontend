import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Flag, Zap, Brain } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  content: string;
}

interface Question {
  id: string;
  content: string;
  difficulty: string;
  options: Option[];
}

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onSelectAnswer: (optionId: string) => void;
  timeRemaining?: number;
  isReviewing?: boolean;
  correctAnswer?: string;
  userAnswer?: string;
}

export default function ModernQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  timeRemaining,
  isReviewing = false,
  correctAnswer,
  userAnswer
}: Props) {
  const [flagged, setFlagged] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const getDifficultyConfig = (difficulty: string) => {
    const configs = {
      EASY: { 
        bg: 'from-green-500 to-emerald-500', 
        icon: '🌱', 
        label: 'Easy',
        badge: 'bg-green-100 text-green-700 border-green-300'
      },
      MEDIUM: { 
        bg: 'from-yellow-500 to-orange-500', 
        icon: '⚡', 
        label: 'Medium',
        badge: 'bg-yellow-100 text-yellow-700 border-yellow-300'
      },
      HARD: { 
        bg: 'from-red-500 to-pink-500', 
        icon: '🔥', 
        label: 'Hard',
        badge: 'bg-red-100 text-red-700 border-red-300'
      }
    };
    return configs[difficulty.toUpperCase() as keyof typeof configs] || configs.MEDIUM;
  };

  const difficultyConfig = getDifficultyConfig(question.difficulty);
  const isTimeCritical = timeRemaining !== undefined && timeRemaining < 300;

  const getOptionStyle = (option: Option) => {
    const isSelected = selectedAnswer === option.id;
    const isHovered = hoveredOption === option.id;
    
    if (isReviewing) {
      const isCorrect = correctAnswer === option.id;
      const isUserAnswer = userAnswer === option.id;
      
      if (isCorrect) {
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 ring-2 ring-green-200 shadow-lg';
      }
      if (isUserAnswer && !isCorrect) {
        return 'bg-gradient-to-r from-red-50 to-pink-50 border-red-400 ring-2 ring-red-200 shadow-lg';
      }
      return 'bg-white border-gray-200 hover:border-gray-300';
    }
    
    if (isSelected) {
      return 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-500 ring-4 ring-indigo-200 shadow-xl transform scale-[1.02]';
    }
    
    if (isHovered) {
      return 'bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-indigo-300 shadow-lg transform scale-[1.01]';
    }
    
    return 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="relative"
    >
      {/* Decorative Background Elements */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100/20 via-purple-100/20 to-pink-100/20 rounded-3xl blur-2xl -z-10" />
      
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        {/* Gradient Header Bar */}
        <div className={`h-2 bg-gradient-to-r ${difficultyConfig.bg}`} />
        
        <div className="p-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Question Number Badge */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">
                  {questionNumber}
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
              </motion.div>
              
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Question {questionNumber} of {totalQuestions}
                </p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-1"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Timer */}
              {timeRemaining !== undefined && (
                <motion.div
                  animate={{ 
                    scale: isTimeCritical ? [1, 1.05, 1] : 1 
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: isTimeCritical ? Infinity : 0 
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold shadow-lg ${
                    isTimeCritical 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                      : timeRemaining < 600
                      ? 'bg-gradient-to-r from-orange-400 to-yellow-400 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  }`}
                >
                  <Clock size={18} className={isTimeCritical ? 'animate-spin' : ''} />
                  <span className="text-base">
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </motion.div>
              )}
              
              {/* Difficulty Badge */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-xl font-bold text-sm border-2 shadow-lg ${difficultyConfig.badge}`}
              >
                <span className="mr-1">{difficultyConfig.icon}</span>
                {difficultyConfig.label}
              </motion.div>
              
              {/* Flag Button */}
              {!isReviewing && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFlagged(!flagged)}
                  className={`p-3 rounded-xl transition-all shadow-lg ${
                    flagged 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                  }`}
                  title="Flag for review"
                >
                  <Flag size={20} fill={flagged ? 'currentColor' : 'none'} />
                </motion.button>
              )}
            </div>
          </div>

          {/* Question Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg">
                <Brain className="text-white" size={24} />
              </div>
              <p className="text-xl md:text-2xl text-gray-900 leading-relaxed font-medium flex-1">
                {question.content}
              </p>
            </div>
          </motion.div>

          {/* Options */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrectOpt = isReviewing && correctAnswer === option.id;
                const isWrongOpt = isReviewing && userAnswer === option.id && correctAnswer !== option.id;
                
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: !isReviewing ? 1.01 : 1 }}
                    whileTap={{ scale: !isReviewing ? 0.99 : 1 }}
                    onClick={() => !isReviewing && onSelectAnswer(option.id)}
                    onMouseEnter={() => setHoveredOption(option.id)}
                    onMouseLeave={() => setHoveredOption(null)}
                    disabled={isReviewing}
                    className={`
                      w-full text-left p-5 rounded-2xl border-2 transition-all duration-300
                      ${getOptionStyle(option)}
                      ${!isReviewing ? 'cursor-pointer' : 'cursor-default'}
                      relative overflow-hidden
                    `}
                  >
                    {/* Animated background on hover */}
                    {hoveredOption === option.id && !isReviewing && (
                      <motion.div
                        layoutId="hoverBg"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-purple-100/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                    
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Option Letter */}
                      <motion.div
                        animate={{ 
                          scale: isSelected ? [1, 1.2, 1] : 1,
                          rotate: isSelected ? [0, 10, -10, 0] : 0
                        }}
                        transition={{ duration: 0.5 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg ${
                          isCorrectOpt 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                            : isWrongOpt
                            ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white'
                            : isSelected
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                            : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
                        }`}
                      >
                        {option.label}
                      </motion.div>
                      
                      {/* Option Content */}
                      <span className="flex-1 text-gray-900 text-lg font-medium">
                        {option.content}
                      </span>
                      
                      {/* Status Icons */}
                      <AnimatePresence>
                        {isSelected && !isReviewing && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                          >
                            <div className="bg-indigo-600 p-2 rounded-full">
                              <CheckCircle className="text-white" size={24} />
                            </div>
                          </motion.div>
                        )}
                        
                        {isCorrectOpt && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="bg-green-500 p-2 rounded-full shadow-lg"
                          >
                            <CheckCircle className="text-white" size={24} />
                          </motion.div>
                        )}
                        
                        {isWrongOpt && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="bg-red-500 p-2 rounded-full shadow-lg"
                          >
                            <XCircle className="text-white" size={24} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Hint Section (Optional) */}
          {!isReviewing && !selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl"
            >
              <div className="flex items-center gap-2 text-blue-700">
                <Zap size={18} />
                <p className="text-sm font-semibold">
                  Tip: Read all options carefully before selecting your answer
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}