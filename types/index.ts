export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
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
  follow_up_date: string
  due_date: string
  followUpDate?: string
  createdAt: string
  updatedAt?: string
  completedAt?: string
  tags: string[]
  created_at: string
  updated_at?: string | null
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  taskId: string
  type: "REMINDER" | "ESCALATION" | "ASSIGNMENT" | "STATUS_CHANGE"
  message: string
  isRead: boolean
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
