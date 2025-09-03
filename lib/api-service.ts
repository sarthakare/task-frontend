// lib/api-service.ts
// Comprehensive centralized API service for all backend endpoints

import { clearAuth } from "@/utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Generic fetch wrapper with error handling and authentication
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
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
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
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
  getAllUsers: () => apiRequest<any[]>('/users/'),
  
  // Get active users only
  getActiveUsers: () => apiRequest<any[]>('/users/active'),
  
  // Get specific user by ID
  getUser: (id: number) => apiRequest<any>(`/users/${id}`),
  
  // Create new user
  createUser: (userData: any) => apiRequest<any>('/users/', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Update user
  updateUser: (id: number, userData: any) => apiRequest<any>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  // Delete user (soft delete)
  deleteUser: (id: number) => apiRequest<void>(`/users/${id}`, {
    method: 'DELETE',
  }),
  
  // Get supervisors list
  getSupervisors: () => apiRequest<any[]>('/users/supervisors/'),
  
  // Get departments list
  getDepartments: () => apiRequest<string[]>('/users/departments/'),
  
  // Get roles list
  getRoles: () => apiRequest<string[]>('/users/roles/'),
  
  // Get user statistics
  getUserStats: () => apiRequest<any>('/users/stats/'),
};

// Authentication API
export const authAPI = {
  // User login
  login: (credentials: { email: string; password: string }) => 
    apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  // User registration
  register: (userData: any) => 
    apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  // Manual login (from original api.ts)
  loginUser: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Login failed");
    }

    return await res.json(); // { access_token, token_type }
  },
  
  // Manual signup (from original api.ts)
  signupUser: async (
    name: string,
    email: string,
    password: string,
    department: string,
    role: string
  ) => {
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

    return await res.json(); // { access_token, token_type }
  },
  
  // Refresh token
  refreshToken: (refreshToken: string) => 
    apiRequest<any>('/auth/refresh', {
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
  getAllTasks: () => apiRequest<any[]>('/tasks/'),
  
  // Get tasks by user
  getTasksByUser: (userId: number) => apiRequest<any[]>(`/tasks/user/${userId}`),
  
  // Get specific task
  getTask: (id: number) => apiRequest<any>(`/tasks/${id}`),
  
  // Create new task
  createTask: (taskData: any) => apiRequest<any>('/tasks/', {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),
  
  // Update task
  updateTask: (id: number, taskData: any) => apiRequest<any>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  }),
  
  // Delete task
  deleteTask: (id: number) => apiRequest<void>(`/tasks/${id}`, {
    method: 'DELETE',
  }),
  
  // Get task statistics
  getTaskStats: () => apiRequest<any>('/tasks/stats/'),
};

// Project Management API
export const projectAPI = {
  // Get all projects
  getAllProjects: () => apiRequest<any[]>('/projects/'),
  
  // Get specific project
  getProject: (id: number) => apiRequest<any>(`/projects/${id}`),
  
  // Create new project
  createProject: (projectData: any) => apiRequest<any>('/projects/', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),
  
  // Update project
  updateProject: (id: number, projectData: any) => apiRequest<any>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  }),
  
  // Delete project
  deleteProject: (id: number) => apiRequest<void>(`/projects/${id}`, {
    method: 'DELETE',
  }),
  
  // Get project statistics
  getProjectStats: () => apiRequest<any>('/projects/stats/'),
};

// Team Management API
export const teamAPI = {
  // Get all teams
  getAllTeams: () => apiRequest<any[]>('/teams/'),
  
  // Get specific team
  getTeam: (id: number) => apiRequest<any>(`/teams/${id}`),
  
  // Create new team
  createTeam: (teamData: any) => apiRequest<any>('/teams/', {
    method: 'POST',
    body: JSON.stringify(teamData),
  }),
  
  // Update team
  updateTeam: (id: number, teamData: any) => apiRequest<any>(`/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(teamData),
  }),
  
  // Delete team
  deleteTeam: (id: number) => apiRequest<void>(`/teams/${id}`, {
    method: 'DELETE',
  }),
  
  // Get team members
  getTeamMembers: (teamId: number) => apiRequest<any[]>(`/teams/${teamId}/members`),
  
  // Add member to team
  addTeamMember: (teamId: number, userId: number) => 
    apiRequest<any>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),
  
  // Remove member from team
  removeTeamMember: (teamId: number, userId: number) => 
    apiRequest<void>(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    }),
};

// Reminder API
export const reminderAPI = {
  // Get all reminders
  getAllReminders: () => apiRequest<any[]>('/reminders/'),
  
  // Get reminders by user
  getRemindersByUser: (userId: number) => apiRequest<any[]>(`/reminders/user/${userId}`),
  
  // Get specific reminder
  getReminder: (id: number) => apiRequest<any>(`/reminders/${id}`),
  
  // Create new reminder
  createReminder: (reminderData: any) => apiRequest<any>('/reminders/', {
    method: 'POST',
    body: JSON.stringify(reminderData),
  }),
  
  // Update reminder
  updateReminder: (id: number, reminderData: any) => apiRequest<any>(`/reminders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reminderData),
  }),
  
  // Delete reminder
  deleteReminder: (id: number) => apiRequest<void>(`/reminders/${id}`, {
    method: 'DELETE',
  }),
  
  // Mark reminder as completed
  markReminderCompleted: (id: number) => 
    apiRequest<any>(`/reminders/${id}/complete`, {
      method: 'PATCH',
    }),
};

// Report API
export const reportAPI = {
  // Get user performance report
  getUserPerformance: (userId: number, dateRange?: string) => 
    apiRequest<any>(`/reports/user/${userId}${dateRange ? `?range=${dateRange}` : ''}`),
  
  // Get team performance report
  getTeamPerformance: (teamId: number, dateRange?: string) => 
    apiRequest<any>(`/reports/team/${teamId}${dateRange ? `?range=${dateRange}` : ''}`),
  
  // Get project progress report
  getProjectProgress: (projectId: number) => 
    apiRequest<any>(`/reports/project/${projectId}`),
  
  // Get overall system statistics
  getSystemStats: (dateRange?: string) => 
    apiRequest<any>(`/reports/system${dateRange ? `?range=${dateRange}` : ''}`),
  
  // Export report
  exportReport: (reportType: string, params: any) => 
    apiRequest<any>(`/reports/export/${reportType}`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard overview data
  getOverview: () => apiRequest<any>('/dashboard/overview'),
  
  // Get recent activities
  getRecentActivities: (limit?: number) => 
    apiRequest<any[]>(`/dashboard/activities${limit ? `?limit=${limit}` : ''}`),
  
  // Get upcoming deadlines
  getUpcomingDeadlines: (days?: number) => 
    apiRequest<any[]>(`/dashboard/deadlines${days ? `?days=${days}` : ''}`),
  
  // Get user workload
  getUserWorkload: (userId: number) => 
    apiRequest<any>(`/dashboard/workload/${userId}`),
  
  // Get team workload
  getTeamWorkload: (teamId: number) => 
    apiRequest<any>(`/dashboard/team-workload/${teamId}`),
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
  handleError: (error: any) => {
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
  utils: apiUtils,
};

// Export individual functions for backward compatibility
export const loginUser = authAPI.loginUser;
export const signupUser = authAPI.signupUser;

// Default export
export default api;
