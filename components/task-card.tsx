"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskEditForm } from "@/components/task-edit-form";
import { TaskStatusUpdate } from "@/components/task-status-update";
import { TaskDetailsModal } from "@/components/task-details-modal";
import { TaskLogCreateForm } from "@/components/task-log-create-form";
import { TaskLogDisplay } from "@/components/task-log-display";
import {
  Calendar,
  User,
  Flag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause,
  X,
  Briefcase,
  Users,
  Plus,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import type { Task, TaskStatus, TaskPriority } from "@/types";

interface TaskCardProps {
  task: Task;
  canEdit: boolean;
  canUpdateStatus: boolean;
  onTaskUpdated: () => void;
  onLogCreated: () => void;
  shownLogs: Set<number>;
  onToggleLogs: (taskId: number) => void;
  logRefreshTrigger: number;
  viewMode: 'card' | 'list';
}

export function TaskCard({
  task,
  canEdit,
  canUpdateStatus,
  onTaskUpdated,
  onLogCreated,
  shownLogs,
  onToggleLogs,
  logRefreshTrigger,
  viewMode,
}: TaskCardProps) {

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "NEW": return "bg-blue-50 text-blue-700 border-blue-200";
      case "IN_PROGRESS": return "bg-amber-50 text-amber-700 border-amber-200";
      case "PENDING": return "bg-orange-50 text-orange-700 border-orange-200";
      case "FINISHED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "STOPPED": return "bg-gray-50 text-gray-700 border-gray-200";
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusBorderColor = (status: TaskStatus) => {
    switch (status) {
      case "NEW": return "border-l-blue-500 bg-blue-50 hover:bg-blue-50/50";
      case "IN_PROGRESS": return "border-l-amber-500 bg-amber-50 hover:bg-amber-50/50";
      case "PENDING": return "border-l-orange-500 bg-orange-50 hover:bg-orange-50/50";
      case "FINISHED": return "border-l-emerald-500 bg-emerald-50 hover:bg-emerald-50/50";
      case "STOPPED": return "border-l-gray-500 bg-gray-50 hover:bg-gray-50/50";
      case "CANCELLED": return "border-l-red-500 bg-red-50 hover:bg-red-50/50";
      default: return "border-l-gray-500 bg-gray-50 hover:bg-gray-50/50";
    }
  };

  const getOverdueColor = () => {
    return "border-l-red-500 bg-red-50/30 ring-2 ring-red-200/50";
  };

  const getOverdueBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800 border-blue-200";
      case "IN_PROGRESS": return "bg-amber-100 text-amber-800 border-amber-200";
      case "PENDING": return "bg-orange-100 text-orange-800 border-orange-200";
      case "FINISHED": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "STOPPED": return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "LOW": return "bg-green-50 text-green-700 border-green-200";
      case "MEDIUM": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "HIGH": return "bg-orange-50 text-orange-700 border-orange-200";
      case "CRITICAL": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "NEW": return <Clock className="h-4 w-4" />;
      case "IN_PROGRESS": return <AlertCircle className="h-4 w-4" />;
      case "PENDING": return <Pause className="h-4 w-4" />;
      case "FINISHED": return <CheckCircle2 className="h-4 w-4" />;
      case "STOPPED": return <Pause className="h-4 w-4" />;
      case "CANCELLED": return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const isOverdue = (dueDate: string, status: TaskStatus) => {
    const now = new Date();
    const due = new Date(dueDate);
    return due < now && !['FINISHED', 'CANCELLED'].includes(status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isTaskOverdue = isOverdue(task.due_date, task.status);

  return (
    <Card className={`group transition-all duration-200 hover:shadow-md border-l-4 ${
      isTaskOverdue 
        ? getOverdueColor()
        : `${getStatusBorderColor(task.status)} hover:shadow-lg`
    }`}>
      <CardContent className={viewMode === 'list' ? 'p-4' : 'p-6'}>
        {viewMode === 'list' ? (
          /* List View Layout */
          <div className="space-y-3">
            {/* Header Row */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(task.status)}
                  <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                  {isTaskOverdue && (
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
                {task.description && (
                  <div className="text-sm text-gray-600 line-clamp-2 ml-6">
                    {task.description}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Badge className={`${getStatusColor(task.status)} border text-xs font-medium`}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Badge className={`${getPriorityColor(task.priority)} border text-xs font-medium`}>
                  <Flag className="h-3 w-3 mr-1" />
                  {task.priority}
                </Badge>
                {isTaskOverdue && (
                  <Badge className={`${getOverdueBadgeColor(task.status)} border text-xs font-medium`}>
                    Overdue
                  </Badge>
                )}
              </div>
            </div>

            {/* Project and Team Row */}
            <div className="flex items-center gap-4 text-sm">
              {task.project?.name && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">
                    <span className="font-medium">Project:</span> {task.project.name}
                  </span>
                </div>
              )}
              {task.team?.name && (
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">
                    <span className="font-medium">Team:</span> {task.team.name}
                  </span>
                </div>
              )}
            </div>

            {/* People Row */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">
                  <span className="font-medium">Assignee:</span> {task.assignee?.name || 'Unassigned'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">
                  <span className="font-medium">Creator:</span> {task.creator?.name || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Dates Row */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">
                  <span className="font-medium">Start:</span> {formatDate(task.start_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">
                  <span className="font-medium">Due:</span> {formatDate(task.due_date)}
                </span>
              </div>
              {task.follow_up_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">
                    <span className="font-medium">Follow-up:</span> {formatDate(task.follow_up_date)}
                  </span>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Card View Layout */
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                  {isTaskOverdue && (
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
                {isTaskOverdue && (
                  <Badge className={`${getOverdueBadgeColor(task.status)} border text-xs font-medium`}>
                    Overdue
                  </Badge>
                )}
              </div>
              
              {task.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {task.description}
                </p>
              )}
            </div>

            {/* Status and Priority Badges */}
            <div className="flex flex-col gap-2 ml-4">
              <Badge className={`${getStatusColor(task.status)} border text-xs font-medium`}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge className={`${getPriorityColor(task.priority)} border text-xs font-medium`}>
                <Flag className="h-3 w-3 mr-1" />
                {task.priority}
              </Badge>
            </div>
          </div>
        )}

        {viewMode === 'card' && (
          <>
            {/* Key Information Grid */}
            <div className="space-y-3 mb-4">
              {/* First Row: Project and Team */}
              <div className="flex items-center gap-4 text-sm">
                {task.project?.name && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">
                      <span className="font-medium">Project:</span> {task.project.name}
                    </span>
                  </div>
                )}
                {task.team?.name && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">
                      <span className="font-medium">Team:</span> {task.team.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Second Row: Assignee and Creator */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">
                    <span className="font-medium">Assignee:</span> {task.assignee?.name || 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">
                    <span className="font-medium">Creator:</span> {task.creator?.name || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Third Row: Dates */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">
                    <span className="font-medium">Start:</span> {formatDate(task.start_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">
                    <span className="font-medium">Due:</span> {formatDate(task.due_date)}
                  </span>
                </div>
                {task.follow_up_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">
                      <span className="font-medium">Follow-up:</span> {formatDate(task.follow_up_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-500">
              <div className="flex items-center gap-2">
                <TaskDetailsModal task={task} />
                
                {canEdit && (
                  <TaskEditForm 
                    task={task} 
                    onTaskUpdated={onTaskUpdated}
                    trigger={
                      <Button variant="outline" size="sm" className="h-8 cursor-pointer">
                        Edit
                      </Button>
                    }
                  />
                )}
                
                {canUpdateStatus && (
                  <TaskStatusUpdate 
                    task={task} 
                    onStatusUpdated={onTaskUpdated}
                    trigger={
                      <Button variant="outline" size="sm" className="h-8 cursor-pointer">
                        Update Status
                      </Button>
                    }
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <TaskLogCreateForm
                  taskId={task.id}
                  taskTitle={task.title}
                  onLogCreated={onLogCreated}
                  trigger={
                    <Button variant="outline" size="sm" className="h-8 border-gray-300 hover:bg-gray-50 cursor-pointer">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Log
                    </Button>
                  }
                />
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onToggleLogs(task.id)}
                  className="h-8 border-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  {shownLogs.has(task.id) ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide Logs
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Show Logs
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* List View Action Buttons */}
        {viewMode === 'list' && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-500">
            <TaskDetailsModal task={task} />
            
            {canEdit && (
              <TaskEditForm 
                task={task} 
                onTaskUpdated={onTaskUpdated}
                trigger={
                  <Button variant="outline" size="sm" className="h-8 text-xs border-gray-300 hover:bg-gray-50 cursor-pointer">
                    Edit
                  </Button>
                }
              />
            )}
            
            {canUpdateStatus && (
              <TaskStatusUpdate 
                task={task} 
                onStatusUpdated={onTaskUpdated}
                trigger={
                  <Button variant="outline" size="sm" className="h-8 text-xs border-gray-300 hover:bg-gray-50 cursor-pointer">
                    Update Status
                  </Button>
                }
              />
            )}
            
            <TaskLogCreateForm
              taskId={task.id}
              taskTitle={task.title}
              onLogCreated={onLogCreated}
              trigger={
                <Button variant="outline" size="sm" className="h-8 text-xs border-gray-300 hover:bg-gray-50 cursor-pointer">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Log
                </Button>
              }
            />
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onToggleLogs(task.id)}
              className="h-8 text-xs border-gray-300 hover:bg-gray-50 cursor-pointer"
            >
              {shownLogs.has(task.id) ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide Logs
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show Logs
                </>
              )}
            </Button>
          </div>
        )}

        {/* Task Logs Display */}
        {shownLogs.has(task.id) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <TaskLogDisplay
              taskId={task.id}
              taskTitle={task.title}
              refreshTrigger={logRefreshTrigger}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
