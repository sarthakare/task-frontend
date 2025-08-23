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
  List,
  RefreshCw,
} from "lucide-react";
import { Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Task } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { TaskLogCreationForm } from "./task-logs-creation-form";
import { TaskEditForm } from "./task-edit-form";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TaskStatusManager } from "./task-status-update-form";

interface TaskCardProps {
  task: Task;
  fetchTasks: () => void;
}

export function TaskCard({ task, fetchTasks }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
  const [isTaskLogOpen, setIsTaskLogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const hasLogs = Boolean(task.logs && task.logs.length > 0);

  const isStartOverdue =
    new Date(task.start_date) < new Date() &&
    !["FINISHED", "CANCELLED", "STOPPED"].includes(task.status);
  const isStartToday =
    new Date(task.start_date).toDateString() === new Date().toDateString();
  const isStartSoon =
    new Date(task.start_date) > new Date() &&
    new Date(task.start_date) <=
    new Date(new Date().setDate(new Date().getDate() + 2));

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleTaskUpdated = () => {
    fetchTasks();
    setIsEditOpen(false);
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
  }

  return (
    <Card
      className={`transition-all duration-300 rounded-lg shadow-sm hover:shadow-md border ${cardBackgroundColors[task.status]}
        } ${isOverdue
          ? "border-red-300 bg-red-50/30"
          : isDueToday
            ? "border-yellow-300 bg-yellow-50/30"
            : isDueSoon
              ? "border-orange-300 bg-orange-50/30"
              : "border-gray-200"
        }`}
    >
      <CardContent className="p-6">
        {/* Top row: Status + Title (status moved above title) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOverdue && <AlertTriangle className="h-5 w-5 text-red-500" />}
              {statusIcons[task.status]}
              <Badge variant="outline" className={`text-sm font-medium ${statusStyles[task.status]}`}>
                {task.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] min-w-[70vw] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                  </DialogHeader>
                  <TaskEditForm task={task} onTaskUpdated={handleTaskUpdated} />
                </DialogContent>
              </Dialog>

              <button onClick={() => setIsExpanded((prev) => !prev)} className="hover:bg-gray-100 p-1 rounded">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="min-w-0">
            <h3
              className={`text-lg md:text-xl font-semibold ${task.status === "FINISHED" ? "line-through text-gray-500" : "text-gray-900"} cursor-pointer hover:underline`}
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm text-gray-600 mt-2 ${isExpanded ? "" : "line-clamp-2"}`} onClick={() => setIsExpanded((prev) => !prev)}>
                {task.description}
              </p>
            )}
            {/* tags */}
            {task.tags?.length > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Tag className="h-4 w-4 text-gray-400" />
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Two-column: Assigned to | Created by */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="text-sm bg-blue-100 text-blue-700">{getInitials(task.assignee?.name || `User ${task.assigned_to}`)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-gray-500">Assigned to</p>
              <p className="text-sm font-medium text-gray-900">{task.assignee?.name || `User ${task.assigned_to}`}</p>
              {task.assignee?.role && <p className="text-xs text-gray-500">{task.assignee.role} • {task.assignee.department}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 md:justify-end">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="text-sm bg-gray-100 text-gray-700">{getInitials(task.creator?.name || `User ${task.created_by}`)}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-xs text-gray-500">Created by</p>
              <p className="text-sm font-medium text-gray-900">{task.creator?.name || `User ${task.created_by}`}</p>
              {task.creator?.role && (
                <p className="text-xs text-gray-500">{task.creator.role} • {task.creator.department}</p>
              )}
              <p className="text-xs text-gray-500">{formatDateTime(task.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Date summary row */}
        <div className="flex flex-col md:flex-row gap-3 mt-4">
          <div className="flex-1 p-3 bg-white/60 rounded-md border border-gray-100">
            <p className="text-xs text-gray-500">Start Date</p>
            <p className={`text-sm font-medium ${isStartOverdue ? 'text-red-600' : isStartToday ? 'text-yellow-600' : isStartSoon ? 'text-orange-600' : 'text-gray-800'}`}>
              {formatDateTime(task.start_date)}
            </p>
          </div>
          <div className={`flex-1 p-3 rounded-md border ${isOverdue ? 'border-red-300 bg-red-50/40' : 'border-gray-100 bg-white/60'}`}>
            <p className="text-xs text-gray-500">Due Date</p>
            <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : isDueToday ? 'text-yellow-600' : isDueSoon ? 'text-orange-600' : 'text-gray-800'}`}>
              {formatDateTime(task.due_date)}
            </p>
          </div>
          <div className="flex-1 p-3 bg-white/60 rounded-md border border-gray-100">
            <p className="text-xs text-gray-500">Follow-up</p>
            <p className="text-sm font-medium text-gray-800">{formatDateTime(task.follow_up_date)}</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-4 mt-5">
          <div className="border border-gray-200 rounded-md bg-gray-100">
            <Button size="sm" variant="ghost" className="text-sm" onClick={() => setShowLogs((prev) => !prev)} disabled={!hasLogs}>
              <List className="h-4 w-4 mr-2" />
              {showLogs ? `Hide Logs (${task.logs?.length || 0})` : `View Logs (${task.logs?.length || 0})`}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isChangeStatusOpen} onOpenChange={setIsChangeStatusOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-sm">
                  <RefreshCw className="mr-2" />
                  Change Status
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[50vh] min-w-[30vw] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Change Status</DialogTitle>
                </DialogHeader>
                <TaskStatusManager currentTaskId={task.id} currentStatus={task.status} reloadTasks={fetchTasks} />
              </DialogContent>
            </Dialog>

            <Dialog open={isTaskLogOpen} onOpenChange={setIsTaskLogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-sm bg-purple-600 text-white hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Log
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] min-w-[70vw] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Log</DialogTitle>
                </DialogHeader>
                <TaskLogCreationForm currentTaskId={task.id} onLogCreated={fetchTasks} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Logs Table */}
        {showLogs && task.logs && task.logs.length > 0 && (
          <div className="pt-4">
            <Table>
              <TableCaption>A list of your recent logs.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {task.logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="">{log.title}</TableCell>
                    <TableCell className="p-2">{log.description}</TableCell>
                    <TableCell className="p-2 text-gray-600">{formatDateTime(log.startTime)}</TableCell>
                    <TableCell className="p-2 text-gray-600">{formatDateTime(log.endTime)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
