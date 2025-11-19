// frontend/src/pages/analytics/AnalyticsDashboard.tsx
// ✅ FULLY FIXED - All safety checks for undefined data + error handling

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Target,
    Clock,
    BookOpen,
    Award,
    AlertCircle,
    CheckCircle,
    Zap,
    Download,
    ArrowLeft,
    Flame,
    Users,
    Bell,
    Flag,
} from 'lucide-react';
import Navigation from '../components/layout/Navigation';

import {
    StudyGoalsCard,
    StreakStats,
    AccuracyComparison,
    type StudyGoal as UIStudyGoal, 
} from '../components/analytics/AnalyticsComponents';

import {
    type StudyGoal as ServiceStudyGoal,
    analyticsService
} from '../services/analytics.service';

interface Recommendation {
    type: 'strength' | 'weakness' | 'practice' | 'mastery';
    priority: 'high' | 'medium' | 'low';
    message: string;
    subjectId: string;
    topicId?: string;
    action: string;
}

interface EnhancedStudyGoal {
    id: string;
    title: string;
    targetAccuracy: number;
    currentAccuracy: number;
    deadline: Date;
    subject: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
}

interface PremiumFeature {
    name: string;
    description: string;
    icon: React.ReactNode;
    available: boolean;
    comingSoon?: boolean;
}

interface DashboardDataEnhanced {
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
            date: Date;
            score: number;
            questions: number;
            correct: number;
        }>;
    };
    recommendations: Recommendation[];
    studyGoals: EnhancedStudyGoal[];
    currentStreak: number;
    longestStreak: number;
    peerAverage: number;
}

/**
 * ✅ Correct converter: Service goal → Dashboard enhanced goal
 * Maps ServiceStudyGoal to EnhancedStudyGoal for the dashboard
 */
function convertServiceGoalToEnhancedGoal(
    serviceGoal: ServiceStudyGoal
): EnhancedStudyGoal {
    return {
        id: serviceGoal.id,
        title: serviceGoal.title,
        targetAccuracy: serviceGoal.targetAccuracy,
        currentAccuracy: serviceGoal.currentAccuracy ?? 0,
        deadline: typeof serviceGoal.deadline === 'string'
            ? new Date(serviceGoal.deadline)
            : serviceGoal.deadline,
        subject: serviceGoal.subject || '',
        completed: serviceGoal.status === 'completed',
        priority: serviceGoal.priority
    };
}

