import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, BookOpen, List, TrendingUp, Award, Users } from 'lucide-react';

interface AdminStats {
  totalQuestions: number;
  totalSubjects: number;
  totalTopics: number;
  questionsBySubject: Array<{ subject: string; count: number }>;
  questionsByDifficulty: Array<{ difficulty: string; _count: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalQuestions: 2847,
        totalSubjects: 12,
        totalTopics: 156,
        questionsBySubject: [
          { subject: 'Mathematics', count: 485 },
          { subject: 'English', count: 423 },
          { subject: 'Physics', count: 368 },
          { subject: 'Chemistry', count: 342 },
          { subject: 'Biology', count: 298 },
        ],
        questionsByDifficulty: [
          { difficulty: 'EASY', _count: 1142 },
          { difficulty: 'MEDIUM', _count: 1258 },
          { difficulty: 'HARD', _count: 447 },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

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
          <p className="text-sm xs:text-base text-gray-600 font-medium">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Questions', 
      value: stats?.totalQuestions || 0, 
      icon: FileQuestion, 
      gradient: 'from-blue-500 to-cyan-500',
      change: '+12.5%',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    { 
      label: 'Active Subjects', 
      value: stats?.totalSubjects || 0, 
      icon: BookOpen, 
      gradient: 'from-green-500 to-emerald-500',
      change: '+3',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    { 
      label: 'Topics Covered', 
      value: stats?.totalTopics || 0, 
      icon: List, 
      gradient: 'from-purple-500 to-pink-500',
      change: '+8',
      bgGradient: 'from-purple-50 to-pink-50'
    },
  ];

  const difficultyColors = {
    EASY: { bg: 'from-green-500 to-emerald-500', text: 'text-green-700', light: 'bg-green-50' },
    MEDIUM: { bg: 'from-yellow-500 to-orange-500', text: 'text-yellow-700', light: 'bg-yellow-50' },
    HARD: { bg: 'from-red-500 to-pink-500', text: 'text-red-700', light: 'bg-red-50' }
  };

  return (
    <div className="min-h-screen p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 xs:mb-6 sm:mb-8"
        >
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 xs:mb-2 truncate">
            Admin Dashboard
          </h1>
          <p className="text-xs xs:text-sm text-gray-600">
            Welcome back! Here's what's happening with your question bank.
          </p>
        </motion.div>

        {/* Stats Cards - Mobile Responsive */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 md:gap-6 mb-4 xs:mb-6 sm:mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className={`bg-gradient-to-br ${stat.bgGradient} rounded-lg xs:rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative`}
            >
              <div className="p-3 xs:p-4 sm:p-6">
                <div className="flex items-start justify-between mb-2 xs:mb-3 sm:mb-4">
                  <div className={`bg-gradient-to-br ${stat.gradient} p-2 xs:p-2.5 sm:p-3 rounded-lg xs:rounded-xl shadow-lg flex-shrink-0`}>
                    <stat.icon className="text-white w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6" />
                  </div>
                  <motion.span 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-green-600 text-xs xs:text-sm font-semibold bg-green-100 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full flex-shrink-0"
                  >
                    {stat.change}
                  </motion.span>
                </div>
                <p className="text-gray-600 text-xs xs:text-sm font-medium mb-0.5 xs:mb-1 line-clamp-1">{stat.label}</p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-lg xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
                >
                  {stat.value.toLocaleString()}
                </motion.p>
              </div>
              
              {/* Decorative element */}
              <div className={`absolute -bottom-2 -right-2 w-16 h-16 xs:w-20 xs:h-20 md:w-24 md:h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl`} />
            </motion.div>
          ))}
        </div>

        {/* Charts Section - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-6 mb-4 xs:mb-6 sm:mb-8">
          {/* Questions by Subject */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg xs:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-3 xs:p-4 sm:p-6 hover:shadow-xl md:hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-3 xs:mb-4 sm:mb-6 gap-2">
              <h2 className="text-sm xs:text-base sm:text-xl font-bold text-gray-900 truncate">
                Questions by Subject
              </h2>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-1.5 xs:p-2 rounded-lg flex-shrink-0">
                <TrendingUp className="text-white w-4 h-4 xs:w-5 xs:h-5" />
              </div>
            </div>
            
            <div className="space-y-2 xs:space-y-3 sm:space-y-4">
              {stats?.questionsBySubject.map((item, index) => {
                const percentage = (item.count / (stats?.totalQuestions || 1)) * 100;
                return (
                  <motion.div
                    key={item.subject}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-1 xs:mb-2 gap-2 flex-wrap">
                      <span className="text-xs xs:text-sm text-gray-700 font-medium group-hover:text-indigo-600 transition-colors truncate">
                        {item.subject}
                      </span>
                      <div className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm flex-shrink-0">
                        <span className="text-gray-500">{percentage.toFixed(1)}%</span>
                        <span className="text-gray-900 font-bold min-w-[45px] xs:min-w-[60px] text-right">
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 xs:h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Questions by Difficulty */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg xs:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-3 xs:p-4 sm:p-6 hover:shadow-xl md:hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-3 xs:mb-4 sm:mb-6 gap-2">
              <h2 className="text-sm xs:text-base sm:text-xl font-bold text-gray-900 truncate">
                Difficulty Distribution
              </h2>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-1.5 xs:p-2 rounded-lg flex-shrink-0">
                <Award className="text-white w-4 h-4 xs:w-5 xs:h-5" />
              </div>
            </div>
            
            <div className="space-y-2 xs:space-y-3 sm:space-y-4">
              {stats?.questionsByDifficulty.map((item, index) => {
                const percentage = (item._count / (stats?.totalQuestions || 1)) * 100;
                const colorScheme = difficultyColors[item.difficulty as keyof typeof difficultyColors];
                
                return (
                  <motion.div
                    key={item.difficulty}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`${colorScheme.light} rounded-lg xs:rounded-xl p-2.5 xs:p-3 sm:p-4 hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center justify-between mb-2 xs:mb-3 gap-2 flex-wrap">
                      <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1">
                        <div className={`w-2 h-2 xs:w-3 xs:h-3 rounded-full bg-gradient-to-r ${colorScheme.bg} flex-shrink-0`} />
                        <span className={`font-bold ${colorScheme.text} capitalize text-xs xs:text-sm`}>
                          {item.difficulty.toLowerCase()}
                        </span>
                      </div>
                      <span className={`text-lg xs:text-xl sm:text-2xl font-bold ${colorScheme.text} flex-shrink-0`}>
                        {item._count.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 h-1.5 xs:h-2 bg-white rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                          className={`h-full bg-gradient-to-r ${colorScheme.bg} rounded-full`}
                        />
                      </div>
                      <span className={`text-xs xs:text-sm font-semibold ${colorScheme.text} flex-shrink-0 min-w-[40px] text-right`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg xs:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 xs:p-6 sm:p-8 text-white"
        >
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-3 xs:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-lg xs:rounded-xl p-3 xs:p-4 text-left"
            >
              <FileQuestion className="mb-1 xs:mb-2 w-5 h-5 xs:w-6 xs:h-6" />
              <p className="font-semibold text-xs xs:text-sm sm:text-base truncate">Add Question</p>
              <p className="text-xs text-indigo-100">Single question</p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-lg xs:rounded-xl p-3 xs:p-4 text-left"
            >
              <List className="mb-1 xs:mb-2 w-5 h-5 xs:w-6 xs:h-6" />
              <p className="font-semibold text-xs xs:text-sm sm:text-base truncate">Bulk Import</p>
              <p className="text-xs text-indigo-100">Upload CSV</p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-lg xs:rounded-xl p-3 xs:p-4 text-left xs:col-span-2 lg:col-span-1"
            >
              <Users className="mb-1 xs:mb-2 w-5 h-5 xs:w-6 xs:h-6" />
              <p className="font-semibold text-xs xs:text-sm sm:text-base truncate">Manage Topics</p>
              <p className="text-xs text-indigo-100">Organize content</p>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}