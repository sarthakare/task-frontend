// lib/api-service.ts
// Comprehensive centralized API service for all backend endpoints

import type { 
  User, 
  UserCreate, 
  UserUpdate, 
  UserLogin, 
  SupervisorList, 
  TokenResponse, 
  UserStats,
  Task,
  TaskCreate,
  TaskUpdate,
  TaskLog,
  TaskLogCreate,
  Project,
  ProjectCreate,
  ProjectUpdate,
  Team,
  TeamCreate,
  TeamUpdate,
  Reminder,
  ReminderCreate,
  ReminderUpdate,
  ReportParams,
  DashboardOverview,
  Activity,
  UserPerformance,
  TeamPerformance,
  ProjectProgress,
  SystemStats
} from "@/types";
import { getToken, clearAuth } from "@/utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Generic fetch wrapper with error handling and authentication
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
      
      // Handle specific error cases
      if (response.status === 400 && errorMessage.includes("deactivated")) {
        clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// Generic API fetch that handles 401, error handling, and base URL prefixing
export async function apiFetch(input: string | Request, init?: RequestInit) {
  const url = typeof input === "string" ? `${API_BASE_URL}${input.startsWith("/") ? "" : "/"}${input}` : input;
  const res = await fetch(url, init);

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    throw new Error("Unauthorized");
  }

  return res;
}

// User Management API
export const userAPI = {
  // Get all users
  getAllUsers: () => apiRequest<User[]>('/users/'),
  
  // Get active users only
  getActiveUsers: () => apiRequest<User[]>('/users/active'),
  
  // Get specific user by ID
  getUser: (id: number) => apiRequest<User>(`/users/${id}`),
  
  // Create new user
  createUser: (userData: UserCreate) => apiRequest<User>('/users/', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Update user
  updateUser: (id: number, userData: UserUpdate) => apiRequest<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  // Delete user (soft delete)
  deleteUser: (id: number) => apiRequest<void>(`/users/${id}`, {
    method: 'DELETE',
  }),
  
  // Get supervisors list
  getSupervisors: () => apiRequest<SupervisorList[]>('/users/supervisors/'),
  
  // Get departments list
  getDepartments: () => apiRequest<string[]>('/users/departments/'),
  
  // Get roles list
  getRoles: () => apiRequest<string[]>('/users/roles/'),
  
  // Get user statistics
  getUserStats: () => apiRequest<UserStats>('/users/stats/'),
  
  // Get current user information
  getCurrentUser: () => apiRequest<User>('/users/me'),
};

// Authentication API
export const authAPI = {
  // User login
  login: (credentials: UserLogin) => 
    apiRequest<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  // User registration
  register: (userData: UserCreate) => 
    apiRequest<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  // Manual login (from original api.ts)
  loginUser: async (email: string, password: string): Promise<TokenResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      const errorMessage = error.detail || "Login failed";
      
      // Handle deactivated user case
      if (res.status === 400 && errorMessage.includes("deactivated")) {
        clearAuth();
      }
      
      throw new Error(errorMessage);
    }

    return await res.json(); // { access_token, token_type, user }
  },
  
  // Manual signup (from original api.ts)
  signupUser: async (
    name: string,
    email: string,
    password: string,
    department: string,
    role: string
  ): Promise<TokenResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, department, role }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Signup failed");
    }

    return await res.json(); // { access_token, token_type, user }
  },
  
  // Refresh token
  refreshToken: (refreshToken: string) => 
    apiRequest<TokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
  
  // Logout
  logout: () => 
    apiRequest<void>('/auth/logout', {
      method: 'POST',
    }),
};

