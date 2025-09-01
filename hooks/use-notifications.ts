import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './use-websocket';
import { 
  notificationService, 
  Notification, 
  NotificationList, 
  NotificationStats,
  NotificationFilters 
} from '@/lib/notifications';
import { toast } from 'sonner';
import { CircleAlert, CheckCircle2 } from 'lucide-react';

interface UseNotificationsOptions {
  userId: number;
  autoConnect?: boolean;
  enableRealTime?: boolean;
}

export function useNotifications({ 
  userId, 
  autoConnect = true, 
  enableRealTime = true 
}: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // WebSocket integration
  const handleNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast.success(notification.title, {
      description: notification.message,
      icon: React.createElement(CheckCircle2, { className: "text-green-600" }),
      duration: 5000,
    });
  }, []);

  const handleWebSocketError = useCallback((error: Event) => {
    console.error('WebSocket error:', error);
          toast.error('Real-time connection lost', {
        icon: React.createElement(CircleAlert, { className: "text-red-600" }),
      });
  }, []);

  const { isConnected, connectionStatus, connect, disconnect } = useWebSocket({
    userId,
    onNotification: handleNotification,
    onError: handleWebSocketError,
  });

  // Load initial notifications
  const loadNotifications = useCallback(async (filters: NotificationFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await notificationService.getNotifications(filters);
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
      toast.error('Failed to load notifications', {
        icon: React.createElement(CircleAlert, { className: "text-red-600" }),
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notification stats
  const loadStats = useCallback(async () => {
    try {
      const data = await notificationService.getStats();
      setStats(data);
      setUnreadCount(data.unread);
      return data;
    } catch (err) {
      console.error('Failed to load notification stats:', err);
      return null;
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      const updatedNotification = await notificationService.markAsRead(id);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? updatedNotification : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return updatedNotification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      toast.error(errorMessage, {
        icon: React.createElement(CircleAlert, { className: "text-red-600" }),
      });
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
      
      toast.success(`Marked ${result.updated_count} notifications as read`, {
        icon: React.createElement(CheckCircle2, { className: "text-green-600" }),
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
      toast.error(errorMessage, {
        icon: React.createElement(CircleAlert, { className: "text-red-600" }),
      });
      throw err;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === id);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted', {
        icon: React.createElement(CheckCircle2, { className: "text-green-600" }),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      toast.error(errorMessage, {
        icon: React.createElement(CircleAlert, { className: "text-red-600" }),
      });
      throw err;
    }
  }, [notifications]);

  // Refresh notifications
  const refresh = useCallback(async () => {
    await Promise.all([
      loadNotifications(),
      loadStats()
    ]);
  }, [loadNotifications, loadStats]);

  // Load unread notifications only
  const loadUnreadNotifications = useCallback(async (limit: number = 50) => {
    return loadNotifications({ unread_only: true, limit });
  }, [loadNotifications]);

  // Load recent notifications
  const loadRecentNotifications = useCallback(async (limit: number = 10) => {
    return loadNotifications({ limit });
  }, [loadNotifications]);

  // Initialize
  useEffect(() => {
    if (autoConnect && userId) {
      refresh();
    }
  }, [userId, autoConnect, refresh]);

  // Connect to WebSocket if enabled
  useEffect(() => {
    if (enableRealTime && userId) {
      connect();
    } else {
      disconnect();
    }
  }, [userId, enableRealTime, connect, disconnect]);

  return {
    // State
    notifications,
    stats,
    loading,
    error,
    unreadCount,
    
    // WebSocket state
    isConnected,
    connectionStatus,
    
    // Actions
    loadNotifications,
    loadStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    loadUnreadNotifications,
    loadRecentNotifications,
    
    // WebSocket actions
    connect,
    disconnect,
  };
}
