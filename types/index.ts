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
  project_id?: number
  project?: Project
  team_id?: number
  team?: Team
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
  attachments: TaskAttachment[];
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
  start_time: string;
  end_time?: string;
  percentage?: number;
  created_at: string;
}

export interface TaskLogCreate {
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  percentage?: number;
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
  project_id?: number;
  team_id?: number;
  assigned_to: number;
  observers?: string[];
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string;
  due_date: string;
  follow_up_date: string;
  tags: string[];
  attachments?: File[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  project_id?: number;
  team_id?: number;
  assigned_to?: number;
  observers?: string[];
  status?: TaskStatus;
  priority?: TaskPriority;
  start_date?: string;
  due_date?: string;
  follow_up_date?: string;
  tags?: string[];
  attachments?: File[];
}

export interface TaskAttachment {
  id: number;
  task_id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  created_at: string;
}

export interface ProjectCreate {
  name: string;
  description: string;
  manager_id: number;
  assigned_teams: number[];
  start_date: string;
  end_date: string;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  manager_id?: number;
  assigned_teams?: number[];
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'on_hold' | 'completed' | 'cancelled';
}

export interface TeamCreate {
  name: string;
  description: string;
  leader_id: number;
  member_ids: number[];
  department: string;
  status?: 'active' | 'inactive';
}

export interface TeamUpdate {
  name?: string;
  description?: string;
  leader_id?: number;
  member_ids?: number[];
  department?: string;
  status?: 'active' | 'inactive';
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
  manager_id: number;
  manager: User;
  assigned_teams: Team[];
  start_date: string;
  end_date: string;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
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
  status: 'active' | 'inactive';
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

// Notification types
export type NotificationType = 
  | "task_assigned"
  | "task_updated"
  | "task_status_changed"
  | "task_due_soon"
  | "task_overdue"
  | "team_member_added"
  | "team_member_removed"
  | "project_created"
  | "project_updated"
  | "reminder"
  | "system"
  | "message";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  is_read: boolean;
  is_archived: boolean;
  related_entity_type?: string;
  related_entity_id?: number;
  created_at: string;
  read_at?: string;
  expires_at?: string;
  extra_data?: Record<string, any>;
}

export interface NotificationSummary {
  id: number;
  title: string;
  message: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  is_read: boolean;
  created_at: string;
  related_entity_type?: string;
  related_entity_id?: number;
}

export interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  read_count: number;
  archived_count: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}

export interface NotificationCreate {
  user_id: number;
  title: string;
  message: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  related_entity_type?: string;
  related_entity_id?: number;
  expires_at?: string;
  extra_data?: Record<string, any>;
}

export interface NotificationUpdate {
  title?: string;
  message?: string;
  notification_type?: NotificationType;
  priority?: NotificationPriority;
  is_read?: boolean;
  is_archived?: boolean;
  related_entity_type?: string;
  related_entity_id?: number;
  expires_at?: string;
  extra_data?: Record<string, any>;
}

export interface BulkNotificationUpdate {
  notification_ids: number[];
  is_read?: boolean;
  is_archived?: boolean;
}
