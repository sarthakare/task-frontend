export interface User {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  department: string;
  supervisor_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Task {
  id: number
  title: string
  description: string
  created_by: number
  creator: User
  assigned_to: number
  assignee: User
  observers?: string[]
  status: "NEW" | "IN_PROGRESS" | "PENDING" | "FINISHED" | "STOPPED" | "CANCELLED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  start_date: string
  due_date: string
  follow_up_date: string
  followUpDate?: string
  createdAt: string
  updatedAt?: string
  completedAt?: string
  tags: string[]
  created_at: string
  updated_at?: string | null
  logs: TaskLog[];
}

export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'PENDING' | 'FINISHED' | 'STOPPED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
}



export interface Report {
  userId: string
  userName: string
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  completionRate: number
  avgResponseTime: number
  escalatedTasks: number
}

export interface TaskLog {
  id: number;
  task_id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface HierarchyUser {
  id: number
  name: string
  email: string
}

export interface DepartmentHierarchy {
  department: string
  roles: Record<string, HierarchyUser[]>
}

export interface TaskCreate {
  title: string;
  description: string;
  assigned_to: number;
  observers?: string[];
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string;
  due_date: string;
  follow_up_date: string;
  tags: string[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  assigned_to?: number;
  observers?: string[];
  status?: TaskStatus;
  priority?: TaskPriority;
  start_date?: string;
  due_date?: string;
  follow_up_date?: string;
  tags?: string[];
}

export interface ProjectCreate {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
  manager_id: number;
  team_members: number[];
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  priority?: string;
  manager_id?: number;
  team_members?: number[];
}

export interface TeamCreate {
  name: string;
  description: string;
  leader_id: number;
  member_ids: number[];
  department: string;
}

export interface TeamUpdate {
  name?: string;
  description?: string;
  leader_id?: number;
  member_ids?: number[];
  department?: string;
}

export interface ReminderCreate {
  title: string;
  description: string;
  due_date: string;
  priority: string;
  user_id: number;
  task_id?: number;
}

export interface ReminderUpdate {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: string;
  user_id?: number;
  task_id?: number;
}

export interface ReportParams {
  start_date?: string;
  end_date?: string;
  user_id?: number;
  department?: string;
  status?: string;
}

// Additional types for API service
export interface UserCreate {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  role: string;
  department: string;
  supervisor_id?: number;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  mobile?: string;
  role?: string;
  department?: string;
  supervisor_id?: number;
  is_active?: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SupervisorList {
  id: number;
  name: string;
  department: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_department: Record<string, number>;
  users_by_role: Record<string, number>;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
  manager_id: number;
  manager: User;
  team_members: User[];
  created_at: string;
  updated_at?: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  leader_id: number;
  leader: User;
  members: User[];
  department: string;
  created_at: string;
  updated_at?: string;
}

export interface Reminder {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  user_id: number;
  user: User;
  task_id?: number;
  task?: Task;
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DashboardOverview {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  total_projects: number;
  active_projects: number;
  total_users: number;
  active_users: number;
}

export interface Activity {
  id: number;
  user_id: number;
  user: User;
  action: string;
  description: string;
  created_at: string;
}

export interface UserPerformance {
  user_id: number;
  user: User;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  average_completion_time: number;
  overdue_tasks: number;
}

export interface TeamPerformance {
  team_id: number;
  team: Team;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  members_performance: UserPerformance[];
}

export interface ProjectProgress {
  project_id: number;
  project: Project;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  estimated_completion: string;
}

export interface SystemStats {
  users: UserStats;
  tasks: {
    total: number;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  performance_metrics: {
    avg_task_completion_time: number;
    avg_project_completion_time: number;
    user_productivity: number;
  };
}