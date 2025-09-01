import { apiFetch } from './api';
import { getToken } from '@/utils/auth';

export interface Notification {
  id: number;
  user_id: number;
  task_id?: number;
  type: 'ASSIGNMENT' | 'STATUS_CHANGE' | 'REMINDER' | 'ESCALATION' | 'GENERAL' | 'BROADCAST';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface NotificationList {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  by_type: {
    assignment: number;
    status_change: number;
    reminder: number;
    escalation: number;
  };
}

export interface NotificationFilters {
  skip?: number;
  limit?: number;
  unread_only?: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private baseUrl = '/notifications';

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private getHeaders(): HeadersInit {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationList> {
    const params = new URLSearchParams();
    
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.unread_only !== undefined) params.append('unread_only', filters.unread_only.toString());

    const url = `${this.baseUrl}/?${params.toString()}`;
    
    const response = await apiFetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  }

  async getNotification(id: number): Promise<Notification> {
    const response = await apiFetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification');
    }

    return response.json();
  }

  async markAsRead(id: number): Promise<Notification> {
    const response = await apiFetch(`${this.baseUrl}/${id}/read`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return response.json();
  }

  async markAllAsRead(): Promise<{ message: string; updated_count: number }> {
    const response = await apiFetch(`${this.baseUrl}/read-all`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }

    return response.json();
  }

  async deleteNotification(id: number): Promise<{ message: string }> {
    const response = await apiFetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }

    return response.json();
  }

  async getStats(): Promise<NotificationStats> {
    const response = await apiFetch(`${this.baseUrl}/stats/summary`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification stats');
    }

    return response.json();
  }

  // Helper method to get unread notifications only
  async getUnreadNotifications(limit: number = 50): Promise<NotificationList> {
    return this.getNotifications({
      unread_only: true,
      limit,
    });
  }

  // Helper method to get recent notifications
  async getRecentNotifications(limit: number = 10): Promise<NotificationList> {
    return this.getNotifications({
      limit,
    });
  }

  // Helper method to check if there are any unread notifications
  async hasUnreadNotifications(): Promise<boolean> {
    try {
      const stats = await this.getStats();
      return stats.unread > 0;
    } catch (error) {
      console.error('Error checking unread notifications:', error);
      return false;
    }
  }

  // Helper method to get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const stats = await this.getStats();
      return stats.unread;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export individual functions for convenience
export const {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getStats,
  getUnreadNotifications,
  getRecentNotifications,
  hasUnreadNotifications,
  getUnreadCount,
} = notificationService;
