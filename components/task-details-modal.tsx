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
  X,
  FileText
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
    <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="cursor-pointer">
      <Eye className="h-4 w-4 mr-1" />
      View
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-6 pr-10 border-b border-gray-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(task.status)}
                <DialogTitle className="text-2xl font-bold text-gray-900 pr-4">
                  {task.title}
                </DialogTitle>
                {isOverdue(task.due_date, task.status) && (
                  <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
                    Overdue
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-gray-600 text-base">
                Complete task details and progress information
              </DialogDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={`${getStatusColor(task.status)} border text-sm font-medium px-3 py-1`}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge className={`${getPriorityColor(task.priority)} border text-sm font-medium px-3 py-1`}>
                <Flag className="h-3 w-3 mr-1" />
                {task.priority}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
          <div className="space-y-6 py-4">
            
            {/* Task Description */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Description
              </h3>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <p className="text-gray-800 leading-relaxed text-sm">{task.description}</p>
              </div>
            </div>

            {/* People & Assignment */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                People & Assignment
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-md">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-800">Assigned To</p>
                      <p className="text-sm font-semibold text-green-900">{task.assignee?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-md">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-800">Created By</p>
                      <p className="text-sm font-semibold text-purple-900">{task.creator?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project & Team */}
            {(task.project?.name || task.team?.name) && (
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-orange-600" />
                  Project & Team
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {task.project?.name && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 rounded-md">
                          <FolderOpen className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-orange-800">Project</p>
                          <p className="text-sm font-semibold text-orange-900">{task.project.name}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {task.team?.name && (
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-200">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 rounded-md">
                          <Users className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-indigo-800">Team</p>
                          <p className="text-sm font-semibold text-indigo-900">{task.team.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Timeline & Dates
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-md">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-800">Start Date</p>
                      <p className="text-sm font-semibold text-blue-900">{formatDate(task.start_date)}</p>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg p-3 border ${isOverdue(task.due_date, task.status) ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${isOverdue(task.due_date, task.status) ? 'bg-red-100' : 'bg-orange-100'}`}>
                      <AlertCircle className={`h-4 w-4 ${isOverdue(task.due_date, task.status) ? 'text-red-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${isOverdue(task.due_date, task.status) ? 'text-red-800' : 'text-orange-800'}`}>Due Date</p>
                      <p className={`text-sm font-semibold ${isOverdue(task.due_date, task.status) ? 'text-red-900' : 'text-orange-900'}`}>
                        {formatDate(task.due_date)}
                      </p>
                      {isOverdue(task.due_date, task.status) && (
                        <p className="text-xs text-red-600 mt-1 font-medium">Overdue</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-md">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-800">Follow-up Date</p>
                      <p className="text-sm font-semibold text-green-900">{formatDate(task.follow_up_date)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Project & Team Context */}
            {(task.project || task.team) && (
              <>
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-green-600" />
                    Project & Team Context
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.project && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-100 rounded-md">
                            <FolderOpen className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-800">Project</p>
                            <p className="text-sm font-semibold text-green-900">{task.project.name}</p>
                            <p className="text-xs text-green-600 mt-1">Status: {task.project.status}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {task.team && (
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-200">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-100 rounded-md">
                            <Users className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-indigo-800">Team</p>
                            <p className="text-sm font-semibold text-indigo-900">{task.team.name}</p>
                            <p className="text-xs text-indigo-600 mt-1">Department: {task.team.department}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* System Information */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                System Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 rounded-md">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800">Created</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDateTime(task.created_at)}</p>
                      <p className="text-xs text-gray-600 mt-1">by {task.creator?.name}</p>
                    </div>
                  </div>
                </div>

                {task.updated_at && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-md">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-800">Last Updated</p>
                        <p className="text-sm font-semibold text-blue-900">{formatDateTime(task.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {task.completedAt && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-100 rounded-md">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-green-800">Completed</p>
                        <p className="text-sm font-semibold text-green-900">{formatDateTime(task.completedAt)}</p>
                      </div>
                    </div>
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
      </DialogContent>
    </Dialog>
  );
}