// Task Management API
export const taskAPI = {
  // Get all tasks
  getAllTasks: () => apiRequest<Task[]>('/tasks/'),
  
  // Get tasks by user
  getTasksByUser: (userId: number) => apiRequest<Task[]>(`/tasks/user/${userId}`),
  
  // Get specific task
  getTask: (id: number) => apiRequest<Task>(`/tasks/${id}`),
  
  // Create new task
  createTask: (taskData: TaskCreate) => apiRequest<Task>('/tasks/', {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),
  
  // Update task
  updateTask: (id: number, taskData: TaskUpdate) => apiRequest<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  }),
  
  // Update task status only
  updateTaskStatus: (id: number, status: string) => apiRequest<Task>(`/tasks/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  
  // Delete task
  deleteTask: (id: number) => apiRequest<void>(`/tasks/${id}`, {
    method: 'DELETE',
  }),
  
  // Get task statistics
  getTaskStats: () => apiRequest<{ total: number; by_status: Record<string, number>; by_priority: Record<string, number> }>('/tasks/stats/'),
  
  // Get user's task access scope
  getAccessScope: () => apiRequest<{
    user_role: string;
    scope_description: string;
    viewable_user_count: number;
    viewable_users: Array<{
      id: number;
      name: string;
      role: string;
      department: string;
    }>;
  }>('/tasks/access-scope'),
  
  // Check if user can edit a specific task
  canEditTask: (taskId: number) => apiRequest<{
    can_edit: boolean;
    user_id: number;
    user_role: string;
    task_id: number;
  }>(`/tasks/${taskId}/can-edit`),
  
  // Task Log Management
  // Create task log
  createTaskLog: (taskId: number, logData: TaskLogCreate) => apiRequest<TaskLog>(`/tasks/${taskId}/logs`, {
    method: 'POST',
    body: JSON.stringify(logData),
  }),
  
  // Get task logs
  getTaskLogs: (taskId: number) => apiRequest<TaskLog[]>(`/tasks/${taskId}/logs`),
};

// Project Management API
export const projectAPI = {
  // Get all projects
  getAllProjects: () => apiRequest<Project[]>('/projects/'),
  
  // Get specific project
  getProject: (id: number) => apiRequest<Project>(`/projects/${id}`),
  
  // Create new project
  createProject: (projectData: ProjectCreate) => apiRequest<Project>('/projects/', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),
  
  // Update project
  updateProject: (id: number, projectData: ProjectUpdate) => apiRequest<Project>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  }),
  
  // Delete project
  deleteProject: (id: number) => apiRequest<void>(`/projects/${id}`, {
    method: 'DELETE',
  }),
  
  // Get project statistics
  getProjectStats: () => apiRequest<{ total: number; active: number; completed: number }>('/projects/stats/'),
};

// Team Management API
export const teamAPI = {
  // Get all teams
  getAllTeams: () => apiRequest<Team[]>('/teams/'),
  
  // Get specific team
  getTeam: (id: number) => apiRequest<Team>(`/teams/${id}`),
  
  // Create new team
  createTeam: (teamData: TeamCreate) => apiRequest<Team>('/teams/', {
    method: 'POST',
    body: JSON.stringify(teamData),
  }),
  
  // Update team
  updateTeam: (id: number, teamData: TeamUpdate) => apiRequest<Team>(`/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(teamData),
  }),
  
  // Delete team
  deleteTeam: (id: number) => apiRequest<void>(`/teams/${id}`, {
    method: 'DELETE',
  }),
  
  // Get team members
  getTeamMembers: (teamId: number) => apiRequest<User[]>(`/teams/${teamId}/members`),
  
  // Add member to team
  addTeamMember: (teamId: number, userId: number) => 
    apiRequest<{ message: string }>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),
  
  // Remove member from team
  removeTeamMember: (teamId: number, userId: number) => 
    apiRequest<void>(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    }),
  
  // Get team statistics
  getTeamStats: () => apiRequest<{
    total_teams: number;
    active_teams: number;
    inactive_teams: number;
    department_counts: Record<string, number>;
  }>('/teams/stats/'),
};

