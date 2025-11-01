import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  XCircle,
  Download,
  ArrowLeft
} from 'lucide-react';
import { comprehensiveExamService } from '../services/comprehensiveExam.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PDFService } from '../services/pdf.service';
import { useAuth } from '../context';

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
  completedAt?: Date;
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
  const [error, setError] = useState<string | null>(null);

    const loadResults = useCallback(async () => {
    try {
      setError(null);
      const data = await comprehensiveExamService.getResults(examId!);
      
      // ✅ FIX: Transform/validate the data to ensure it matches ExamResults interface
      // Maps ComprehensiveExam from service to ExamResults component type
      const examResults: ExamResults = {
        id: data.id,
        // ComprehensiveExam doesn't have 'name', generate from subjects or use default
        name: `Comprehensive Exam - ${data.subjects?.join(', ') || 'WAEC'}`,
        overallScore: data.overallScore || 0,
        totalQuestions: data.totalQuestions || 0,
        correctAnswers: data.correctAnswers || 0,
        status: data.status || 'NOT_STARTED',
        certificateIssued: data.certificateIssued || false,
        certificateUrl: data.certificateUrl,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        // Transform examDays to include subject info and match ExamResults.examDays type
        examDays: (data.examDays || []).map(day => ({
          dayNumber: day.dayNumber,
          subject: day.subject || { name: 'Unknown Subject', code: 'UNKNOWN' },
          score: day.score || 0,
          correctAnswers: day.correctAnswers || 0,
          totalQuestions: day.totalQuestions || 0,
          timeSpent: day.timeSpent || 0,
          status: day.status || 'LOCKED',
          // session will be populated later if available
          session: undefined
        })),
      };
      
      setResults(examResults);
    } catch (err) {
      console.error('Failed to load results:', err);
      setError('Failed to load exam results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 text-red-600" size={40} />
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {error || 'Failed to load results'}
          </p>
          <button
            onClick={() => navigate(`/comprehensive-exam/${examId}`)}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            ← Back to Exam
          </button>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-2 sm:py-4 md:py-8">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
        {/* Header Actions - Mobile Optimized */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3 mb-3 xs:mb-4 sm:mb-6 print:hidden px-2 sm:px-0">
          <button
            onClick={() => navigate(`/comprehensive-exam/${examId}`)}
            className="flex items-center justify-center xs:justify-start gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium text-xs sm:text-sm md:text-base px-3 py-2 rounded-lg transition-all active:bg-indigo-100"
          >
            <ArrowLeft size={16} className="flex-shrink-0" />
            <span className="hidden xs:inline">Back</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-all shadow-md hover:shadow-lg"
          >
            <Download size={16} className="flex-shrink-0" />
            <span className="whitespace-nowrap">PDF Report</span>
          </button>
        </div>

        {/* Overall Summary - Mobile Optimized */}
        <div className="bg-white rounded-xl shadow-md sm:shadow-lg p-3 xs:p-4 sm:p-6 lg:p-8 mb-3 xs:mb-4 sm:mb-6 lg:mb-8 mx-2 sm:mx-0 border border-gray-100">
          <div className="text-center mb-3 xs:mb-4 sm:mb-6">
            {/* Grade Circle */}
            <div className={`w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto rounded-full flex items-center justify-center mb-2 xs:mb-3 sm:mb-4 shadow-md ${overallGrade.bg}`}>
              <span className={`text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold ${overallGrade.color}`}>
                {overallGrade.grade}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 xs:mb-1.5 sm:mb-2 px-2 line-clamp-2">
              {results.name}
            </h1>
            <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-gray-600 mb-3 xs:mb-4">
              {Number(results.overallScore || 0).toFixed(1)}% Overall
            </p>
          </div>

          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4 px-1 sm:px-0">
            {/* Correct Answers */}
            <div className="text-center p-2 xs:p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200 hover:shadow-md transition-shadow">
              <Target className="mx-auto mb-1.5 xs:mb-2 text-indigo-600 flex-shrink-0" size={18} />
              <p className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                {results.correctAnswers}
              </p>
              <p className="text-xs text-gray-600 mt-0.5 xs:mt-1">
                /{results.totalQuestions}
              </p>
              <p className="text-xs text-gray-500 font-medium">Correct</p>
            </div>

            {/* Days Completed */}
            <div className="text-center p-2 xs:p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
              <CheckCircle className="mx-auto mb-1.5 xs:mb-2 text-green-600 flex-shrink-0" size={18} />
              <p className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                {completedDays.length}
              </p>
              <p className="text-xs text-gray-600 mt-0.5 xs:mt-1">of {results.examDays.length}</p>
              <p className="text-xs text-gray-500 font-medium">Days</p>
            </div>

            {/* Best Performance */}
            {bestDay && (
              <div className="text-center p-2 xs:p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 hover:shadow-md transition-shadow">
                <TrendingUp className="mx-auto mb-1.5 xs:mb-2 text-emerald-600 flex-shrink-0" size={18} />
                <p className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-emerald-900">
                  {bestDay ? Number(bestDay.score || 0).toFixed(0) : '-'}%
                </p>
                <p className="text-xs text-emerald-700 mt-0.5 xs:mt-1 font-medium">Best</p>
                {bestDay && (
                  <p className="text-xs text-emerald-600 truncate font-medium">Day {bestDay.dayNumber}</p>
                )}
              </div>
            )}

            {/* Worst Performance */}
            {worstDay && (
              <div className="text-center p-2 xs:p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                <TrendingDown className="mx-auto mb-1.5 xs:mb-2 text-orange-600 flex-shrink-0" size={18} />
                <p className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-orange-900">
                  {worstDay ? Number(worstDay.score || 0).toFixed(0) : '-'}%
                </p>
                <p className="text-xs text-orange-700 mt-0.5 xs:mt-1 font-medium">Weakest</p>
                {worstDay && (
                  <p className="text-xs text-orange-600 truncate font-medium">Day {worstDay.dayNumber}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Performance Chart - Mobile Optimized */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md sm:shadow-lg p-3 xs:p-4 sm:p-6 mb-3 xs:mb-4 sm:mb-6 lg:mb-8 mx-2 sm:mx-0 border border-gray-100 overflow-x-auto">
            <h2 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4 px-2 sm:px-0">
              Score Trend
            </h2>
            <div className="w-full h-48 xs:h-56 sm:h-72 lg:h-80 -mx-3 xs:-mx-4 sm:mx-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 sm:p-3 border border-gray-200 rounded shadow-lg">
                            <p className="font-semibold text-xs sm:text-sm">{payload[0].payload.subject}</p>
                            <p className="text-xs sm:text-sm">Score: {payload[0].value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Day-by-Day Breakdown - Mobile Optimized */}
        <div className="bg-white rounded-xl shadow-md sm:shadow-lg p-3 xs:p-4 sm:p-6 mb-3 xs:mb-4 sm:mb-6 lg:mb-8 mx-2 sm:mx-0 border border-gray-100">
          <h2 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4 px-2 sm:px-0">
            Daily Results
          </h2>
          <div className="space-y-2 xs:space-y-3">
            {results.examDays.map((day) => {
              const dayGrade = getGrade(Number(day.score || 0));
              const isSelected = selectedDay === day.dayNumber;

              return (
                <div
                  key={day.dayNumber}
                  className={`border rounded-lg p-2 xs:p-3 sm:p-4 transition-all ${
                    isSelected ? 'border-indigo-300 bg-indigo-50 shadow-md' : 'border-gray-200 hover:shadow-md hover:border-gray-300'
                  }`}
                >
                  {/* Day Header - Responsive Layout */}
                  <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
                    {/* Left Section */}
                    <div className="flex items-start gap-2 xs:gap-3 flex-1 min-w-0">
                      {/* Grade Badge */}
                      <div className={`w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm xs:text-base font-bold shadow-sm ${dayGrade.bg} ${dayGrade.color}`}>
                        {dayGrade.grade}
                      </div>

                      {/* Day Info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-xs xs:text-sm sm:text-base text-gray-900 break-words">
                          Day {day.dayNumber}: {day.subject.name}
                        </h3>
                        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs sm:text-sm text-gray-600 mt-0.5 xs:mt-1">
                          <span className="font-medium">{Number(day.score || 0).toFixed(1)}%</span>
                          <span className="hidden xs:inline">•</span>
                          <span>{day.correctAnswers}/{day.totalQuestions}</span>
                          {day.timeSpent > 0 && (
                            <>
                              <span className="hidden xs:inline">•</span>
                              <span>{Math.floor(day.timeSpent / 60)}m</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Toggle Button */}
                    {day.status === 'COMPLETED' && day.session && (
                      <button
                        onClick={() => setSelectedDay(isSelected ? null : day.dayNumber)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-xs sm:text-sm whitespace-nowrap px-2 py-1 rounded hover:bg-indigo-50 transition-all"
                      >
                        {isSelected ? '▲ Hide' : '▼ View'}
                      </button>
                    )}
                  </div>

                  {/* Question Review - Expanded Mobile View */}
                  {isSelected && selectedDayData?.session && (
                    <div className="mt-2 xs:mt-3 pt-2 xs:pt-3 border-t border-gray-200 space-y-1.5 xs:space-y-2">
                      <h4 className="font-semibold text-xs xs:text-sm text-gray-900">Review</h4>
                      <div className="space-y-1.5 xs:space-y-2 max-h-80 overflow-y-auto">
                        {selectedDayData.session.practiceAnswers.map((answer, idx) => {
                          const question = answer.question;
                          const correctOption = question.options.find(opt => opt.isCorrect);

                          return (
                            <div
                              key={question.id}
                              className={`p-2 xs:p-2.5 sm:p-3 rounded border text-xs sm:text-sm ${
                                answer.isCorrect 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <div className="flex gap-1.5 xs:gap-2">
                                {answer.isCorrect ? (
                                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                                ) : (
                                  <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={14} />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900 mb-0.5 xs:mb-1 break-words text-xs xs:text-sm">
                                    Q{idx + 1}. {question.content}
                                  </p>
                                  <div className="space-y-0.5 text-xs">
                                    <p className="text-gray-600">
                                      <span>Your: </span>
                                      <span className={answer.isCorrect ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                                        {answer.selectedAnswer || 'N/A'}
                                      </span>
                                    </p>
                                    {!answer.isCorrect && correctOption && (
                                      <p className="text-gray-600">
                                        <span>Correct: </span>
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations - Mobile Optimized */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-3 xs:p-4 sm:p-6 mb-3 xs:mb-4 sm:mb-6 lg:mb-8 mx-2 sm:mx-0">
          <h2 className="text-sm xs:text-base sm:text-lg font-bold text-blue-900 mb-2 xs:mb-3">
            📋 Next Steps
          </h2>
          <ul className="space-y-1 xs:space-y-1.5 sm:space-y-2 text-xs xs:text-sm sm:text-sm text-blue-800">
            {Number(results.overallScore) >= 75 ? (
              <>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 font-bold">✓</span>
                  <span>Excellent performance! Well-prepared for WAEC.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 font-bold">✓</span>
                  <span>Continue regular practice to maintain this level.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 font-bold">✓</span>
                  <span>Focus on speed and time management.</span>
                </li>
              </>
            ) : Number(results.overallScore) >= 50 ? (
              <>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 font-bold">✓</span>
                  <span>Good effort! You're on the right track.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 font-bold">✓</span>
                  <span>Review weakest subject: {worstDay?.subject.name}</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 font-bold">✓</span>
                  <span>Practice more challenging questions.</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 font-bold">!</span>
                  <span>Intensive preparation needed.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 font-bold">!</span>
                  <span>Focus on: {worstDay?.subject.name}</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 font-bold">!</span>
                  <span>Consider tutoring or study groups.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 font-bold">!</span>
                  <span>Retake exam in 2-3 weeks.</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Certificate Section - Mobile Optimized */}
        {results.status === 'COMPLETED' && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 lg:p-8 text-white text-center mb-3 xs:mb-4 sm:mb-6 lg:mb-8 mx-2 sm:mx-0">
            <Award className="mx-auto mb-2 xs:mb-3 sm:mb-4" size={32} />
            <h2 className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold mb-1 xs:mb-1.5 sm:mb-2">
              🎓 Certificate
            </h2>
            <p className="text-xs xs:text-sm sm:text-sm mb-3 xs:mb-4 px-2">
              Completed the 7-Day Comprehensive WAEC Examination
            </p>
            <div className="flex gap-2 sm:gap-3 justify-center flex-wrap px-2">
              {results.certificateIssued && results.certificateUrl ? (
                <button
                  onClick={() => window.open(results.certificateUrl!, '_blank')}
                  className="bg-white text-indigo-600 px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
                >
                  <Download size={16} className="flex-shrink-0" />
                  <span>Download</span>
                </button>
              ) : (
                <button
                  className="bg-yellow-400 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-yellow-500 active:bg-yellow-600 font-medium text-xs sm:text-sm transition-colors shadow-md hover:shadow-lg"
                  onClick={() => alert('Certificate generation coming soon!')}
                >
                  Generate
                </button>
              )}
            </div>
          </div>
        )}

        {/* Actions - Mobile Optimized */}
        <div className="flex flex-col-reverse xs:flex-row gap-2 xs:gap-3 justify-center mb-3 xs:mb-4 print:hidden px-2 sm:px-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex-1 xs:flex-auto"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/comprehensive-exam/setup')}
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex-1 xs:flex-auto"
          >
            Another Exam
          </button>
        </div>
      </div>
    </div>
  );
}