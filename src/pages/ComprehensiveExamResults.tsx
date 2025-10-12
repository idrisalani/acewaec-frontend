import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react';
import { comprehensiveExamService } from '../services/comprehensiveExam.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PDFService } from '../services/pdf.service';
import { useAuth } from '../context/AuthContext';

interface QuestionResult {
  id: string;
  content: string;
  difficulty: string;
  subject: { name: string };
  options: Array<{
    label: string;
    content: string;
    isCorrect: boolean;
  }>;
  userAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

interface ExamResults {
  id: string;
  name: string;
  overallScore: number;
  totalQuestions: number;
  correctAnswers: number;
  status: string;
  certificateIssued: boolean;
  certificateUrl?: string;
  completedAt?: Date;  // ADD THIS LINE
  examDays: Array<{
    dayNumber: number;
    subject: { name: string; code: string };
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    status: string;
    session?: {
      practiceAnswers: Array<{
        question: QuestionResult;
        selectedAnswer: string;
        isCorrect: boolean;
      }>;
    };
  }>;
}

export default function ComprehensiveExamResults() {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<ExamResults | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadResults = useCallback(async () => {
    try {
      const data = await comprehensiveExamService.getResults(examId!);
      setResults(data);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Failed to load results</p>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    if (!results || !user) return;

    PDFService.generateComprehensiveExamReport(
      {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        studentCategory: user.studentCategory || 'Not Set',
        avatar: user.avatar
      },
      {
        examName: results.name,
        overallScore: Number(results.overallScore || 0),
        completionDate: results.completedAt || new Date(),
        examDays: results.examDays.filter(d => d.status === 'COMPLETED')
      }
    );
  };

  const completedDays = results.examDays.filter(d => d.status === 'COMPLETED');
  const chartData = completedDays.map(day => ({
    name: `Day ${day.dayNumber}`,
    score: Number(day.score || 0),
    subject: day.subject.name
  }));

  const getGrade = (score: number) => {
    if (score >= 75) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 65) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 40) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const overallGrade = getGrade(Number(results.overallScore || 0));
  const bestDay = completedDays.reduce((best, day) =>
    (day.score || 0) > (best.score || 0) ? day : best
    , completedDays[0]);
  const worstDay = completedDays.reduce((worst, day) =>
    (day.score || 0) < (worst.score || 0) ? day : worst
    , completedDays[0]);

  const selectedDayData = selectedDay
    ? results.examDays.find(d => d.dayNumber === selectedDay)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button
            onClick={() => navigate(`/comprehensive-exam/${examId}`)}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Exam
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Download size={18} />
            Download PDF Report
          </button>
        </div>

        {/* Overall Summary */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${overallGrade.bg}`}>
              <span className={`text-5xl font-bold ${overallGrade.color}`}>
                {overallGrade.grade}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Comprehensive Exam Results
            </h1>
            <p className="text-xl text-gray-600">
              Overall Score: {Number(results.overallScore || 0).toFixed(1)}%
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Target className="mx-auto mb-2 text-indigo-600" size={24} />
              <p className="text-2xl font-bold text-gray-900">
                {results.correctAnswers}/{results.totalQuestions}
              </p>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
              <p className="text-2xl font-bold text-gray-900">{completedDays.length}</p>
              <p className="text-sm text-gray-600">Days Completed</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="mx-auto mb-2 text-green-600" size={24} />
              <p className="text-lg font-bold text-gray-900">{bestDay?.subject.name}</p>
              <p className="text-sm text-gray-600">Best: {Number(bestDay?.score || 0).toFixed(0)}%</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <TrendingDown className="mx-auto mb-2 text-red-600" size={24} />
              <p className="text-lg font-bold text-gray-900">{worstDay?.subject.name}</p>
              <p className="text-sm text-gray-600">Lowest: {Number(worstDay?.score || 0).toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                        <p className="font-semibold">{payload[0].payload.subject}</p>
                        <p className="text-sm">Score: {payload[0].value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Day-by-Day Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Day-by-Day Results</h2>
          <div className="space-y-3">
            {results.examDays.map((day) => {
              const dayGrade = getGrade(Number(day.score || 0));
              return (
                <div
                  key={day.dayNumber}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dayGrade.bg}`}>
                        <span className={`text-xl font-bold ${dayGrade.color}`}>
                          {dayGrade.grade}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Day {day.dayNumber}: {day.subject.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>Score: {Number(day.score || 0).toFixed(1)}%</span>
                          <span>•</span>
                          <span>{day.correctAnswers}/{day.totalQuestions} correct</span>
                          {day.timeSpent > 0 && (
                            <>
                              <span>•</span>
                              <span>{Math.floor(day.timeSpent / 60)} minutes</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {day.status === 'COMPLETED' && day.session && (
                      <button
                        onClick={() => setSelectedDay(selectedDay === day.dayNumber ? null : day.dayNumber)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                      >
                        {selectedDay === day.dayNumber ? 'Hide' : 'View'} Questions →
                      </button>
                    )}
                  </div>

                  {/* Question Review for Selected Day */}
                  {selectedDay === day.dayNumber && selectedDayData?.session && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <h4 className="font-semibold text-gray-900">Question Review</h4>
                      {selectedDayData.session.practiceAnswers.map((answer, idx) => {
                        const question = answer.question;
                        const correctOption = question.options.find(opt => opt.isCorrect);

                        return (
                          <div
                            key={question.id}
                            className={`p-3 rounded-lg border ${answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                              }`}
                          >
                            <div className="flex items-start gap-2">
                              {answer.isCorrect ? (
                                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={18} />
                              ) : (
                                <XCircle className="text-red-600 flex-shrink-0 mt-1" size={18} />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  Q{idx + 1}. {question.content}
                                </p>
                                <div className="text-xs space-y-1">
                                  <p>
                                    <span className="text-gray-600">Your answer:</span>{' '}
                                    <span className={answer.isCorrect ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                                      {answer.selectedAnswer || 'Not answered'}
                                    </span>
                                  </p>
                                  {!answer.isCorrect && correctOption && (
                                    <p>
                                      <span className="text-gray-600">Correct answer:</span>{' '}
                                      <span className="text-green-700 font-semibold">
                                        {correctOption.label}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-3">Recommendations</h2>
          <ul className="space-y-2 text-blue-800">
            {Number(results.overallScore) >= 75 ? (
              <>
                <li>• Excellent performance! You're well-prepared for WAEC.</li>
                <li>• Continue regular practice to maintain this level.</li>
                <li>• Focus on speed and time management in the actual exam.</li>
              </>
            ) : Number(results.overallScore) >= 50 ? (
              <>
                <li>• Good effort! You're on the right track.</li>
                <li>• Review topics from your weakest subjects: {worstDay?.subject.name}</li>
                <li>• Practice more questions in challenging areas.</li>
                <li>• Consider getting tutoring support for difficult topics.</li>
              </>
            ) : (
              <>
                <li>• More intensive preparation needed before WAEC.</li>
                <li>• Focus heavily on: {worstDay?.subject.name}</li>
                <li>• Review WAEC syllabus thoroughly for all subjects.</li>
                <li>• Strongly consider tutoring or study group support.</li>
                <li>• Take another comprehensive exam in 2-3 weeks to track improvement.</li>
              </>
            )}
          </ul>
        </div>

        {/* Certificate Section */}
        {results.status === 'COMPLETED' && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center">
            <Award className="mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold mb-2">Certificate of Completion</h2>
            <p className="mb-6">
              You have successfully completed the 7-Day Comprehensive WAEC Examination
            </p>
            <div className="flex gap-4 justify-center">
              {results.certificateIssued && results.certificateUrl ? (
                <button
                  onClick={() => window.open(results.certificateUrl!, '_blank')}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-gray-100 font-medium flex items-center gap-2"
                >
                  <Download size={20} />
                  Download Certificate
                </button>
              ) : (
                <button
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 font-medium"
                  onClick={() => alert('Certificate generation coming soon!')}
                >
                  Generate Certificate
                </button>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center print:hidden">
          <button
            onClick={() => navigate('/comprehensive-exam/setup')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
          >
            Take Another Exam
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}