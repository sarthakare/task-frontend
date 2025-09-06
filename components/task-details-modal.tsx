"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  Calendar, 
  User, 
  Flag, 
  AlertCircle, 
  FolderOpen, 
  Users, 
  Clock,
  CheckCircle2,
  Pause,
  X
} from "lucide-react";
import type { Task, TaskStatus, TaskPriority } from "@/types";

interface TaskDetailsModalProps {
  task: Task;
  trigger?: React.ReactNode;
}

export function TaskDetailsModal({ task, trigger }: TaskDetailsModalProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800";
      case "PENDING": return "bg-orange-100 text-orange-800";
      case "FINISHED": return "bg-green-100 text-green-800";
      case "STOPPED": return "bg-gray-100 text-gray-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "LOW": return "bg-green-100 text-green-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "HIGH": return "bg-orange-100 text-orange-800";
      case "CRITICAL": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "NEW": return <Clock className="h-4 w-4 text-blue-600" />;
      case "IN_PROGRESS": return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "PENDING": return <Pause className="h-4 w-4 text-orange-600" />;
      case "FINISHED": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "STOPPED": return <Pause className="h-4 w-4 text-gray-600" />;
      case "CANCELLED": return <X className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const isOverdue = (dueDate: string, status: TaskStatus) => {
    const now = new Date();
    const due = new Date(dueDate);
    return due < now && !['FINISHED', 'CANCELLED'].includes(status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
      <Eye className="h-4 w-4 mr-1" />
      View
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900 pr-4">
                {task.title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                View detailed information about this task including timeline, assignments, and progress.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {isOverdue(task.due_date, task.status) && (
                <Badge className="bg-red-100 text-red-800">Overdue</Badge>
              )}
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
          <div className="space-y-6 py-4">
            
            {/* Task Overview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <h3 className="text-lg font-medium text-gray-900">Task Overview</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{task.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Priority</p>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Assignee</p>
                    <p className="font-medium text-gray-900">{task.assignee?.name || 'Unassigned'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Creator</p>
                    <p className="font-medium text-gray-900">{task.creator?.name}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-900">Start Date</p>
                  </div>
                  <p className="text-blue-800">{formatDate(task.start_date)}</p>
                </div>

                <div className={`rounded-lg p-4 border ${isOverdue(task.due_date, task.status) ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className={`h-4 w-4 ${isOverdue(task.due_date, task.status) ? 'text-red-600' : 'text-orange-600'}`} />
                    <p className={`text-sm font-medium ${isOverdue(task.due_date, task.status) ? 'text-red-900' : 'text-orange-900'}`}>Due Date</p>
                  </div>
                  <p className={isOverdue(task.due_date, task.status) ? 'text-red-800' : 'text-orange-800'}>
                    {formatDate(task.due_date)}
                  </p>
                  {isOverdue(task.due_date, task.status) && (
                    <p className="text-xs text-red-600 mt-1">Overdue</p>
                  )}
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <p className="text-sm font-medium text-purple-900">Follow-up</p>
                  </div>
                  <p className="text-purple-800">{formatDate(task.follow_up_date)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Project & Team Context */}
            {(task.project || task.team) && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-medium text-gray-900">Project & Team Context</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.project && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FolderOpen className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-medium text-green-900">Project</p>
                        </div>
                        <p className="font-medium text-green-800">{task.project.name}</p>
                        <p className="text-sm text-green-600 mt-1">Status: {task.project.status}</p>
                      </div>
                    )}

                    {task.team && (
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-indigo-600" />
                          <p className="text-sm font-medium text-indigo-900">Team</p>
                        </div>
                        <p className="font-medium text-indigo-800">{task.team.name}</p>
                        <p className="text-sm text-indigo-600 mt-1">Department: {task.team.department}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* System Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-900">System Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Created</p>
                  <p className="text-gray-900">{formatDateTime(task.created_at)}</p>
                  <p className="text-sm text-gray-500 mt-1">by {task.creator?.name}</p>
                </div>

                {task.updated_at && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Last Updated</p>
                    <p className="text-gray-900">{formatDateTime(task.updated_at)}</p>
                  </div>
                )}

                {task.completedAt && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-700 mb-2">Completed</p>
                    <p className="text-green-900">{formatDateTime(task.completedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Task Logs */}
            {task.logs && task.logs.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-medium text-gray-900">Activity Logs</h3>
                  </div>

                  <div className="space-y-3">
                    {task.logs.map((log) => (
                      <div key={log.id} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-purple-900">{log.title}</p>
                          <p className="text-sm text-purple-600">{formatDateTime(log.created_at)}</p>
                        </div>
                        <p className="text-purple-800 text-sm">{log.description}</p>
                        {log.start_time && (
                          <div className="mt-2 flex gap-4 text-xs text-purple-600">
                            <span>Started: {formatDateTime(log.start_time)}</span>
                            {log.end_time && <span>Ended: {formatDateTime(log.end_time)}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            className="px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

