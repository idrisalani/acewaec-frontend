import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { practiceService } from '../services/practice.service';
import { comprehensiveExamService } from '../services/comprehensiveExam.service';

interface Subject {
  id: string;
  name: string;
  code: string;
}

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

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await practiceService.getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Failed to load subjects:', error);
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
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setError(apiError.response?.data?.error || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-indigo-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              7-Day Comprehensive Exam
            </h1>
            <p className="text-gray-600">
              Simulate a full WAEC examination experience
            </p>
          </div>

          {/* Exam Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-bold text-gray-900">7 Days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Clock className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Per Day</p>
                <p className="font-bold text-gray-900">3 Hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <BookOpen className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Questions</p>
                <p className="font-bold text-gray-900">40 per day</p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-600 mt-0.5 mr-3" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-900">Important Rules</h3>
                <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                  <li>• Each day's exam must be completed within 24 hours</li>
                  <li>• Once started, you cannot pause or stop the timer</li>
                  <li>• You must complete Day 1 before Day 2 becomes available</li>
                  <li>• Missing a day will unlock the next day but count as incomplete</li>
                  <li>• Certificate issued only upon completing all 7 days</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Select 7 Subjects (one per day)
              </h2>
              <span className={`text-sm font-medium ${selectedSubjects.length === 7 ? 'text-green-600' : 'text-gray-600'
                }`}>
                {selectedSubjects.length}/7 selected
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map((subject) => {
                const isSelected = selectedSubjects.includes(subject.id);
                const dayNumber = selectedSubjects.indexOf(subject.id) + 1;

                return (
                  <button
                    key={subject.id}
                    onClick={() => toggleSubject(subject.id)}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all text-left
                      ${isSelected
                        ? 'border-indigo-600 bg-indigo-50'
                        : selectedSubjects.length >= 7
                          ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                          : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                      }
                    `}
                    disabled={!isSelected && selectedSubjects.length >= 7}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{subject.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{subject.code}</p>
                      </div>
                      {isSelected && (
                        <div className="flex flex-col items-center gap-1">
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
          </div>

          {/* Selected Order Preview */}
          {selectedSubjects.length > 0 && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Exam Schedule:</h3>
              <div className="space-y-2">
                {selectedSubjects.map((subjectId, index) => {
                  const subject = subjects.find(s => s.id === subjectId);
                  return (
                    <div key={subjectId} className="flex items-center gap-3">
                      <span className="w-16 text-sm font-medium text-gray-600">
                        Day {index + 1}:
                      </span>
                      <span className="text-sm text-gray-900">{subject?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateExam}
              disabled={selectedSubjects.length !== 7 || loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creating...' : 'Start 7-Day Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}