// frontend/src/utils/analyticsUtils.ts

/**
 * Calculate learning streak (consecutive practice days)
 */
export const calculateStreak = (sessions: Array<{ date: Date | string }>): number => {
  if (sessions.length === 0) return 0;

  const sortedSessions = [...sessions]
    .map(s => ({
      ...s,
      date: new Date(s.date)
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const session of sortedSessions) {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
};

/**
 * Calculate accuracy percentage
 */
export const calculateAccuracy = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

/**
 * Get performance trend (comparison with previous period)
 */
export const getPerformanceTrend = (
  current: number,
  previous: number
): { trend: 'up' | 'down' | 'flat'; percentage: number } => {
  if (previous === 0) return { trend: 'flat', percentage: 0 };

  const change = ((current - previous) / previous) * 100;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

  return { trend, percentage: Math.abs(Math.round(change)) };
};

/**
 * Categorize difficulty performance
 */
export const getDifficultyCategory = (accuracy: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (accuracy >= 80) return 'excellent';
  if (accuracy >= 60) return 'good';
  if (accuracy >= 40) return 'fair';
  return 'poor';
};

/**
 * Get weak topics based on accuracy threshold
 */
export const getWeakTopics = (
  topics: Array<{ name: string; accuracy: number }>,
  threshold: number = 60
) => {
  return topics
    .filter(t => t.accuracy < threshold)
    .sort((a, b) => a.accuracy - b.accuracy);
};

/**
 * Estimate time to mastery (in hours of practice)
 */
export const estimateTimeToMastery = (
  currentAccuracy: number,
  targetAccuracy: number = 90,
  averageHourlyImprovement: number = 0.5
): number => {
  if (currentAccuracy >= targetAccuracy) return 0;

  const improvementNeeded = targetAccuracy - currentAccuracy;
  return Math.ceil(improvementNeeded / averageHourlyImprovement);
};

/**
 * Format study time (minutes to readable format)
 */
export const formatStudyTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
};

/**
 * Get next study reminder time
 */
export const getNextReminderTime = (): string => {
  const now = new Date();
  let nextReminder = new Date();

  // Set reminder for tomorrow at 8 AM if past 8 PM today
  if (now.getHours() >= 20) {
    nextReminder.setDate(nextReminder.getDate() + 1);
    nextReminder.setHours(8, 0, 0, 0);
  } else {
    // Set for today if before 8 AM, or tomorrow otherwise
    if (now.getHours() < 8) {
      nextReminder.setHours(8, 0, 0, 0);
    } else {
      nextReminder.setDate(nextReminder.getDate() + 1);
      nextReminder.setHours(8, 0, 0, 0);
    }
  }

  return nextReminder.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Generate performance summary text
 */
export const generatePerformanceSummary = (data: {
  overallAccuracy: number;
  totalSessions: number;
  streak: number;
  weekOverWeekImprovement: number;
}): string => {
  const { overallAccuracy, totalSessions, streak, weekOverWeekImprovement } = data;

  if (totalSessions === 0) {
    return 'Start practicing to begin tracking your progress!';
  }

  let summary = `You've completed ${totalSessions} session${totalSessions !== 1 ? 's' : ''} with an overall accuracy of ${overallAccuracy}%. `;

  if (streak > 0) {
    summary += `You have a ${streak}-day learning streak! `;
  }

  if (weekOverWeekImprovement > 0) {
    summary += `Your performance improved by ${weekOverWeekImprovement}% this week.`;
  } else if (weekOverWeekImprovement < 0) {
    summary += `Focus on consistency to improve your performance.`;
  }

  return summary;
};