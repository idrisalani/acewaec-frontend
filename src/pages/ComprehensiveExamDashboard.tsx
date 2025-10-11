import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  Lock,
  Play,
  CheckCircle,
  XCircle,
  Award
} from 'lucide-react';
import { comprehensiveExamService } from '../services/comprehensiveExam.service';

interface ExamDay {
  id: string;
  dayNumber: number;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
  subject: { name: string; code: string };
  startedAt: Date | null;
  completedAt: Date | null;
  score: number | null;
  correctAnswers: number;
  totalQuestions: number;
}

interface Exam {
  id: string;
  name: string;
  status: string;
  startDate: Date;
  currentDay: number;
  totalDays: number;
  totalQuestions: number;
  correctAnswers: number;
  overallScore: number | null;
  certificateIssued: boolean;
  certificateUrl?: string;
  examDays: ExamDay[];
}

export default function ComprehensiveExamDashboard() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);


  const loadExam = useCallback(async () => {
    try {
      const data = await comprehensiveExamService.getExam(examId!);
      setExam(data);
    } catch (error) {
      console.error('Failed to load exam:', error);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  const handleStartDay = async (dayNumber: number) => {
    try {
      const result = await comprehensiveExamService.startDay(examId!, dayNumber);

      // Store session data and navigate to practice
      localStorage.setItem('currentPracticeSession', JSON.stringify(result));
      navigate(`/practice/${result.session.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start day';
      alert(message);
    }
  };

  const getDayIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="text-green-600" size={24} />;
      case 'MISSED': return <XCircle className="text-red-600" size={24} />;
      case 'IN_PROGRESS': return <Clock className="text-blue-600" size={24} />;
      case 'AVAILABLE': return <Play className="text-indigo-600" size={24} />;
      case 'LOCKED': return <Lock className="text-gray-400" size={24} />;
      default: return null;
    }
  };

  const getDayBg = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-50 border-green-200';
      case 'MISSED': return 'bg-red-50 border-red-200';
      case 'IN_PROGRESS': return 'bg-blue-50 border-blue-200';
      case 'AVAILABLE': return 'bg-indigo-50 border-indigo-200';
      case 'LOCKED': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      COMPLETED: { text: 'Completed', bg: 'bg-green-100 text-green-700' },
      MISSED: { text: 'Missed', bg: 'bg-red-100 text-red-700' },
      IN_PROGRESS: { text: 'In Progress', bg: 'bg-blue-100 text-blue-700' },
      AVAILABLE: { text: 'Available', bg: 'bg-indigo-100 text-indigo-700' },
      LOCKED: { text: 'Locked', bg: 'bg-gray-100 text-gray-700' }
    };
    const badge = badges[status as keyof typeof badges] || badges.LOCKED;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badge.bg}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Exam not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const completedDays = exam.examDays.filter(d => d.status === 'COMPLETED').length;
  const isCompleted = exam.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.name}</h1>
              <p className="text-gray-600">
                7-Day Comprehensive WAEC Examination
              </p>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                <Award size={20} />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedDays}/{exam.totalDays}
              </p>
              <p className="text-xs text-gray-500">Days completed</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Current Day</p>
              <p className="text-2xl font-bold text-indigo-600">
                Day {exam.currentDay}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Overall Score</p>
              <p className={`text-2xl font-bold ${exam.overallScore
                ? exam.overallScore >= 50 ? 'text-green-600' : 'text-red-600'
                : 'text-gray-400'
                }`}>
                {exam.overallScore ? `${Number(exam.overallScore).toFixed(0)}%` : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                {exam.correctAnswers}/{exam.totalQuestions}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Started</p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(exam.startDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">Start date</p>
            </div>
          </div>
        </div>

        {/* Days Grid */}
        <div className="space-y-4">
          {exam.examDays.map((day) => (
            <div
              key={day.id}
              className={`bg-white rounded-lg shadow-md border-2 ${getDayBg(day.status)} p-6`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {getDayIcon(day.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        Day {day.dayNumber}: {day.subject.name}
                      </h3>
                      {getStatusBadge(day.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Questions</p>
                        <p className="font-semibold text-gray-900">
                          {day.totalQuestions}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-semibold text-gray-900">3 hours</p>
                      </div>
                      {day.status === 'COMPLETED' && (
                        <>
                          <div>
                            <p className="text-gray-600">Score</p>
                            <p className={`font-semibold ${day.score && day.score >= 50 ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {day.score ? `${Number(day.score).toFixed(0)}%` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Correct</p>
                            <p className="font-semibold text-gray-900">
                              {day.correctAnswers}/{day.totalQuestions}
                            </p>
                          </div>
                        </>
                      )}
                      {day.status === 'AVAILABLE' && (
                        <div className="col-span-2">
                          <p className="text-gray-600">Deadline</p>
                          <p className="font-semibold text-orange-600">
                            24 hours from start
                          </p>
                        </div>
                      )}
                    </div>

                    {day.completedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Completed: {new Date(day.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  {day.status === 'AVAILABLE' && (
                    <button
                      onClick={() => handleStartDay(day.dayNumber)}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <Play size={18} />
                      Start Day {day.dayNumber}
                    </button>
                  )}
                  {day.status === 'COMPLETED' && (
                    <button
                      onClick={() => navigate(`/comprehensive-exam/${examId}/results`)}
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                      View Details →
                    </button>
                  )}
                  {day.status === 'LOCKED' && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Lock size={16} />
                      Complete previous days
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certificate Section */}
        {isCompleted && (
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center">
            <Award className="mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="mb-4">
              You've completed the 7-Day Comprehensive Exam with a score of{' '}
              {exam.overallScore ? `${Number(exam.overallScore).toFixed(1)}%` : 'N/A'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(`/comprehensive-exam/${examId}/results`)}
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-gray-100 font-medium"
              >
                View Full Results
              </button>
              {exam.certificateIssued && (
                <button
                  onClick={() => window.open(exam.certificateUrl!, '_blank')}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 font-medium flex items-center gap-2"
                >
                  <Award size={20} />
                  Download Certificate
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}