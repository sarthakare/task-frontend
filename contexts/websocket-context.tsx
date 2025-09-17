"use client";
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { websocketAPI } from '@/lib/api-service';
import { toast } from 'sonner';
import { useAuth } from './auth-context';
import { getToken } from '@/utils/auth';

interface WebSocketContextType {
  isConnected: boolean;
  connectionStatus: string;
  sendMessage: (message: any) => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface ConnectedUser {
  user_id: number;
  user_name: string;
  user_role: string;
  user_department: string;
  connected_at: string;
}

interface TaskNotificationData {
  task_id: number;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  project_name?: string;
  team_name?: string;
  creator_name?: string;
  assignee_name?: string;
  updated_by?: string;
}

interface TeamNotificationData {
  team_id: number;
  team_name: string;
  description?: string;
  department?: string;
  status?: string;
  leader_name?: string;
  member_count?: number;
  created_by?: string;
}

interface ProjectNotificationData {
  project_id: number;
  project_name: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  manager_name?: string;
  team_count?: number;
  created_by?: string;
}

interface MessageData {
  type: string;
  content?: string;
  target?: string;
  target_id?: string;
  toast_type?: string;
  title?: string;
  message?: string;
  timestamp?: string;
  sender?: string;
  user_info?: any;
  users?: ConnectedUser[];
  total_count?: number;
  notification_type?: string;
  task_data?: TaskNotificationData;
  team_data?: TeamNotificationData;
  project_data?: ProjectNotificationData;
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected");
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  // Get auth context
  const { user, isAuthenticated } = useAuth();

  const connectWebSocket = () => {
    // Only connect if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, skipping WebSocket connection');
      return;
    }

    const token = getToken();
    if (!token) {
      console.log('No auth token found, skipping WebSocket connection');
      return;
    }