export default function AnalyticsDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardDataEnhanced | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isPremium, setIsPremium] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const premiumFeatures: PremiumFeature[] = [
        {
            name: 'Study Goals',
            description: 'Set and track personalized learning targets',
            icon: <Flag size={24} />,
            available: isPremium,
        },
        {
            name: 'Learning Streaks',
            description: 'Maintain consistency with streak tracking',
            icon: <Flame size={24} />,
            available: isPremium,
        },
        {
            name: 'Peer Comparison',
            description: 'Compare performance with average students',
            icon: <Users size={24} />,
            available: isPremium,
        },
        {
            name: 'Export Reports',
            description: 'Download analytics in PDF/CSV format',
            icon: <Download size={24} />,
            available: isPremium,
        },
        {
            name: 'Smart Reminders',
            description: 'Get AI-powered study notifications',
            icon: <Bell size={24} />,
            available: isPremium,
        },
    ];

    useEffect(() => {
        loadDashboard();
        checkPremiumStatus();
    }, []);

    const checkPremiumStatus = async () => {
        try {
            const status = await analyticsService.checkPremiumStatus();
            setIsPremium(status);
        } catch (error) {
            console.error('Failed to check premium status:', error);
            setIsPremium(false);
        }
    };

    const loadDashboard = async () => {
        try {
            setError(null);
            const dashboardData = await analyticsService.getEnhancedDashboard();

            // ✅ Convert to EnhancedStudyGoal with safety
            const enhancedGoals: EnhancedStudyGoal[] = (dashboardData.studyGoals || []).map(
                convertServiceGoalToEnhancedGoal
            );

            const enhancedData: DashboardDataEnhanced = {
                ...dashboardData,
                studyGoals: enhancedGoals,
                // ✅ Add safety defaults for all fields
                recommendations: dashboardData.recommendations || [],
                currentStreak: dashboardData.currentStreak || 0,
                longestStreak: dashboardData.longestStreak || 0,
                peerAverage: dashboardData.peerAverage || 0,
            };

            setData(enhancedData);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            setError('Failed to load analytics dashboard. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="mx-auto w-12 h-12 text-red-600 mb-4" />
                    <p className="text-red-600 font-semibold mb-4">{error}</p>
                    <button
                        onClick={loadDashboard}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Failed to load analytics</p>
                    <button
                        onClick={loadDashboard}
                        className="mt-4 text-indigo-600 hover:underline"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ✅ FIX 1: Add default values when destructuring to prevent undefined errors
    const { 
      stats, 
      recommendations = [], 
      studyGoals = [], 
      currentStreak = 0, 
      longestStreak = 0, 
      peerAverage = 0 
    } = data;

    const getRecommendationIcon = (type: Recommendation['type']) => {
        switch (type) {
            case 'weakness':
                return <AlertCircle className="text-red-600" size={20} />;
            case 'practice':
                return <BookOpen className="text-yellow-600" size={20} />;
            case 'strength':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'mastery':
                return <Award className="text-purple-600" size={20} />;
        }
    };

    const getRecommendationBg = (type: Recommendation['type']) => {
        switch (type) {
            case 'weakness':
                return 'bg-red-50 border-red-200';
            case 'practice':
                return 'bg-yellow-50 border-yellow-200';
            case 'strength':
                return 'bg-green-50 border-green-200';
            case 'mastery':
                return 'bg-purple-50 border-purple-200';
        }
    };

    // ✅ Convert enhanced study goals to component-compatible format with safety
    const studyGoalsForComponent: UIStudyGoal[] = (studyGoals || []).map((goal) => ({
        id: goal.id,
        name: goal.title,
        targetScore: goal.targetAccuracy,
        currentScore: goal.currentAccuracy,
        deadline: goal.deadline,
        status: goal.completed ? 'completed' : 'active',
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header with Back Button */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <p className="text-gray-600 mt-1">Track your learning progress and performance</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/pricing')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isPremium
                            ? 'bg-green-100 text-green-800'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                    >
                        {isPremium ? '✓ Premium' : 'Upgrade'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-2 bg-white rounded-lg shadow-sm p-1 w-fit overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'goals', label: 'Goals', icon: Target },
                        { id: 'streaks', label: 'Streaks', icon: Flame },
                        { id: 'peers', label: 'Peer Comparison', icon: Users },
                        { id: 'reports', label: 'Reports', icon: Download },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm">Total Questions</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stats?.overview?.totalQuestions ?? 0}
                                        </p>
                                    </div>
                                    <BookOpen size={32} className="text-blue-600 opacity-20" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm">Correct Answers</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {stats?.overview?.totalCorrect ?? 0}
                                        </p>
                                    </div>
                                    <CheckCircle size={32} className="text-green-600 opacity-20" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm">Overall Accuracy</p>
                                        <p className="text-3xl font-bold text-indigo-600">
                                            {stats?.overview?.overallAccuracy ?? '0'}%
                                        </p>
                                    </div>
                                    <Zap size={32} className="text-indigo-600 opacity-20" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm">Sessions</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {stats?.overview?.totalSessions ?? 0}
                                        </p>
                                    </div>
                                    <Clock size={32} className="text-purple-600 opacity-20" />
                                </div>
                            </div>
                        </div>

                        {/* ✅ FIX 2: Use safely with default empty array */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 space-y-6">
                                <StudyGoalsCard goals={studyGoalsForComponent || []} />
                                <StreakStats current={currentStreak} longest={longestStreak} />
                            </div>

                            <div className="lg:col-span-2 space-y-6">
                                <AccuracyComparison
                                    userAccuracy={parseFloat(stats?.overview?.overallAccuracy ?? '0')}
                                    peerAverage={peerAverage}
                                />
                            </div>
                        </div>

                        {/* Recommendations - ✅ FIX 3: Safety check for recommendations array */}
                        {(recommendations && recommendations.length > 0) && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h2>
                                <div className="space-y-3">
                                    {recommendations.map((rec, idx) => (
                                        <div
                                            key={idx}
                                            className={`border-l-4 p-4 rounded ${getRecommendationBg(rec.type)}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {getRecommendationIcon(rec.type)}
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{rec.message}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${rec.priority === 'high'
                                                        ? 'bg-red-200 text-red-800'
                                                        : rec.priority === 'medium'
                                                            ? 'bg-yellow-200 text-yellow-800'
                                                            : 'bg-blue-200 text-blue-800'
                                                        }`}
                                                >
                                                    {rec.priority}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Sessions and Subject Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Sessions - ✅ FIX 4: Safety check for recentSessions array */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h2>
                                <div className="space-y-2">
                                    {(!stats?.recentSessions || stats.recentSessions.length === 0) ? (
                                        <p className="text-gray-600">No sessions yet. Start practicing!</p>
                                    ) : (
                                        (stats.recentSessions || []).map((session) => (
                                            <div
                                                key={session.id}
                                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {new Date(session.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {session.correct ?? 0}/{session.questions ?? 0} questions
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p
                                                        className={`text-lg font-bold ${(session.score ?? 0) >= 75
                                                            ? 'text-green-600'
                                                            : (session.score ?? 0) >= 50
                                                                ? 'text-yellow-600'
                                                                : 'text-red-600'
                                                            }`}
                                                    >
                                                        {((session.score ?? 0).toFixed(0))}%
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Subject Breakdown - ✅ FIX 5: Safety check for subjectBreakdown array */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h2>
                                <div className="space-y-4">
                                    {(!stats?.subjectBreakdown || stats.subjectBreakdown.length === 0) ? (
                                        <p className="text-gray-600">No data yet</p>
                                    ) : (
                                        (stats.subjectBreakdown || []).map((subject, idx) => (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {subject.name}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {((subject.accuracy ?? 0).toFixed(0))}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${(subject.accuracy ?? 0) >= 75
                                                            ? 'bg-green-500'
                                                            : (subject.accuracy ?? 0) >= 50
                                                                ? 'bg-yellow-500'
                                                                : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${subject.accuracy ?? 0}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {subject.correct ?? 0}/{subject.totalQuestions ?? 0} questions
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Study Goals Tab */}
                {activeTab === 'goals' && (
                    <div>
                        {isPremium ? (
                            <StudyGoalsCard goals={studyGoalsForComponent || []} />
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <Flag size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Study Goals (Premium Feature)
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Set personalized learning targets and track your progress toward mastery.
                                </p>
                                <button
                                    onClick={() => navigate('/pricing')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Unlock Premium
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Learning Streaks Tab */}
                {activeTab === 'streaks' && (
                    <div>
                        {isPremium ? (
                            <StreakStats current={currentStreak} longest={longestStreak} />
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <Flame size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Learning Streaks (Premium Feature)
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Maintain your momentum with streak tracking and consistency rewards.
                                </p>
                                <button
                                    onClick={() => navigate('/pricing')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Unlock Premium
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Peer Comparison Tab */}
                {activeTab === 'peers' && (
                    <div>
                        {isPremium ? (
                            <AccuracyComparison
                                userAccuracy={parseFloat(stats?.overview?.overallAccuracy ?? '0')}
                                peerAverage={peerAverage}
                            />
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Peer Comparison (Premium Feature)
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Compare your performance with other students and benchmark your progress.
                                </p>
                                <button
                                    onClick={() => navigate('/pricing')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Unlock Premium
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Reports Tab */}
                {activeTab === 'reports' && (
                    <div>
                        {isPremium ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <Download size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Reports</h3>
                                <p className="text-gray-600 mb-4">
                                    Download your complete analytics and performance reports.
                                </p>
                                <button
                                    disabled
                                    className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                                >
                                    Export Report (Coming Soon)
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <Download size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Export Reports (Premium Feature)
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Download your analytics in PDF or CSV format for deeper analysis.
                                </p>
                                <button
                                    onClick={() => navigate('/pricing')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Unlock Premium
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Premium Features Section */}
                {!isPremium && (
                    <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
                        <h2 className="text-2xl font-bold mb-6">Unlock Premium Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {premiumFeatures.map((feature, idx) => (
                                <div key={idx} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                    <div className="mb-2 text-indigo-200">{feature.icon}</div>
                                    <h3 className="font-semibold mb-1">{feature.name}</h3>
                                    <p className="text-sm text-indigo-100">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => navigate('/pricing')}
                            className="mt-6 px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            View Premium Plans
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}