// Reminder API
export const reminderAPI = {
  // Get all reminders
  getAllReminders: () => apiRequest<Reminder[]>('/reminders/'),
  
  // Get reminders by user
  getRemindersByUser: (userId: number) => apiRequest<Reminder[]>(`/reminders/user/${userId}`),
  
  // Get specific reminder
  getReminder: (id: number) => apiRequest<Reminder>(`/reminders/${id}`),
  
  // Create new reminder
  createReminder: (reminderData: ReminderCreate) => apiRequest<Reminder>('/reminders/', {
    method: 'POST',
    body: JSON.stringify(reminderData),
  }),
  
  // Update reminder
  updateReminder: (id: number, reminderData: ReminderUpdate) => apiRequest<Reminder>(`/reminders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reminderData),
  }),
  
  // Delete reminder
  deleteReminder: (id: number) => apiRequest<void>(`/reminders/${id}`, {
    method: 'DELETE',
  }),
  
  // Mark reminder as completed
  markReminderCompleted: (id: number) => 
    apiRequest<Reminder>(`/reminders/${id}/complete`, {
      method: 'PATCH',
    }),

  // Get reminder statistics
  getReminderStats: (userId?: number) => {
    const url = userId ? `/reminders/stats/overview?user_id=${userId}` : '/reminders/stats/overview';
    return apiRequest<{
      total_reminders: number;
      active_reminders: number;
      completed_reminders: number;
      overdue_reminders: number;
      today_reminders: number;
    }>(url);
  },
};

// Report API
export const reportAPI = {
  // Get user performance report
  getUserPerformance: (userId: number, dateRange?: string) => 
    apiRequest<UserPerformance>(`/reports/user/${userId}${dateRange ? `?range=${dateRange}` : ''}`),
  
  // Get team performance report
  getTeamPerformance: (teamId: number, dateRange?: string) => 
    apiRequest<TeamPerformance>(`/reports/team/${teamId}${dateRange ? `?range=${dateRange}` : ''}`),
  
  // Get project progress report
  getProjectProgress: (projectId: number) => 
    apiRequest<ProjectProgress>(`/reports/project/${projectId}`),
  
  // Get overall system statistics
  getSystemStats: (dateRange?: string) => 
    apiRequest<SystemStats>(`/reports/system${dateRange ? `?range=${dateRange}` : ''}`),
  
  // Export report
  exportReport: (reportType: string, params: ReportParams) => 
    apiRequest<{ download_url: string; file_name: string }>(`/reports/export/${reportType}`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard overview data
  getOverview: () => apiRequest<DashboardOverview>('/dashboard/overview'),
  
  // Get recent activities
  getRecentActivities: (limit?: number) => 
    apiRequest<Activity[]>(`/dashboard/activities${limit ? `?limit=${limit}` : ''}`),
  
  // Get upcoming deadlines
  getUpcomingDeadlines: (days?: number) => 
    apiRequest<Task[]>(`/dashboard/deadlines${days ? `?days=${days}` : ''}`),
  
  // Get user workload
  getUserWorkload: (userId: number) => 
    apiRequest<{ user: User; tasks: Task[]; workload_percentage: number }>(`/dashboard/workload/${userId}`),
  
  // Get team workload
  getTeamWorkload: (teamId: number) => 
    apiRequest<{ team: Team; members_workload: Array<{ user: User; tasks: Task[]; workload_percentage: number }> }>(`/dashboard/team-workload/${teamId}`),
};

// WebSocket API
export const websocketAPI = {
  // Create WebSocket connection
  createConnection: (onMessage?: (data: string) => void, onError?: (error: Event) => void) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Convert HTTP/HTTPS to WS/WSS for WebSocket connections
    let wsUrl: string;
    if (API_BASE_URL.startsWith('https://')) {
      wsUrl = API_BASE_URL.replace('https://', 'wss://') + '/ws';
    } else if (API_BASE_URL.startsWith('http://')) {
      wsUrl = API_BASE_URL.replace('http://', 'ws://') + '/ws';
    } else {
      // Fallback for localhost or other cases
      wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws';
    }
    
    const ws = new WebSocket(wsUrl);
    
    if (onMessage) {
      ws.onmessage = (event) => onMessage(event.data);
    }
    
    if (onError) {
      ws.onerror = onError;
    }
    
    return ws;
  },
  
  // Get WebSocket URL
  getWebSocketURL: () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Convert HTTP/HTTPS to WS/WSS for WebSocket connections
    if (API_BASE_URL.startsWith('https://')) {
      return API_BASE_URL.replace('https://', 'wss://') + '/ws';
    } else if (API_BASE_URL.startsWith('http://')) {
      return API_BASE_URL.replace('http://', 'ws://') + '/ws';
    } else {
      // Fallback for localhost or other cases
      return API_BASE_URL.replace('http', 'ws') + '/ws';
    }
  },
};

// Utility functions
export const apiUtils = {
  // Get API base URL (useful for external integrations)
  getBaseURL: () => API_BASE_URL,
  
  // Create full URL for a specific endpoint
  createURL: (endpoint: string) => `${API_BASE_URL}${endpoint}`,
  
  // Build URL with proper formatting (from original api.ts)
  buildUrl: (endpoint: string) => {
    if (endpoint.startsWith("http")) return endpoint; // already a full URL
    return `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  },
  
  // Handle common API errors
  handleError: (error: unknown) => {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },
  
  // Check if response is successful
  isSuccess: (response: Response) => response.ok,
  
  // Parse error response
  parseError: async (response: Response) => {
    try {
      const errorData = await response.json();
      return errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
    } catch {
      return `HTTP ${response.status}: ${response.statusText}`;
    }
  },
};

// Export the main API object for easy access
export const api = {
  users: userAPI,
  auth: authAPI,
  tasks: taskAPI,
  projects: projectAPI,
  teams: teamAPI,
  reminders: reminderAPI,
  reports: reportAPI,
  dashboard: dashboardAPI,
  websocket: websocketAPI,
  utils: apiUtils,
};

// Export individual functions for backward compatibility
export const loginUser = authAPI.loginUser;
export const signupUser = authAPI.signupUser;

// Default export
export default api;
