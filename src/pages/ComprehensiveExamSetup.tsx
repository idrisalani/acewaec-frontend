// frontend/src/pages/ComprehensiveExamSetup.tsx
// ✅ Mobile-optimized subject selection for 7-day exam

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, BookOpen, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { practiceService } from '../services/practice.service';
import { comprehensiveExamService, type Subject } from '../services/comprehensiveExam.service';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

export default function ComprehensiveExamSetup() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const data = await practiceService.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
      setError('Failed to load subjects. Please try again.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else if (prev.length < 7) {
        return [...prev, subjectId];
      }
      return prev;
    });
    setError(null); // Clear error on selection change
  };

  const handleCreateExam = async () => {
    if (selectedSubjects.length !== 7) {
      setError('Please select exactly 7 subjects');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const exam = await comprehensiveExamService.createExam(selectedSubjects);
      navigate(`/comprehensive-exam/${exam.id}`);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMsg = apiError.response?.data?.error || apiError.message || 'Failed to create exam';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 text-sm sm:text-base font-medium"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Calendar className="text-indigo-600" size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              7-Day Comprehensive Exam
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Simulate a full WAEC examination experience
            </p>
          </div>

          {/* Exam Info - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Calendar className="text-blue-600 flex-shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Duration</p>
                <p className="font-bold text-sm sm:text-base text-gray-900">7 Days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-100">
              <Clock className="text-green-600 flex-shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Per Day</p>
                <p className="font-bold text-sm sm:text-base text-gray-900">3 Hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-100">
              <BookOpen className="text-purple-600 flex-shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Questions</p>
                <p className="font-bold text-sm sm:text-base text-gray-900">40/day</p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 mb-6 rounded text-sm">
            <div className="flex gap-2 sm:gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="min-w-0">
                <h3 className="font-semibold text-yellow-900 mb-2 text-sm sm:text-base">Important Rules</h3>
                <ul className="text-yellow-800 space-y-1 text-xs sm:text-sm">
                  <li>• Each day must be completed within 24 hours</li>
                  <li>• Timer cannot be paused once started</li>
                  <li>• Complete Day 1 before Day 2 unlocks</li>
                  <li>• Missing a day unlocks the next automatically</li>
                  <li>• Certificate requires completing all 7 days</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Select 7 Subjects
              </h2>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                selectedSubjects.length === 7
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {selectedSubjects.length}/7
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading State */}
            {loadingSubjects ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              /* Subject Grid - Responsive */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {subjects.map((subject) => {
                  const isSelected = selectedSubjects.includes(subject.id);
                  const dayNumber = selectedSubjects.indexOf(subject.id) + 1;
                  const isDisabled = !isSelected && selectedSubjects.length >= 7;

                  return (
                    <button
                      key={subject.id}
                      onClick={() => toggleSubject(subject.id)}
                      disabled={isDisabled}
                      className={`
                        relative p-3 sm:p-4 rounded-lg border-2 transition-all text-left
                        active:scale-95 touch-highlight-transparent
                        ${isSelected
                          ? 'border-indigo-600 bg-indigo-50 shadow-md'
                          : isDisabled
                          ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                          : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50 active:bg-indigo-50'
                      }
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">
                            {subject.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{subject.code}</p>
                        </div>
                        {isSelected && (
                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <CheckCircle2 className="text-indigo-600" size={20} />
                            <span className="text-xs font-bold text-indigo-600">
                              Day {dayNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Order Preview - Mobile Optimized */}
          {selectedSubjects.length > 0 && (
            <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3">
                📅 Your Exam Schedule:
              </h3>
              <div className="space-y-2">
                {selectedSubjects.map((subjectId, index) => {
                  const subject = subjects.find(s => s.id === subjectId);
                  return (
                    <div key={subjectId} className="flex items-center gap-2 sm:gap-3 text-sm">
                      <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded min-w-[50px] text-center text-xs sm:text-sm">
                        Day {index + 1}
                      </span>
                      <span className="text-gray-900 truncate">{subject?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="py-2.5 sm:py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 font-medium text-sm sm:text-base transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateExam}
              disabled={selectedSubjects.length !== 7 || loading || loadingSubjects}
              className="py-2.5 sm:py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base transition-colors"
            >
              {loading ? 'Creating Exam...' : 'Start 7-Day Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}