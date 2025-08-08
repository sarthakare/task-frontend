"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Tag,
  Clock,
  Play,
  Pause,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { TaskLogManager } from "./task-logs-creation-form";

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (task: Task) => void;
}

export function TaskCard({ task, onTaskUpdate }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTaskLogOpen, setIsTaskLogOpen] = useState(false);

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
    className={`transition-all duration-300 rounded-lg shadow-sm hover:shadow-md border ${
      cardBackgroundColors[task.status]
    } ${
      isOverdue
        ? "border-red-300 bg-red-50/30"
        : isDueToday
        ? "border-yellow-300 bg-yellow-50/30"
        : isDueSoon
        ? "border-orange-300 bg-orange-50/30"
        : "border-gray-200"
    }`}
  >
    <CardContent className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3
            className={`text-base font-semibold ${
              task.status === "FINISHED"
                ? "line-through text-gray-500"
                : "text-gray-900"
            } ${isExpanded ? "" : "truncate"} cursor-pointer hover:underline`}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={`text-sm text-gray-600 mt-1 ${
                isExpanded ? "" : "line-clamp-1"
              } cursor-pointer hover:underline`}
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {task.description}
            </p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="hover:bg-gray-100 p-1 rounded"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
          {statusIcons[task.status]}
          <Badge
            variant="outline"
            className={`text-xs font-medium ${statusStyles[task.status]}`}
          >
            {task.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Tags and Priority */}
      <div className="flex justify-between items-center flex-wrap gap-y-2">
        {task.tags?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-3 w-3 text-gray-400" />
            {task.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <Badge
          variant="outline"
          className={`text-xs font-medium ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </Badge>
      </div>

      {/* Dates & Assignee */}
      <div className="flex justify-between items-center text-sm flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="" />
            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
              {getInitials(task.assignee?.name || `User ${task.assigned_to}`)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-gray-500">Assigned to</p>
            <p className="text-sm font-medium text-gray-900">
              {task.assignee?.name || `User ${task.assigned_to}`}
            </p>
            {task.assignee?.role && (
              <p className="text-xs text-gray-500">
                {task.assignee.role} • {task.assignee.department}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          {task.follow_up_date && (
            <p className="text-xs text-gray-500">
              Follow-up:{" "}
              <span className="text-gray-700">
                {new Date(task.follow_up_date).toLocaleDateString()}
              </span>
            </p>
          )}
          <p className="text-xs text-gray-500">
            Due:{" "}
            <span
              className={`font-medium ${
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
          </p>
        </div>
      </div>

      {/* Footer: Creator, Status Select, Add Log */}
      <div className="flex flex-wrap justify-between items-center gap-4 pt-3 border-t border-gray-200">
        {/* Creator Info */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="" />
            <AvatarFallback className="text-xs bg-gray-100 text-gray-700">
              {getInitials(task.creator?.name || `User ${task.created_by}`)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-gray-500">Created by</p>
            <p className="text-xs text-gray-700">
              {task.creator?.name || `User ${task.created_by}`} •{" "}
              {new Date(task.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Status Update */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          <Select
            value={task.status}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
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

        {/* Add Log Button */}
        <Dialog open={isTaskLogOpen} onOpenChange={setIsTaskLogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs">
              <Plus className="h-4 w-4 mr-1" />
              Add Log
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] min-w-[70vw] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Log</DialogTitle>
            </DialogHeader>
            <TaskLogManager currentTaskId={task.id} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Logs Section */}
      {task.logs && task.logs.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Logs</h4>
          <ul className="space-y-2">
            {task.logs.map((log) => (
              <li
                key={log.id}
                className="p-3 rounded-md border border-gray-200 bg-gray-50 text-sm"
              >
                <div className="font-medium text-gray-900">{log.title}</div>
                <p className="text-gray-600">{log.description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  <span>
                    <strong>Start:</strong>{" "}
                    {new Date(log.startTime).toLocaleString()}
                  </span>
                  {" • "}
                  <span>
                    <strong>End:</strong>{" "}
                    {new Date(log.endTime).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardContent>
  </Card>
);

}
