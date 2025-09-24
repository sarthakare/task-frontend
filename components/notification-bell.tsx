"use client";
import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Archive, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api-service';
import { toast } from 'sonner';
import { useWebSocket } from '@/contexts/websocket-context';
import type { NotificationSummary, NotificationStats } from '@/types';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Get WebSocket context for notification refresh trigger and connection status
  const { notificationRefreshTrigger, isConnected, connectionStatus, reconnect } = useWebSocket();

  // Ensure component only renders on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch notifications and stats
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const [notificationsData, statsData] = await Promise.all([
        api.notifications.getNotifications({ limit: 10, include_archived: false }),
        api.notifications.getStats()
      ]);
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await api.notifications.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          unread_count: Math.max(0, prev.unread_count - 1),
          read_count: prev.read_count + 1
        } : null);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };


  // Delete notification
  const deleteNotification = async (notificationId: number) => {
    try {
      await api.notifications.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total_notifications: prev.total_notifications - 1,
          unread_count: prev.unread_count - (notifications.find(n => n.id === notificationId)?.is_read === false ? 1 : 0),
          read_count: prev.read_count - (notifications.find(n => n.id === notificationId)?.is_read === true ? 1 : 0)
        } : null);
      }
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return '📋';
      case 'task_updated': return '✏️';
      case 'task_status_changed': return '🔄';
      case 'task_due_soon': return '⏰';
      case 'task_overdue': return '🚨';
      case 'team_member_added': return '👥';
      case 'team_member_removed': return '👤';
      case 'project_created': return '🚀';
      case 'project_updated': return '📝';
      case 'reminder': return '🔔';
      case 'system': return '⚙️';
      case 'message': return '💬';
      default: return '🔔';
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // WebSocket status functions
  const getWebSocketStatusIcon = () => {
    switch (connectionStatus) {
      case "Connected":
        return <Wifi className="h-3 w-3" />;
      case "Connecting":
        return <RefreshCw className="h-3 w-3 animate-spin" />;
      case "Error":
      case "Failed":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <WifiOff className="h-3 w-3" />;
    }
  };

  const getWebSocketStatusColor = () => {
    switch (connectionStatus) {
      case "Connected":
        return "bg-green-100 text-green-800 border-green-200";
      case "Connecting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Error":
      case "Failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchNotifications();
    }
  }, [isMounted]);

  // Refresh notifications when WebSocket receives task notifications
  useEffect(() => {
    if (isMounted && notificationRefreshTrigger > 0) {
      fetchNotifications();
    }
  }, [notificationRefreshTrigger, isMounted]);

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <Button variant="ghost" size="sm" className={`relative ${className}`}>
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {stats && stats.unread_count > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {stats.unread_count > 99 ? '99+' : stats.unread_count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Notifications</h3>
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${getWebSocketStatusColor()}`}
            >
              {getWebSocketStatusIcon()}
              <span className="text-xs">
                {connectionStatus === "Connected" ? "Live" : connectionStatus}
              </span>
            </Badge>
            {!isConnected && connectionStatus !== "Connecting" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reconnect}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reconnect
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNotifications}
              disabled={isLoading}
            >
              {isLoading ? '...' : 'Refresh'}
            </Button>
          </div>
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div className={`p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="text-lg">
                        {getNotificationIcon(notification.notification_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!notification.is_read && (
                                  <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark as read
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => deleteNotification(notification.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
