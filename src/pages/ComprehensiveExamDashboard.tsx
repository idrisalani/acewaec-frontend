// frontend/src/components/comprehensive-exam/ComprehensiveExamDashboard.mobile.tsx
// ✅ Mobile-optimized exam dashboard with responsive layouts

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  Lock,
  Play,
  CheckCircle,
  XCircle,
  Award,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { comprehensiveExamService, type ComprehensiveExam, type ExamDay } from '../services/comprehensiveExam.service';

export default function ComprehensiveExamDashboard() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ComprehensiveExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingDay, setStartingDay] = useState<number | null>(null);

  const loadExam = useCallback(async () => {
    try {
      if (!examId) {
        setError('Exam ID is required');
        return;
      }
      const data = await comprehensiveExamService.getExam(examId);
      setExam(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load exam:', err);
      setError('Failed to load exam. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  const handleStartDay = async (dayNumber: number) => {
    if (!examId) return;
    
    try {
      setStartingDay(dayNumber);
      const result = await comprehensiveExamService.startDay(examId, dayNumber);
      localStorage.setItem('currentPracticeSession', JSON.stringify(result));
      navigate(`/practice/${result.session.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start day';
      setError(message);
      setStartingDay(null);
    }
  };

  const getDayIcon = (status: ExamDay['status']) => {
    switch (status) {
      case 'COMPLETED': 
        return <CheckCircle className="text-green-600" size={20} />;
      case 'MISSED': 
        return <XCircle className="text-red-600" size={20} />;
      case 'IN_PROGRESS': 
        return <Clock className="text-blue-600" size={20} />;
      case 'AVAILABLE': 
        return <Play className="text-indigo-600" size={20} />;
      case 'LOCKED': 
        return <Lock className="text-gray-400" size={20} />;
      default: 
        return null;
    }
  };

  const getDayBg = (status: ExamDay['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-50 border-green-200';
      case 'MISSED': return 'bg-red-50 border-red-200';
      case 'IN_PROGRESS': return 'bg-blue-50 border-blue-200';
      case 'AVAILABLE': return 'bg-indigo-50 border-indigo-200';
      case 'LOCKED': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: ExamDay['status']) => {
    const badges = {
      COMPLETED: { text: '✓ Completed', bg: 'bg-green-100 text-green-700' },
      MISSED: { text: 'Missed', bg: 'bg-red-100 text-red-700' },
      IN_PROGRESS: { text: 'In Progress', bg: 'bg-blue-100 text-blue-700' },
      AVAILABLE: { text: 'Available', bg: 'bg-indigo-100 text-indigo-700' },
      LOCKED: { text: 'Locked', bg: 'bg-gray-100 text-gray-700' }
    };
    const badge = badges[status] || badges.LOCKED;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.bg}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={32} />
          <p className="text-gray-600 mb-4 text-sm">
            {error || 'Exam not found'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const completedDays = exam.examDays.filter(d => d.status === 'COMPLETED').length;
  const isCompleted = exam.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 sm:mb-6 text-sm font-medium"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Header - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 break-words">
                {exam.subjects?.length ? `${exam.subjects.length}-Day Exam` : '7-Day Exam'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                WAEC Comprehensive Examination
              </p>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium flex-shrink-0">
                <Award size={18} />
                <span>Completed</span>
              </div>
            )}
          </div>

          {/* Progress Stats - Mobile Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Progress</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900">
                {completedDays}/{exam.totalDays}
              </p>
              <p className="text-xs text-blue-700 mt-1">Days done</p>
            </div>
            <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
              <p className="text-xs sm:text-sm text-indigo-600 font-medium mb-1">Current</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-900">
                Day {exam.currentDay}
              </p>
              <p className="text-xs text-indigo-700 mt-1">Active</p>
            </div>
            <div className={`p-3 sm:p-4 bg-gradient-to-br rounded-lg border-2 ${
              exam.overallScore && exam.overallScore >= 50
                ? 'from-green-50 to-green-100 border-green-200'
                : exam.overallScore ? 'from-red-50 to-red-100 border-red-200' : 'from-gray-50 to-gray-100 border-gray-200'
            }`}>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Score</p>
              <p className={`text-xl sm:text-2xl font-bold ${
                exam.overallScore && exam.overallScore >= 50 ? 'text-green-900' : exam.overallScore ? 'text-red-900' : 'text-gray-600'
              }`}>
                {exam.overallScore ? `${Number(exam.overallScore).toFixed(0)}%` : 'N/A'}
              </p>
              <p className="text-xs text-gray-600 mt-1">{exam.correctAnswers}/{exam.totalQuestions}</p>
            </div>
            <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <p className="text-xs sm:text-sm text-purple-600 font-medium mb-1">Started</p>
              <p className="text-xs sm:text-sm font-bold text-purple-900 break-words">
                {new Date(exam.startDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs text-purple-700 mt-1">Start date</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Days Grid - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-4">
          {exam.examDays.map((day) => (
            <div
              key={day.id}
              className={`bg-white rounded-lg shadow border-2 ${getDayBg(day.status)} p-3 sm:p-4 transition-all`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                {/* Day Icon */}
                <div className="flex-shrink-0">
                  {getDayIcon(day.status)}
                </div>

                {/* Day Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                      Day {day.dayNumber}
                    </h3>
                    {day.subject && (
                      <span className="text-sm text-gray-600 font-medium break-words">
                        {day.subject.name}
                      </span>
                    )}
                    <div className="flex-shrink-0">
                      {getStatusBadge(day.status)}
                    </div>
                  </div>

                  {/* Stats Grid - Mobile Optimized */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-sm mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Questions</p>
                      <p className="font-semibold text-gray-900">{day.totalQuestions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Duration</p>
                      <p className="font-semibold text-gray-900">3 hrs</p>
                    </div>
                    {day.status === 'COMPLETED' && (
                      <>
                        <div>
                          <p className="text-xs text-gray-600">Score</p>
                          <p className={`font-semibold ${day.score && day.score >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                            {day.score ? `${Number(day.score).toFixed(0)}%` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Correct</p>
                          <p className="font-semibold text-gray-900">{day.correctAnswers}/{day.totalQuestions}</p>
                        </div>
                      </>
                    )}
                    {day.status === 'AVAILABLE' && (
                      <div className="col-span-2 sm:col-span-2">
                        <p className="text-xs text-gray-600">Deadline</p>
                        <p className="font-semibold text-orange-600">24 hrs</p>
                      </div>
                    )}
                  </div>

                  {/* Completed Date */}
                  {day.completedAt && (
                    <p className="text-xs text-gray-500">
                      ✓ {new Date(day.completedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>

                {/* Action Button - Mobile Friendly */}
                <div className="flex-shrink-0 w-full sm:w-auto">
                  {day.status === 'AVAILABLE' && (
                    <button
                      onClick={() => handleStartDay(day.dayNumber)}
                      disabled={startingDay === day.dayNumber}
                      className="w-full sm:w-auto bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Play size={16} />
                      {startingDay === day.dayNumber ? 'Starting...' : 'Start'}
                    </button>
                  )}
                  {day.status === 'COMPLETED' && (
                    <button
                      onClick={() => navigate(`/comprehensive-exam/${examId}/results`)}
                      className="w-full sm:w-auto text-indigo-600 hover:text-indigo-700 font-medium text-sm py-2"
                    >
                      View Details →
                    </button>
                  )}
                  {day.status === 'LOCKED' && (
                    <div className="text-sm text-gray-500 flex items-center justify-center gap-1 py-2">
                      <Lock size={14} />
                      <span className="text-xs sm:text-sm">Complete previous</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certificate Section - Mobile Optimized */}
        {isCompleted && (
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-4 sm:p-8 text-white text-center">
            <Award className="mx-auto mb-3 sm:mb-4" size={40} />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Congratulations! 🎉</h2>
            <p className="text-sm sm:text-base mb-4 px-2">
              You've completed the Comprehensive Exam with a score of{' '}
              <span className="font-bold">
                {exam.overallScore ? `${Number(exam.overallScore).toFixed(1)}%` : 'N/A'}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <button
                onClick={() => navigate(`/comprehensive-exam/${examId}/results`)}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 font-medium text-sm sm:text-base transition-colors"
              >
                View Full Results
              </button>
              {exam.certificateIssued && (
                <button
                  onClick={() => window.open(exam.certificateUrl!, '_blank')}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 active:bg-yellow-700 font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-colors"
                >
                  <Award size={16} />
                  Certificate
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="mt-6 sm:mt-8 text-center pb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}