// frontend/src/services/analytics.service.ts
// ✅ FIXED - Added missing getPeerComparison method with proper typing

import apiClient from './api';


// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PeerStats {
  yourAccuracy: number;
  averageAccuracy: number;
  yourRank: number;
  totalStudents: number;
  percentile: number;
  accuracyTrend: Array<{ date: string; yourScore: number; classAverage: number }>;
  subjectComparison: Array<{
    subject: string;
    yourAccuracy: number;
    classAverage: number;
  }>;
  topPerformers: Array<{
    name: string;
    accuracy: number;
    sessions: number;
  }>;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  history: unknown[];
}

export interface StudyGoal {
  id: string;
  title: string;
  subject?: string;
  subjectId?: string;
  description?: string;
  targetAccuracy: number;
  currentAccuracy?: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  status?: 'on_track' | 'at_risk' | 'completed';
}

export interface ReminderSettings {
  dailyReminder: boolean;
  dailyReminderTime: string;
  streakReminder: boolean;
  goalReminder: boolean;
  achievementNotifications: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export const analyticsService = {
  // ============================================================================
  // EXISTING METHODS (Keep these as-is)
  // ============================================================================

  async getDashboard() {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data.data;
  },

  async getSubjectAnalytics(subjectId: string) {
    const response = await apiClient.get(`/analytics/subjects/${subjectId}`);
    return response.data.data;
  },

  async getPerformanceTrend() {
    const response = await apiClient.get('/analytics/trend');
    return response.data.data;
  },

  async getWeakAreas() {
    const response = await apiClient.get('/analytics/weak-areas');
    return response.data.data;
  },

  // ============================================================================
  // NEW PREMIUM FEATURE METHODS (Added for enhanced dashboard)
  // ============================================================================

  // Enhanced Dashboard (combines existing data + premium features)
  async getEnhancedDashboard() {
    try {
      const [dashboard, goals, streaks, peerData] = await Promise.all([
        this.getDashboard(),
        this.getStudyGoals(),
        this.getStreakData(),
        this.getPeerAnalytics()
      ]);

      return {
        stats: dashboard,
        studyGoals: goals || [],
        currentStreak: streaks?.currentStreak || 0,
        longestStreak: streaks?.longestStreak || 0,
        peerAverage: peerData?.peerAverage || 0,
        recommendations: dashboard?.recommendations || []
      };
    } catch (error) {
      console.error('Failed to load enhanced dashboard:', error);
      // Fallback to basic dashboard if premium features fail
      return {
        stats: await this.getDashboard(),
        studyGoals: [],
        currentStreak: 0,
        longestStreak: 0,
        peerAverage: 0,
        recommendations: []
      };
    }
  },

  // Premium Status Check
  async checkPremiumStatus() {
    try {
      const response = await apiClient.get('/users/premium-status');
      return response.data.data;
    } catch (error) {
      console.error('Failed to check premium status:', error);
      return { isPremium: false };
    }
  },

  // ============================================================================
  // STUDY GOALS (Premium Feature)
  // ============================================================================

  async getStudyGoals(): Promise<StudyGoal[]> {
    try {
      const response = await apiClient.get('/goals');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch study goals:', error);
      return [];
    }
  },

  async createStudyGoal(goalData: {
    title: string;
    subject: string;
    targetAccuracy: number;
    deadline: string;
    priority: 'high' | 'medium' | 'low';
  }): Promise<StudyGoal> {
    try {
      const response = await apiClient.post('/goals', goalData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create study goal:', error);
      throw error;
    }
  },

  async updateStudyGoal(
    goalId: string,
    updates: Partial<{
      title: string;
      targetAccuracy: number;
      currentAccuracy: number;
      deadline: string;
      priority: 'high' | 'medium' | 'low';
      completed: boolean;
    }>
  ): Promise<StudyGoal> {
    try {
      const response = await apiClient.put(`/goals/${goalId}`, updates);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update study goal:', error);
      throw error;
    }
  },

  async deleteStudyGoal(goalId: string) {
    try {
      await apiClient.delete(`/goals/${goalId}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete study goal:', error);
      throw error;
    }
  },

  async getGoalProgress(goalId: string) {
    try {
      const response = await apiClient.get(`/goals/${goalId}/progress`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch goal progress:', error);
      throw error;
    }
  },

  // ============================================================================
  // LEARNING STREAKS (Premium Feature)
  // ============================================================================

  async getStreakData(): Promise<StreakData> {
    try {
      const response = await apiClient.get('/streaks/data');
      return response.data.data || { currentStreak: 0, longestStreak: 0, history: [] };
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
      return { currentStreak: 0, longestStreak: 0, history: [] };
    }
  },

  async getCurrentStreak() {
    try {
      const response = await apiClient.get('/streaks/current');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch current streak:', error);
      return { currentStreak: 0 };
    }
  },

  async getLongestStreak() {
    try {
      const response = await apiClient.get('/streaks/longest');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch longest streak:', error);
      return { longestStreak: 0 };
    }
  },

  async getStreakHistory() {
    try {
      const response = await apiClient.get('/streaks/history');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch streak history:', error);
      return [];
    }
  },

  // ============================================================================
  // PEER COMPARISON (Premium Feature) ✅ FIXED
  // ============================================================================

  /**
   * ✅ FIXED: Complete peer comparison data for PeerComparison component
   * Combines all peer-related analytics into a single interface matching PeerStats
   */
  async getPeerComparison(): Promise<PeerStats> {
    try {
      const [dashboard, percentile, average, distribution, subjects] = await Promise.all([
        this.getDashboard().catch(() => null),
        this.getUserPercentile().catch(() => null),
        this.getPeerAverage().catch(() => null),
        this.getPerformanceDistribution().catch(() => null),
        this.getSubjectComparison().catch(() => []),
      ]);

      const yourAccuracy = dashboard?.accuracy || 0;
      const averageAccuracy = average?.average || 0;
      const totalStudents = average?.totalStudents || 0;
      const userPercentile = percentile?.percentile || 0;

      return {
        yourAccuracy,
        averageAccuracy,
        yourRank: percentile?.rank || 1,
        totalStudents,
        percentile: userPercentile,
        accuracyTrend: dashboard?.accuracyTrend || [],
        subjectComparison: subjects || [],
        topPerformers: distribution?.topPerformers || [],
      };
    } catch (error) {
      console.error('Failed to fetch peer comparison:', error);
      // Return properly typed empty structure on error
      return {
        yourAccuracy: 0,
        averageAccuracy: 0,
        yourRank: 0,
        totalStudents: 0,
        percentile: 0,
        accuracyTrend: [],
        subjectComparison: [],
        topPerformers: [],
      };
    }
  },

  async getPeerAnalytics() {
    try {
      const response = await apiClient.get('/analytics/peers');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch peer analytics:', error);
      return { peerAverage: 0 };
    }
  },

  async getPeerAverage() {
    try {
      const response = await apiClient.get('/analytics/peers/average');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch peer average:', error);
      return { average: 0, totalStudents: 0 };
    }
  },

  async getUserPercentile() {
    try {
      const response = await apiClient.get('/analytics/peers/percentile');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch user percentile:', error);
      return { percentile: 0, totalStudents: 0 };
    }
  },

  async getPerformanceDistribution() {
    try {
      const response = await apiClient.get('/analytics/peers/distribution');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch performance distribution:', error);
      return [];
    }
  },

  async getSubjectComparison() {
    try {
      const response = await apiClient.get('/analytics/peers/subjects');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch subject comparison:', error);
      return [];
    }
  },

  // ============================================================================
  // NOTIFICATIONS & REMINDERS (Premium Feature)
  // ============================================================================

  async getNotifications(limit: number = 20) {
    try {
      const response = await apiClient.get(`/notifications?limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  },

  async markNotificationAsRead(notificationId: string) {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data.data?.count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  },

  async getReminderSettings(): Promise<ReminderSettings> {
    try {
      const response = await apiClient.get('/notifications/settings');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch reminder settings:', error);
      return {
        dailyReminder: true,
        dailyReminderTime: '09:00',
        streakReminder: true,
        goalReminder: true,
        achievementNotifications: true,
        pushNotifications: true,
        emailNotifications: false,
      };
    }
  },

  async updateReminderSettings(settings: Record<string, unknown>): Promise<ReminderSettings> {
    try {
      const response = await apiClient.put('/notifications/settings', settings);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update reminder settings:', error);
      throw error;
    }
  },

  async scheduleReminder(
    reminderType: 'daily' | 'weekly' | 'goal_deadline' | 'streak_danger',
    time: string,
    data?: unknown
  ) {
    try {
      const response = await apiClient.post('/notifications/schedule', {
        reminderType,
        time,
        data,
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      throw error;
    }
  },

  // ============================================================================
  // EXPORT & REPORTING (Premium Feature)
  // ============================================================================

  async generateReport(format: 'pdf' | 'csv' | 'json') {
    try {
      const response = await apiClient.get(`/analytics/export/${format}`, {
        responseType: format === 'pdf' ? 'blob' : 'json',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  },

  async getReportSummary() {
    try {
      const response = await apiClient.get('/analytics/summary');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch report summary:', error);
      throw error;
    }
  },

  // ============================================================================
  // HELPER METHOD - Get all data for enhanced features
  // ============================================================================

  async getAllAnalyticsData() {
    try {
      const [
        dashboard,
        subjectAnalytics,
        trends,
        weakAreas,
        goals,
        streaks,
        peerData,
        summary
      ] = await Promise.all([
        this.getDashboard().catch(() => null),
        this.getSubjectAnalytics('all').catch(() => null),
        this.getPerformanceTrend().catch(() => null),
        this.getWeakAreas().catch(() => null),
        this.getStudyGoals().catch(() => []),
        this.getStreakData().catch(() => null),
        this.getPeerAnalytics().catch(() => null),
        this.getReportSummary().catch(() => null),
      ]);

      return {
        dashboard,
        subjectAnalytics,
        trends,
        weakAreas,
        goals,
        streaks,
        peerData,
        summary,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch all analytics data:', error);
      throw error;
    }
  },
};

export default analyticsService;