    try {
      console.log('Attempting to connect to WebSocket...');
      setConnectionStatus("Connecting");

      const ws = websocketAPI.createConnection(
        (data) => {
          try {
            const parsedData: MessageData = JSON.parse(data);
            handleWebSocketMessage(parsedData);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        },
        (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus("Error");
          setIsConnected(false);
          handleReconnection();
        }
      );

      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionStatus("Connected");
        reconnectAttempts.current = 0;
        
        // Request connected users list
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "get_users" }));
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        setConnectionStatus("Disconnected");
        handleReconnection();
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus("Error");
      handleReconnection();
    }
  };

  const handleReconnection = () => {
    if (!isAuthenticated || !user) {
      console.log('Skipping reconnection: User not authenticated');
      setConnectionStatus("Disconnected");
      return;
    }
    
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++;
      console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, reconnectDelay);
    } else {
      console.log('Max reconnection attempts reached');
      setConnectionStatus("Failed");
    }
  };

  const handleWebSocketMessage = (parsedData: MessageData) => {
    if (parsedData.type === "toast") {
      // Handle toast notifications
      const { toast_type, title, message, target, target_id, sender } = parsedData;
      
      let toastTitle = title;
      if (target && target !== "all") {
        toastTitle = `[${target.toUpperCase()}] ${title}`;
      }
      if (sender) {
        toastTitle = `${toastTitle} (from ${sender})`;
      }
      
      switch (toast_type) {
        case "success":
          toast.success(toastTitle, { description: message });
          break;
        case "error":
          toast.error(toastTitle, { description: message });
          break;
        case "warning":
          toast.warning(toastTitle, { description: message });
          break;
        case "info":
        default:
          toast.info(toastTitle, { description: message });
          break;
      }
      
    } else if (parsedData.type === "task_notification") {
      // Handle task notifications
      const { notification_type, title, message, task_data } = parsedData;
      
      let toastType = "info";
      let toastTitle = title;
      
      switch (notification_type) {
        case "task_assigned":
          toastType = "success";
          toastTitle = "🎯 New Task Assigned";
          break;
        case "task_reassigned":
          toastType = "warning";
          toastTitle = "🔄 Task Reassigned";
          break;
        case "task_status_updated":
          toastType = "info";
          toastTitle = "📊 Task Status Updated";
          break;
        case "task_updated":
          toastType = "info";
          toastTitle = "✏️ Task Updated";
          break;
        case "team_task_created":
          toastType = "info";
          toastTitle = "👥 Team Task Created";
          break;
      }
      
      // Show toast notification
      switch (toastType) {
        case "success":
          toast.success(toastTitle, { 
            description: message,
            duration: 5000
          });
          break;
        case "warning":
          toast.warning(toastTitle, { 
            description: message,
            duration: 5000
          });
          break;
        case "info":
        default:
          toast.info(toastTitle, { 
            description: message,
            duration: 5000
          });
          break;
      }
      
    } else if (parsedData.type === "team_notification") {
      // Handle team notifications
      const { notification_type, title, message, team_data } = parsedData;
      
      let toastType = "info";
      let toastTitle = title;
      
      switch (notification_type) {
        case "team_created":
          toastType = "success";
          toastTitle = "👥 New Team Created";
          break;
        case "team_updated":
          toastType = "info";
          toastTitle = "✏️ Team Updated";
          break;
        case "team_member_added":
          toastType = "info";
          toastTitle = "➕ Team Member Added";
          break;
        case "team_member_removed":
          toastType = "warning";
          toastTitle = "➖ Team Member Removed";
          break;
      }
      
      // Show toast notification
      switch (toastType) {
        case "success":
          toast.success(toastTitle, { 
            description: message,
            duration: 5000
          });
          break;
        case "warning":
          toast.warning(toastTitle, { 
            description: message,
            duration: 5000
          });
          break;
        case "info":
        default:
          toast.info(toastTitle, { 
            description: message,
            duration: 5000
          });
          break;
      }
      
    } else if (parsedData.type === "project_notification") {
      // Handle project notifications
      const { notification_type, title, message, project_data } = parsedData;
      
      let toastType = "info";
      let toastTitle = title;
      
      switch (notification_type) {
        case "project_created":
          toastType = "success";
          toastTitle = "🚀 New Project Created";
          break;
        case "project_updated":
          toastType = "info";
          toastTitle = "✏️ Project Updated";
          break;
        case "project_status_changed":
          toastType = "info";
          toastTitle = "📊 Project Status Changed";
          break;
        case "project_team_added":
          toastType = "info";
          toastTitle = "👥 Team Added to Project";
          break;
        case "project_team_removed":
          toastType = "warning";
          toastTitle = "➖ Team Removed from Project";
          break;
      }
      
      // Show toast notification
      switch (toastType) {
        case "success":
          toast.success(toastTitle, { 
            description: message,
            duration: 5000
          });
          break;
        case "warning":
          toast.warning(toastTitle, { 
            description: message,
            duration: 5000
          });
          break;
        case "info":
        default:
          toast.info(toastTitle, { 
            description: message,
            duration: 5000
          });
          break;
      }
      
    } else if (parsedData.type === "users_list") {
      // Handle users list response
      setConnectedUsers(parsedData.users || []);
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  };

  const reconnect = () => {
    if (!isAuthenticated || !user) {
      console.log('Cannot reconnect: User not authenticated');
      return;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttempts.current = 0;
    connectWebSocket();
  };

  // Connect when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connectWebSocket();
    } else {
      // Disconnect if user is not authenticated
      if (wsRef.current) {
        wsRef.current.close();
        setIsConnected(false);
        setConnectionStatus("Disconnected");
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, user]);

  // Listen for auth changes (backup mechanism)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue && isAuthenticated && user) {
          // Token was added and user is authenticated, connect
          connectWebSocket();
        } else {
          // Token was removed or user not authenticated, disconnect
          if (wsRef.current) {
            wsRef.current.close();
          }
          setIsConnected(false);
          setConnectionStatus("Disconnected");
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, user]);

  const value: WebSocketContextType = {
    isConnected,
    connectionStatus,
    sendMessage,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
