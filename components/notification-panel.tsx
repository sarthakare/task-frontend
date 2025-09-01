"use client"

import React from "react"
import { useState, useCallback } from "react"
import { Bell, X, Check, Trash2, RefreshCw, Wifi, WifiOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useNotifications } from "@/hooks/use-notifications"
import { Notification } from "@/lib/notifications"
import { toast } from "sonner"
import { CircleAlert, CheckCircle2 } from "lucide-react"

interface NotificationPanelProps {
  userId: number;
}

export function NotificationPanel({ userId }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const {
    notifications,
    stats,
    loading,
    error,
    unreadCount,
    isConnected,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    loadUnreadNotifications,
    loadRecentNotifications,
  } = useNotifications({ userId })

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "REMINDER":
        return "⏰"
      case "ESCALATION":
        return "🚨"
      case "ASSIGNMENT":
        return "📋"
      case "STATUS_CHANGE":
        return "🔄"
      case "GENERAL":
        return "📢"
      case "BROADCAST":
        return "📢"
      default:
        return "📢"
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "ESCALATION":
        return "text-red-600"
      case "REMINDER":
        return "text-yellow-600"
      case "ASSIGNMENT":
        return "text-blue-600"
      case "STATUS_CHANGE":
        return "text-green-600"
      case "GENERAL":
        return "text-gray-600"
      case "BROADCAST":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  const handleMarkAsRead = useCallback(async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id)
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
  }, [markAsRead])

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [markAllAsRead])

  const handleDeleteNotification = useCallback(async (notification: Notification) => {
    try {
      await deleteNotification(notification.id)
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }, [deleteNotification])

  const handleRefresh = useCallback(async () => {
    try {
      await refresh()
      toast.success('Notifications refreshed', {
        icon: React.createElement(CheckCircle2, { className: "text-green-600" }),
      })
    } catch (error) {
      toast.error('Failed to refresh notifications', {
        icon: React.createElement(CircleAlert, { className: "text-red-600" }),
      })
    }
  }, [refresh])

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'connecting':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Notifications</CardTitle>
                {getConnectionStatusIcon()}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {stats && (
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Total: {stats.total}</span>
                <span>Unread: {stats.unread}</span>
                <span>Read: {stats.read}</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {unreadCount > 0 && (
              <div className="px-4 py-2 bg-blue-50 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark all as read
                </Button>
              </div>
            )}
            <ScrollArea className="h-80">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  <CircleAlert className="h-6 w-6 mx-auto mb-2" />
                  <p>Failed to load notifications</p>
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
                    Try Again
                  </Button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.is_read ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleMarkAsRead(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteNotification(notification)
                                  }}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
