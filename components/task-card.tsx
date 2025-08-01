"use client"

import { useState } from "react"
import { Calendar, UserIcon, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task, User } from "@/types"

interface TaskCardProps {
  task: Task
  users: User[]
  currentUser: User
  onTaskUpdate: (task: Task) => void
}

export function TaskCard({ task, users, currentUser, onTaskUpdate }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const assignedUser = users.find((u) => u.id === task.assignedTo)
  const createdByUser = users.find((u) => u.id === task.createdBy)

  const isOverdue = new Date(task.dueDate) < new Date() && !["FINISHED", "CANCELLED", "STOPPED"].includes(task.status)
  const isDueToday = new Date(task.dueDate).toDateString() === new Date().toDateString()

  const priorityColors = {
    LOW: "bg-green-100 text-green-800 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
    HIGH: "bg-orange-100 text-orange-800 border-orange-200",
    CRITICAL: "bg-red-100 text-red-800 border-red-200",
  }

  const statusColors = {
    NEW: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    FINISHED: "bg-green-100 text-green-800",
    STOPPED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    const updatedTask = {
      ...task,
      status: newStatus as Task["status"],
      updatedAt: new Date().toISOString(),
      completedAt: newStatus === "FINISHED" ? new Date().toISOString() : task.completedAt,
    }
    onTaskUpdate(updatedTask)
    setIsUpdating(false)
  }

  const canUpdateStatus = task.assignedTo === currentUser.id || task.createdBy === currentUser.id

  return (
    <Card
      className={`transition-all hover:shadow-md ${isOverdue ? "border-red-300 bg-red-50" : isDueToday ? "border-yellow-300 bg-yellow-50" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
              {isOverdue && <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />}
              {task.status === "FINISHED" && <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />}
              <div className="flex-1">
                <h3
                  className={`font-semibold text-lg ${task.status === "FINISHED" ? "line-through text-gray-500" : "text-gray-900"}`}
                >
                  {task.title}
                </h3>
                {task.description && <p className="text-gray-600 text-sm mt-1 line-clamp-2">{task.description}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
              <Badge variant="outline" className={statusColors[task.status]}>
                {task.status.replace("_", " ")}
              </Badge>
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.escalationLevel > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Escalated ({task.escalationLevel})
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                <span>Assigned to:</span>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {assignedUser?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{assignedUser?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span
                  className={isOverdue ? "text-red-600 font-medium" : isDueToday ? "text-yellow-600 font-medium" : ""}
                >
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
              {task.comments.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{task.comments.length}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Created by {createdByUser?.name} • {new Date(task.createdAt).toLocaleDateString()}
              </div>
              {canUpdateStatus && (
                <Select value={task.status} onValueChange={handleStatusChange} disabled={isUpdating}>
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FINISHED">Finished</SelectItem>
                    <SelectItem value="STOPPED">Stopped</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
