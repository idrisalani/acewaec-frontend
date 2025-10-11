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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your question bank.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                  <motion.span 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-green-600 text-sm font-semibold bg-green-100 px-2 py-1 rounded-full"
                  >
                    {stat.change}
                  </motion.span>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-4xl font-bold text-gray-900"
                >
                  {stat.value.toLocaleString()}
                </motion.p>
              </div>
              
              {/* Decorative element */}
              <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl`} />
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Questions by Subject */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Questions by Subject</h2>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
                <TrendingUp className="text-white" size={20} />
              </div>
            </div>
            
            <div className="space-y-4">
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium group-hover:text-indigo-600 transition-colors">
                        {item.subject}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                        <span className="text-gray-900 font-bold min-w-[60px] text-right">
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Difficulty Distribution</h2>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <Award className="text-white" size={20} />
              </div>
            </div>
            
            <div className="space-y-4">
              {stats?.questionsByDifficulty.map((item, index) => {
                const percentage = (item._count / (stats?.totalQuestions || 1)) * 100;
                const colorScheme = difficultyColors[item.difficulty as keyof typeof difficultyColors];
                
                return (
                  <motion.div
                    key={item.difficulty}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`${colorScheme.light} rounded-xl p-4 hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorScheme.bg}`} />
                        <span className={`font-bold ${colorScheme.text} capitalize`}>
                          {item.difficulty.toLowerCase()}
                        </span>
                      </div>
                      <span className={`text-2xl font-bold ${colorScheme.text}`}>
                        {item._count.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1 h-2 bg-white rounded-full overflow-hidden mr-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                          className={`h-full bg-gradient-to-r ${colorScheme.bg} rounded-full`}
                        />
                      </div>
                      <span className={`text-sm font-semibold ${colorScheme.text}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-xl p-4 text-left"
            >
              <FileQuestion size={24} className="mb-2" />
              <p className="font-semibold">Add New Question</p>
              <p className="text-sm text-indigo-100">Create a single question</p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-xl p-4 text-left"
            >
              <List size={24} className="mb-2" />
              <p className="font-semibold">Bulk Import</p>
              <p className="text-sm text-indigo-100">Upload CSV file</p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-xl p-4 text-left"
            >
              <Users size={24} className="mb-2" />
              <p className="font-semibold">Manage Topics</p>
              <p className="text-sm text-indigo-100">Organize content</p>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}