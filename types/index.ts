export interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "CEO" | "MANAGER" | "TEAM_LEAD" | "EXECUTIVE"
  parentId?: string
  department: string
  avatar?: string
  isActive: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  createdBy: string
  assignedTo: string
  observers: string[]
  status: "NEW" | "IN_PROGRESS" | "PENDING" | "FINISHED" | "STOPPED" | "CANCELLED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  dueDate: string
  followUpDate?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  tags: string[]
  comments: TaskComment[]
  escalationLevel: number
  lastReminderSent?: string
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
