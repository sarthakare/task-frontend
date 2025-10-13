// Analytics service for comprehensive reporting and data visualization
import { api } from './api-service';
import { getToken } from '@/utils/auth';

export interface OverviewData {
  total_users: number;
  active_users: number;
  total_projects: number;
  active_projects: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  avg_task_duration_days?: number;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_role: Record<string, number>;
  users_by_department: Record<string, number>;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
}

export interface TeamStats {
  total_teams: number;
  active_teams: number;
  inactive_teams: number;
  department_counts: Record<string, number>;
}

export interface RecentActivity {
  id: string | number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  action: string;
  description: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
  created_at?: string;
  updated_at?: string | null;
  due_date?: string | null;
  project_id?: number;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  manager_id?: number;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  department?: string;
  created_at?: string;
  updated_at?: string | null;
  manager_id?: number;
}

export interface AnalyticsData {
  overview: OverviewData | null;
  userStats: UserStats | null;
  projectStats: ProjectStats | null;
  teamStats: TeamStats | null;
  taskStatusData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  userActivityData: Array<{
    date: string;
    tasks_completed: number;
    tasks_created: number;
    users_active: number;
  }>;
  projectProgressData: Array<{
    name: string;
    completed: number;
    total: number;
    percentage: number;
  }>;
  teamPerformanceData: Array<{
    team: string;
    efficiency: number;
    tasks_completed: number;
    avg_duration: number;
  }>;
  recentActivities: RecentActivity[];
  loading: {
    overview: boolean;
    userStats: boolean;
    projectStats: boolean;
    teamStats: boolean;
    activities: boolean;
    charts: boolean;
  };
  error: string | null;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private getUserRole(): string {
    // Get user role from localStorage or context
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.role?.toUpperCase() || 'MEMBER';
      } catch (error) {
        console.error('Error parsing user data:', error);
        return 'MEMBER';
      }
    }
    return 'MEMBER';
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): unknown {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  async fetchAllAnalyticsData(): Promise<AnalyticsData> {
    const userRole = this.getUserRole();
    return this.fetchRoleBasedAnalyticsData(userRole);
  }

  async fetchRoleBasedAnalyticsData(userRole: string): Promise<AnalyticsData> {
    const loading = {
      overview: true,
      userStats: true,
      projectStats: true,
      teamStats: true,
      activities: true,
      charts: true,
    };

    const data: AnalyticsData = {
      overview: null,
      userStats: null,
      projectStats: null,
      teamStats: null,
      taskStatusData: [],
      userActivityData: [],
      projectProgressData: [],
      teamPerformanceData: [],
      recentActivities: [],
      loading,
      error: null,
    };

    try {
      // Fetch data based on user role
      const [
        overview,
        userStats,
        projectStats,
        teamStats,
        activities,
        tasks,
        projects,
        teams
      ] = await Promise.allSettled([
        this.getRoleBasedOverview(userRole),
        this.getRoleBasedUserStats(userRole),
        this.getRoleBasedProjectStats(userRole),
        this.getRoleBasedTeamStats(userRole),
        this.getRoleBasedActivities(userRole),
        this.getRoleBasedTasks(userRole),
        this.getRoleBasedProjects(userRole),
        this.getRoleBasedTeams(userRole)
      ]);

      // Process overview data
      if (overview.status === 'fulfilled') {
        data.overview = overview.value;
        data.loading.overview = false;
      }

      // Process user stats
      if (userStats.status === 'fulfilled') {
        data.userStats = userStats.value;
        data.loading.userStats = false;
      }

      // Process project stats
      if (projectStats.status === 'fulfilled') {
        data.projectStats = projectStats.value;
        data.loading.projectStats = false;
      }

      // Process team stats
      if (teamStats.status === 'fulfilled') {
        data.teamStats = teamStats.value;
        data.loading.teamStats = false;
      }

      // Process activities
      if (activities.status === 'fulfilled') {
        data.recentActivities = activities.value;
        data.loading.activities = false;
      }

      // Process tasks for charts
      if (tasks.status === 'fulfilled') {
        data.taskStatusData = this.processTaskStatusData(tasks.value);
        data.userActivityData = this.processUserActivityData(tasks.value);
      }

      // Process projects for charts
      if (projects.status === 'fulfilled') {
        data.projectProgressData = this.processProjectProgressData(projects.value);
      }

      // Process teams for charts
      if (teams.status === 'fulfilled') {
        data.teamPerformanceData = this.processTeamPerformanceData(teams.value);
      }

      data.loading.charts = false;

    } catch (error) {
      data.error = error instanceof Error ? error.message : 'Failed to fetch analytics data';
      // Reset loading states on error
      Object.keys(data.loading).forEach(key => {
        data.loading[key as keyof typeof data.loading] = false;
      });
    }

    return data;
  }

  private processTaskStatusData(tasks: Array<{ status?: string }>): Array<{ name: string; value: number; color: string }> {
    const statusCounts = tasks.reduce((acc: Record<string, number>, task) => {
      const status = task.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    let colorIndex = 0;

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count as number,
      color: colors[colorIndex++ % colors.length]
    }));
  }

  private processUserActivityData(tasks: Array<{ created_at?: string; updated_at?: string | null; assigned_to?: number; status?: string }>): Array<{
    date: string;
    tasks_completed: number;
    tasks_created: number;
    users_active: number;
  }> {
    // Generate last 7 days of data
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(task => {
        const dateValue = task.created_at || task.updated_at;
        if (!dateValue) return false;
        const taskDate = new Date(dateValue);
        return taskDate.toISOString().split('T')[0] === dateStr;
      });

      const completedTasks = dayTasks.filter(task => task.status === 'FINISHED').length;
      const createdTasks = dayTasks.length;
      const activeUsers = new Set(dayTasks.map(task => task.assigned_to)).size;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tasks_completed: completedTasks,
        tasks_created: createdTasks,
        users_active: activeUsers
      });
    }

    return data;
  }

  private processProjectProgressData(projects: Array<{ name?: string }>): Array<{
    name: string;
    completed: number;
    total: number;
    percentage: number;
  }> {
    return projects.slice(0, 10).map(project => {
      // Mock progress calculation - in real app, this would be based on task completion
      const totalTasks = Math.floor(Math.random() * 20) + 5;
      const completedTasks = Math.floor(Math.random() * totalTasks);
      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        name: project.name || 'Unnamed Project',
        completed: completedTasks,
        total: totalTasks,
        percentage
      };
    });
  }

  private processTeamPerformanceData(teams: Array<{ name?: string }>): Array<{
    team: string;
    efficiency: number;
    tasks_completed: number;
    avg_duration: number;
  }> {
    return teams.slice(0, 8).map(team => {
      // Mock performance metrics - in real app, these would be calculated from actual data
      const efficiency = Math.floor(Math.random() * 40) + 60; // 60-100%
      const tasksCompleted = Math.floor(Math.random() * 50) + 10;
      const avgDuration = Math.floor(Math.random() * 10) + 2; // 2-12 days

      return {
        team: team.name || 'Unnamed Team',
        efficiency,
        tasks_completed: tasksCompleted,
        avg_duration: avgDuration
      };
    });
  }

  async exportAnalyticsReport(format: 'pdf' | 'excel' = 'pdf'): Promise<{ download_url: string; file_name: string }> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log(`Exporting ${format} report from: ${API_BASE_URL}/reports/export/analytics`);
      
      const response = await fetch(`${API_BASE_URL}/reports/export/analytics?format=${format}&date_range=last_30_days&include_charts=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Export response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Export error response:', errorText);
        throw new Error(`Export failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `analytics_report_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'html' : 'csv'}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      console.log(`Downloading file: ${filename}`);

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL after a delay to ensure download starts
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);

      return {
        download_url: downloadUrl,
        file_name: filename
      };
    } catch (error) {
      console.error('Export error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection and ensure the backend server is running.');
      }
      throw new Error(`Failed to export report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFilteredAnalyticsData(filters: {
    dateRange?: string;
    department?: string;
    team?: string;
    project?: string;
  }): Promise<AnalyticsData> {
    // This would implement filtered data fetching based on the provided filters
    // For now, return the full dataset
    console.log('Filters applied:', filters);
    return this.fetchAllAnalyticsData();
  }

  // Role-based data fetching methods
  private async getRoleBasedOverview(userRole: string): Promise<OverviewData> {
    const cacheKey = `overview_${userRole}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey) as OverviewData;
    }

    const overview = await api.dashboard.getOverview();
    this.setCache(cacheKey, overview);
    return overview;
  }

  private async getRoleBasedUserStats(userRole: string): Promise<UserStats> {
    const cacheKey = `userStats_${userRole}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey) as UserStats;
    }

    const userStats = await api.users.getUserStats();
    this.setCache(cacheKey, userStats);
    return userStats;
  }

  private async getRoleBasedProjectStats(userRole: string): Promise<ProjectStats> {
    const cacheKey = `projectStats_${userRole}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey) as ProjectStats;
    }

    const projectStats = await api.projects.getProjectStats();
    this.setCache(cacheKey, projectStats);
    return projectStats;
  }

  private async getRoleBasedTeamStats(userRole: string): Promise<TeamStats> {
    const cacheKey = `teamStats_${userRole}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey) as TeamStats;
    }

    const teamStats = await api.teams.getTeamStats();
    this.setCache(cacheKey, teamStats);
    return teamStats;
  }

  private async getRoleBasedActivities(userRole: string): Promise<RecentActivity[]> {
    const cacheKey = `activities_${userRole}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey) as RecentActivity[];
    }

    const activities = await api.dashboard.getRecentActivities(10);
    this.setCache(cacheKey, activities);
    return activities;
  }

  private async getRoleBasedTasks(userRole: string): Promise<Task[]> {
    const cacheKey = `tasks_${userRole}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey) as Task[];
    }

    const tasks = await api.tasks.getAllTasks();
    this.setCache(cacheKey, tasks);
    return tasks;
  }

  private async getRoleBasedProjects(userRole: string): Promise<Project[]> {
    const cacheKey = `projects_${userRole}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey) as Project[];
    }

    const projects = await api.projects.getAllProjects();
    this.setCache(cacheKey, projects);
    return projects;
  }

  private async getRoleBasedTeams(userRole: string): Promise<Team[]> {
    const cacheKey = `teams_${userRole}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey) as Team[];
    }

    const teams = await api.teams.getAllTeams();
    this.setCache(cacheKey, teams);
    return teams;
  }

  // Get role-specific scope description
  getRoleScopeDescription(userRole: string): string {
    const scopeDescriptions = {
      'ADMIN': 'Full system access - can view all users, projects, teams, and tasks across the entire organization',
      'CEO': 'Organization-wide access - can view all users, projects, teams, and tasks in the organization',
      'MANAGER': 'Department scope - can view self and all users in the department, including their tasks and projects',
      'TEAM_LEAD': 'Team scope - can view self and team members, including team tasks and projects',
      'MEMBER': 'Personal scope - can view only own tasks and projects'
    };
    
    return scopeDescriptions[userRole as keyof typeof scopeDescriptions] || 'Limited access - can view only own data';
  }

  // Get role-specific metrics
  getRoleSpecificMetrics(userRole: string): string[] {
    const roleMetrics = {
      'ADMIN': [
        'Total System Users',
        'Active Users',
        'Total Projects',
        'System-wide Task Completion',
        'Department Performance',
        'User Activity Trends',
        'System Health Metrics'
      ],
      'CEO': [
        'Organization Performance',
        'Department Metrics',
        'Project Success Rates',
        'Team Performance',
        'User Productivity',
        'Strategic KPIs',
        'Executive Dashboard'
      ],
      'MANAGER': [
        'Department Performance',
        'Team Productivity',
        'Project Progress',
        'Team Member Performance',
        'Department Task Completion',
        'Resource Utilization',
        'Department KPIs'
      ],
      'TEAM_LEAD': [
        'Team Performance',
        'Team Member Productivity',
        'Team Task Completion',
        'Project Progress',
        'Team Efficiency',
        'Member Performance',
        'Team KPIs'
      ],
      'MEMBER': [
        'Personal Task Completion',
        'Task Performance',
        'Productivity Metrics',
        'Task Status Overview',
        'Personal KPIs',
        'Task History',
        'Performance Trends'
      ]
    };
    
    return roleMetrics[userRole as keyof typeof roleMetrics] || ['Personal Metrics'];
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const analyticsService = AnalyticsService.getInstance();
