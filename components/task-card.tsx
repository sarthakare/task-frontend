"use client";

import { useState } from "react";
import {
  Calendar,
  UserIcon,
  AlertTriangle,
  CheckCircle2,
  Tag,
  UserCheck,
  CalendarDays,
  User,
  Clock,
  Play,
  Pause,
  X,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (task: Task) => void;
}

export function TaskCard({ task, onTaskUpdate }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const isOverdue =
    new Date(task.due_date) < new Date() &&
    !["FINISHED", "CANCELLED", "STOPPED"].includes(task.status);
  const isDueToday =
    new Date(task.due_date).toDateString() === new Date().toDateString();
  const isDueSoon = 
    new Date(task.due_date) > new Date() && 
    new Date(task.due_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

  const statusStyles = {
    NEW: "bg-blue-50 border-blue-200 text-blue-700",
    IN_PROGRESS: "bg-purple-50 border-purple-200 text-purple-700",
    PENDING: "bg-yellow-50 border-yellow-200 text-yellow-700",
    FINISHED: "bg-green-50 border-green-200 text-green-700",
    STOPPED: "bg-gray-50 border-gray-200 text-gray-700",
    CANCELLED: "bg-red-50 border-red-200 text-red-700",
  };

  const priorityColors = {
    LOW: "bg-green-100 text-green-800 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
    HIGH: "bg-orange-100 text-orange-800 border-orange-200",
    CRITICAL: "bg-red-100 text-red-800 border-red-200",
  };

  const cardBackgroundColors = {
    NEW: "bg-blue-50/50",
    IN_PROGRESS: "bg-purple-50/50",
    PENDING: "bg-yellow-50/50",
    FINISHED: "bg-green-50/50",
    STOPPED: "bg-gray-50/50",
    CANCELLED: "bg-red-50/50",
  };

  const statusIcons = {
    NEW: <FileText className="h-4 w-4 text-blue-500" />,
    IN_PROGRESS: <Play className="h-4 w-4 text-purple-500" />,
    PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
    FINISHED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    STOPPED: <Pause className="h-4 w-4 text-gray-500" />,
    CANCELLED: <X className="h-4 w-4 text-red-500" />,
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    const updatedTask = {
      ...task,
      status: newStatus as Task["status"],
      updatedAt: new Date().toISOString(),
      completedAt:
        newStatus === "FINISHED" ? new Date().toISOString() : task.completedAt,
    };
    onTaskUpdate(updatedTask);
    setIsUpdating(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className={`transition-all duration-300 rounded-lg shadow-sm hover:shadow-md border ${cardBackgroundColors[task.status]} ${
        isOverdue 
          ? "border-red-300 bg-red-50/30" 
          : isDueToday 
          ? "border-yellow-300 bg-yellow-50/30"
          : isDueSoon
          ? "border-orange-300 bg-orange-50/30"
          : "border-gray-200"
      }`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with Title, Status, and Priority */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3
              className={`text-base font-semibold truncate ${
                task.status === "FINISHED"
                  ? "line-through text-gray-500"
                  : "text-gray-900"
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-gray-600 text-xs mt-1 line-clamp-1">
                {task.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-3">
            {isOverdue && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            {statusIcons[task.status]}
            <Badge
              variant="outline"
              className={`${statusStyles[task.status]} text-xs font-medium`}
            >
              {task.status.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* Tags and Priority */}
        <div className="flex items-center justify-between">
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-1">
              <Tag className="h-3 w-3 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    +{task.tags.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
          <Badge
            variant="outline"
            className={`${priorityColors[task.priority]} text-xs font-medium`}
          >
            {task.priority}
          </Badge>
        </div>

        {/* Assignment and Dates in one row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                {getInitials(task.assignee?.name || `User ${task.assigned_to}`)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-gray-500 text-xs">Assigned to:</p>
              <p className="font-medium text-gray-900 truncate">
                {task.assignee?.name || `User ${task.assigned_to}`}
              </p>
              {task.assignee?.role && (
                <p className="text-gray-500 truncate">
                  {task.assignee.role} • {task.assignee.department}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            {task.follow_up_date && (
              <div>
                <span className="text-gray-500">Follow-up:</span>
                <span className="ml-1 text-gray-700">
                  {new Date(task.follow_up_date).toLocaleDateString()}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Due:</span>
              <span
                className={`ml-1 font-medium ${
                  isOverdue
                    ? "text-red-600"
                    : isDueToday
                    ? "text-yellow-600"
                    : isDueSoon
                    ? "text-orange-600"
                    : "text-gray-700"
                }`}
              >
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer with Creator and Status Update */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs bg-gray-100 text-gray-700">
                {getInitials(task.creator?.name || `User ${task.created_by}`)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-gray-500 text-xs">Created by:</p>
              <span className="text-xs text-gray-700">
                {task.creator?.name || `User ${task.created_by}`} • {new Date(task.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Status:</span>
            <Select
              value={task.status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-32 h-7 text-xs">
                <SelectValue placeholder="Status" />
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
