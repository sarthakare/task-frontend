"use client";
import { UserAvatar } from "@/components/user-avatar";
import { TaskEditForm } from "@/components/task-edit-form";
import { TaskStatusUpdate } from "@/components/task-status-update";
import { TaskDetailsModal } from "@/components/task-details-modal";
import { TaskLogCreateForm } from "@/components/task-log-create-form";
import { TaskLogDisplay } from "@/components/task-log-display";
import { TaskProgressBar } from "@/components/task-progress-bar";
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
  Edit,
  RefreshCw,
  Paperclip,
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
      case "NEW": return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
      case "IN_PROGRESS": return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
      case "PENDING": return "bg-gradient-to-r from-orange-500 to-red-500 text-white";
      case "FINISHED": return "bg-gradient-to-r from-emerald-500 to-green-500 text-white";
      case "STOPPED": return "bg-gradient-to-r from-gray-500 to-slate-500 text-white";
      case "CANCELLED": return "bg-gradient-to-r from-red-500 to-rose-500 text-white";
      default: return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "LOW": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
      case "MEDIUM": return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white";
      case "HIGH": return "bg-gradient-to-r from-orange-500 to-red-500 text-white";
      case "CRITICAL": return "bg-gradient-to-r from-red-500 to-rose-600 text-white";
      default: return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
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
    <div className="group relative overflow-hidden rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
      {isTaskOverdue && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"></div>
      )}
      <div className={`relative transition-all duration-500 ease-in-out ${viewMode === 'list' ? 'p-4' : 'p-5'}`}>
        {viewMode === 'list' ? (
          /* List View Layout */
          <div className="space-y-3 transition-all duration-500 ease-in-out">
            {/* Header Row */}
             <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
                    {getStatusIcon(task.status)}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{task.title}</h3>
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2.5 py-1 rounded-lg shadow-sm">
                      <Paperclip className="h-3 w-3" />
                      <span>{task.attachments.length}</span>
                    </div>
                  )}
                  {isTaskOverdue && (
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 animate-pulse" />
                  )}
                </div>
                {task.description && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 ml-8">
                    {task.description}
                  </div>
                )}
              </div>

               <div className="flex flex-wrap items-center gap-2 sm:ml-4">
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${getPriorityColor(task.priority)} flex items-center gap-1`}>
                  <Flag className="h-3 w-3" />
                  {task.priority}
                </span>
                {isTaskOverdue && (
                  <span className="px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm bg-gradient-to-r from-red-500 to-rose-500 text-white animate-pulse">
                    Overdue
                  </span>
                )}
              </div>
            </div>

            {/* Project and Team Row */}
             <div className="flex flex-wrap items-center gap-3 text-sm">
              {task.project?.name && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-lg">
                    <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{task.project.name}</span>
                  </span>
                </div>
              )}
              {task.team?.name && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-lg">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{task.team.name}</span>
                  </span>
                </div>
              )}
            </div>

            {/* People Row */}
             <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">Assignee:</span>
                <div className="flex items-center gap-2">
                  <UserAvatar name={task.assignee?.name || 'Unassigned'} size="sm" />
                  <span className="font-semibold text-gray-900 dark:text-white">{task.assignee?.name || 'Unassigned'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10 rounded-lg">
                  <User className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">Creator:</span>
                <div className="flex items-center gap-2">
                  <UserAvatar name={task.creator?.name || 'Unknown'} size="sm" />
                  <span className="font-semibold text-gray-900 dark:text-white">{task.creator?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>

            {/* Dates Row */}
             <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 dark:from-teal-500/10 dark:to-cyan-500/10 rounded-lg">
                  <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-500" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  Start: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(task.start_date)}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-rose-500/20 to-red-500/20 dark:from-rose-500/10 dark:to-red-500/10 rounded-lg">
                  <Calendar className="h-4 w-4 text-rose-600 dark:text-rose-500" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  Due: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(task.due_date)}</span>
                </span>
              </div>
              {task.follow_up_date && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/10 dark:to-purple-500/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Follow-up: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(task.follow_up_date)}</span>
                  </span>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Card View Layout */
           <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 transition-all duration-500 ease-in-out">
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
                  {getStatusIcon(task.status)}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{task.title}</h3>
                {task.attachments && task.attachments.length > 0 && (
                  <div className="flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2.5 py-1 rounded-lg shadow-sm">
                    <Paperclip className="h-3 w-3" />
                    <span>{task.attachments.length}</span>
                  </div>
                )}
                {isTaskOverdue && (
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 animate-pulse" />
                )}
              </div>
              
              {task.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                  {task.description}
                </p>
              )}
            </div>

            {/* Status and Priority Badges */}
             <div className="flex flex-row sm:flex-col gap-2 sm:ml-4">
              <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${getPriorityColor(task.priority)} flex items-center gap-1`}>
                <Flag className="h-3 w-3" />
                {task.priority}
              </span>
              {isTaskOverdue && (
                <span className="px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm bg-gradient-to-r from-red-500 to-rose-500 text-white animate-pulse">
                  Overdue
                </span>
              )}
            </div>
          </div>
        )}

        {viewMode === 'card' && (
          <>
            {/* Key Information Grid */}
            <div className="space-y-3 mb-4">
              {/* First Row: Project and Team */}
               <div className="flex flex-wrap items-center gap-3 text-sm">
                {task.project?.name && (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-lg">
                      <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">{task.project.name}</span>
                    </span>
                  </div>
                )}
                {task.team?.name && (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-lg">
                      <Users className="h-4 w-4 text-green-600 dark:text-green-500" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">{task.team.name}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Second Row: Assignee and Creator */}
               <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">Assignee:</span>
                  <div className="flex items-center gap-2">
                    <UserAvatar name={task.assignee?.name || 'Unassigned'} size="sm" />
                    <span className="font-semibold text-gray-900 dark:text-white">{task.assignee?.name || 'Unassigned'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10 rounded-lg">
                    <User className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">Creator:</span>
                  <div className="flex items-center gap-2">
                    <UserAvatar name={task.creator?.name || 'Unknown'} size="sm" />
                    <span className="font-semibold text-gray-900 dark:text-white">{task.creator?.name || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Third Row: Dates */}
               <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 dark:from-teal-500/10 dark:to-cyan-500/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Start: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(task.start_date)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-rose-500/20 to-red-500/20 dark:from-rose-500/10 dark:to-red-500/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-rose-600 dark:text-rose-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Due: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(task.due_date)}</span>
                  </span>
                </div>
                {task.follow_up_date && (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/10 dark:to-purple-500/10 rounded-lg">
                      <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-500" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Follow-up: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(task.follow_up_date)}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
             <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
               {/* Primary Actions Row */}
               <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                <TaskDetailsModal task={task} />
                
                {canEdit && (
                  <TaskEditForm 
                    task={task} 
                    onTaskUpdated={onTaskUpdated}
                    trigger={
                       <button className="h-8 px-3 flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer flex-shrink-0 text-gray-700 dark:text-gray-200 text-sm font-medium">
                         <Edit className="h-4 w-4" />
                         <span className="hidden sm:inline">Edit</span>
                      </button>
                    }
                  />
                )}
                
                {canUpdateStatus && (
                  <TaskStatusUpdate 
                    task={task} 
                    onStatusUpdated={onTaskUpdated}
                    trigger={
                       <button className="h-8 px-3 flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer flex-shrink-0 text-gray-700 dark:text-gray-200 text-sm font-medium">
                         <RefreshCw className="h-4 w-4" />
                         <span className="hidden sm:inline">Update Status</span>
                      </button>
                    }
                  />
                )}
              </div>

               {/* Secondary Actions Row */}
               <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <TaskLogCreateForm
                  taskId={task.id}
                  taskTitle={task.title}
                  onLogCreated={onLogCreated}
                  trigger={
                     <button className="h-8 px-3 flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer flex-shrink-0 text-gray-700 dark:text-gray-200 text-sm font-medium">
                      <Plus className="h-4 w-4" />
                       <span className="hidden sm:inline">Add Log</span>
                    </button>
                  }
                />
                
                <button 
                  onClick={() => onToggleLogs(task.id)}
                   className="h-8 px-3 flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer flex-shrink-0 text-gray-700 dark:text-gray-200 text-sm font-medium"
                >
                  {shownLogs.has(task.id) ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                       <span className="hidden sm:inline">Hide Logs</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                       <span className="hidden sm:inline">Show Logs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

         {/* List View Action Buttons */}
         {viewMode === 'list' && (
           <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
             {/* Primary Actions Row */}
             <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
               <TaskDetailsModal task={task} />
               
               {canEdit && (
                 <TaskEditForm 
                   task={task} 
                   onTaskUpdated={onTaskUpdated}
                   trigger={
                     <button className="h-8 px-3 flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer flex-shrink-0 text-gray-700 dark:text-gray-200 text-sm font-medium">
                       <Edit className="h-4 w-4" />
                       Edit
                     </button>
                   }
                 />
               )}
               
               {canUpdateStatus && (
                 <TaskStatusUpdate 
                   task={task} 
                   onStatusUpdated={onTaskUpdated}
                   trigger={
                     <button className="h-8 px-3 flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer flex-shrink-0 text-gray-700 dark:text-gray-200 text-sm font-medium">
                       <RefreshCw className="h-4 w-4" />
                       Update Status
                     </button>
                   }
                 />
               )}
             </div>
             
             {/* Secondary Actions Row */}
             <div className="flex flex-wrap items-center gap-2 sm:gap-3">
               <TaskLogCreateForm
                 taskId={task.id}
                 taskTitle={task.title}
                 onLogCreated={onLogCreated}
                 trigger={
                   <button className="h-8 px-3 flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer flex-shrink-0 text-gray-700 dark:text-gray-200 text-sm font-medium">
                     <Plus className="h-4 w-4" />
                     Add Log
                   </button>
                 }
               />
               
               <button 
                 onClick={() => onToggleLogs(task.id)}
                 className="h-8 px-3 flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer flex-shrink-0 text-gray-700 dark:text-gray-200 text-sm font-medium"
               >
                 {shownLogs.has(task.id) ? (
                   <>
                     <EyeOff className="h-4 w-4" />
                     Hide Logs
                   </>
                 ) : (
                   <>
                     <Eye className="h-4 w-4" />
                     Show Logs
                   </>
                 )}
               </button>
             </div>
           </div>
         )}

        {/* Task Progress Bar */}
        {shownLogs.has(task.id) && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <TaskProgressBar
              taskId={task.id}
              taskTitle={task.title}
              refreshTrigger={logRefreshTrigger}
            />
          </div>
        )}

        {/* Task Logs Display */}
        {shownLogs.has(task.id) && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <TaskLogDisplay
                taskId={task.id}
                taskTitle={task.title}
                refreshTrigger={logRefreshTrigger}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
