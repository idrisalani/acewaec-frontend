// frontend/src/services/notifications.service.ts
// ✅ PREMIUM FEATURE - Smart reminders and notifications system

// ✅ Fixed: Add proper process type definition for Node.js env vars
declare const process: {
  env: {
    REACT_APP_API_URL?: string;
  };
};

interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'recommendation' | 'streak' | 'goal';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface ReminderSettings {
  dailyReminder: boolean;
  dailyReminderTime: string;
  streakReminder: boolean;
  goalReminder: boolean;
  achievementNotifications: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

// ✅ Fixed: Define custom NotificationOptions type that matches our needs
interface CustomNotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

// ✅ FIXED: Proper type for reminder data instead of 'any'
interface ReminderData {
  [key: string]: string | number | boolean | undefined;
}

// ✅ FIXED: Type-safe schedule reminder response
interface ScheduleReminderResponse {
  success: boolean;
  reminderId: string;
}

class NotificationsService {
  private apiBase = typeof process !== 'undefined' && process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL 
    : 'http://localhost:3001';

  /**
   * Get all notifications for the user
   */
  async getNotifications(limit: number = 20): Promise<Notification[]> {
    try {
      const response = await fetch(`${this.apiBase}/api/notifications?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await fetch(`${this.apiBase}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Get reminder settings
   */
  async getReminderSettings(): Promise<ReminderSettings> {
    try {
      const response = await fetch(`${this.apiBase}/api/notifications/settings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch reminder settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Update reminder settings
   */
  async updateReminderSettings(settings: Partial<ReminderSettings>): Promise<ReminderSettings> {
    try {
      const response = await fetch(`${this.apiBase}/api/notifications/settings`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update reminder settings:', error);
      throw error;
    }
  }

  /**
   * Create a reminder for a specific time
   * ✅ FIXED: Replaced 'any' with proper ReminderData type
   */
  async scheduleReminder(
    reminderType: 'daily' | 'weekly' | 'goal_deadline' | 'streak_danger',
    time: string,
    data?: ReminderData
  ): Promise<ScheduleReminderResponse> {
    try {
      const response = await fetch(`${this.apiBase}/api/notifications/schedule`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reminderType,
          time,
          data,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      throw error;
    }
  }

  /**
   * Send browser notification (if permitted)
   */
  async sendBrowserNotification(title: string, options?: CustomNotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      // ✅ Fixed: Create notification without custom actions (not supported in all browsers)
      const notificationOptions: NotificationOptions = {
        body: options?.body,
        icon: options?.icon,
        badge: options?.badge,
        tag: options?.tag,
        requireInteraction: options?.requireInteraction,
      };

      new Notification(title, notificationOptions);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const notificationOptions: NotificationOptions = {
          body: options?.body,
          icon: options?.icon,
          badge: options?.badge,
          tag: options?.tag,
          requireInteraction: options?.requireInteraction,
        };

        new Notification(title, notificationOptions);
      }
    }
  }

  /**
   * Create achievement notification
   */
  async notifyAchievement(achievement: string, details: string): Promise<void> {
    const message = `🎉 Achievement Unlocked: ${achievement}`;
    
    await this.sendBrowserNotification(message, {
      body: details,
      icon: '/icons/achievement.png',
      badge: '/icons/badge.png',
      tag: 'achievement',
    });
  }

  /**
   * Create streak warning notification
   */
  async notifyStreakDanger(currentStreak: number, hoursUntilReset: number): Promise<void> {
    const message = `⚠️ Streak at Risk: ${currentStreak} days`;
    
    await this.sendBrowserNotification(message, {
      body: `Practice within ${hoursUntilReset} hours to keep your streak alive!`,
      icon: '/icons/streak.png',
      badge: '/icons/warning.png',
      tag: 'streak-danger',
      requireInteraction: true,
    });
  }

  /**
   * Create goal progress notification
   */
  async notifyGoalProgress(goalTitle: string, progress: number): Promise<void> {
    const message = `🎯 Goal Progress: ${goalTitle}`;
    
    await this.sendBrowserNotification(message, {
      body: `You're ${progress}% towards your target!`,
      icon: '/icons/goal.png',
      badge: '/icons/target.png',
      tag: 'goal-progress',
    });
  }

  /**
   * Create daily reminder notification
   */
  async notifyDailyReminder(): Promise<void> {
    const tips = [
      'Ready to learn? Start a practice session today!',
      'Consistency matters! Practice regularly to build strong fundamentals.',
      'You\'re making progress! Keep up the momentum.',
      'Your streak is active. Keep practicing!',
      'New practice questions are waiting for you.',
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    await this.sendBrowserNotification('AceWAEC Pro - Daily Practice', {
      body: randomTip,
      icon: '/icons/acewaec-logo.png',
      badge: '/icons/acewaec-badge.png',
      tag: 'daily-reminder',
    });
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Get default reminder settings
   */
  private getDefaultSettings(): ReminderSettings {
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

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<void> {
    try {
      await fetch(`${this.apiBase}/api/notifications/clear`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await fetch(`${this.apiBase}/api/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }
}

export const notificationsService = new NotificationsService();