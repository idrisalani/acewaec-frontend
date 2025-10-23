// frontend/src/pages/analytics/ExportReports.tsx
// ✅ FIXED - Uses userService for student info instead of non-existent analyticsService method

import { useEffect, useState } from 'react';
import { Download, FileText, Share2, ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import AnalyticsNavigation from '../../components/analytics/AnalyticsNavigation';
import { exportToPDF, exportToCSV, generateShareableSummary } from '../../utils/exportUtils';
import { analyticsService } from '../../services/analytics.service';
import { userService } from '../../services/user.service';

interface DashboardData {
  stats: {
    overview: {
      totalQuestions: number;
      totalCorrect: number;
      overallAccuracy: string;
      totalSessions: number;
      totalStudyTime: number;
      averageSessionScore: string;
      easyCorrect: number;
      easyTotal: number;
      mediumCorrect: number;
      mediumTotal: number;
      hardCorrect: number;
      hardTotal: number;
    };
    subjectBreakdown: Array<{
      name: string;
      totalQuestions: number;
      correct: number;
      accuracy: number;
    }>;
    recentSessions: Array<{
      id: string;
      date: Date | string;
      score: number;
      questions: number;
      correct: number;
    }>;
  };
  streak?: number;
  peerComparison?: {
    averageAccuracy: number;
    yourAccuracy: number;
    percentile: number;
  };
  studyGoals?: Array<{
    id: string;
    name: string;
    target: number;
    current: number;
    deadline: string;
    status: 'on_track' | 'at_risk' | 'completed';
  }>;
}

export default function ExportReports() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('Student');
  const [exportType, setExportType] = useState<'pdf' | 'csv'>('pdf');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Load analytics data
      const data = await analyticsService.getDashboard();
      setDashboardData(data);

      // Get student name from user service (FIXED: was analyticsService.getStudentInfo())
      const studentInfo = await userService.getStudentInfo();
      setStudentName(studentInfo?.name || 'Student');
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!dashboardData) return;

    if (exportType === 'pdf') {
      exportToPDF(dashboardData, studentName);
    } else {
      exportToCSV(dashboardData, studentName);
    }
  };

  const handleShare = async () => {
    if (!dashboardData) return;

    const summary = generateShareableSummary(dashboardData);

    // Generate share link (simulate)
    const link = `${window.location.origin}/reports/share/${Math.random().toString(36).substr(2, 9)}`;
    setShareLink(link);

    // Try to use Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My AceWAEC Progress Report',
          text: summary,
          url: link
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AnalyticsNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AnalyticsNavigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto text-red-600 mb-3" size={32} />
            <p className="text-gray-600">Failed to load analytics data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnalyticsNavigation />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Analytics
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Export & Share Reports</h1>
          <p className="text-gray-600">Download your performance reports or share with others</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Section */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center gap-2 mb-6">
              <Download className="text-indigo-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Download Report</h2>
            </div>

            <div className="space-y-6">
              {/* File Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  File Format
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors" 
                    style={{ borderColor: exportType === 'pdf' ? '#4f46e5' : '#e5e7eb', backgroundColor: exportType === 'pdf' ? '#eef2ff' : '#ffffff' }}>
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={exportType === 'pdf'}
                      onChange={(e) => setExportType(e.target.value as 'pdf' | 'csv')}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">PDF Report</p>
                      <p className="text-xs text-gray-600">Formatted report with charts and visualizations</p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors" 
                    style={{ borderColor: exportType === 'csv' ? '#4f46e5' : '#e5e7eb', backgroundColor: exportType === 'csv' ? '#eef2ff' : '#ffffff' }}>
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={exportType === 'csv'}
                      onChange={(e) => setExportType(e.target.value as 'pdf' | 'csv')}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">CSV Spreadsheet</p>
                      <p className="text-xs text-gray-600">Open in Excel or Google Sheets</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name (for report)
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your name"
                />
              </div>

              {/* Report Contents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Includes
                </label>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    Performance Overview
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    Difficulty Breakdown
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    Subject Performance
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    Recent Sessions
                  </div>
                  {dashboardData.peerComparison && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      Peer Comparison
                    </div>
                  )}
                </div>
              </div>

              {/* Export Buttons */}
              <div className="space-y-2 pt-4">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Download size={20} />
                  Download {exportType.toUpperCase()}
                </button>

                <button
                  onClick={handlePrintReport}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  <FileText size={20} />
                  Print Report
                </button>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center gap-2 mb-6">
              <Share2 className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Share Your Progress</h2>
            </div>

            <div className="space-y-6">
              {/* Sharing Options */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-medium text-gray-900 mb-4">Share Summary</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create a shareable link to your performance summary. Others can view your achievements without access to your full report.
                </p>

                <button
                  onClick={handleShare}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Generate Share Link
                </button>
              </div>

              {/* Share Link Display */}
              {shareLink && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Share Link</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-600"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Share via Social */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-3">Share via</p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    📱 WhatsApp
                  </button>
                  <button className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    🐦 Twitter
                  </button>
                  <button className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
                    📧 Email
                  </button>
                  <button className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    f Facebook
                  </button>
                </div>
              </div>

              {/* Sharing Tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-900 mb-2">💡 Sharing Tips</p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Share with teachers for college applications</li>
                  <li>• Challenge friends to compare results</li>
                  <li>• Track your improvement over time</li>
                  <li>• Motivate your study group</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Data Summary */}
        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Report Summary</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Overall Accuracy</p>
              <p className="text-2xl font-bold text-indigo-900">{dashboardData.stats.overview.overallAccuracy}%</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Questions</p>
              <p className="text-2xl font-bold text-green-900">{dashboardData.stats.overview.totalQuestions}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Sessions</p>
              <p className="text-2xl font-bold text-purple-900">{dashboardData.stats.overview.totalSessions}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Study Time</p>
              <p className="text-2xl font-bold text-orange-900">{dashboardData.stats.overview.totalStudyTime}m</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Clock size={14} />
            <span>Report generated on {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}