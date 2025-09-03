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