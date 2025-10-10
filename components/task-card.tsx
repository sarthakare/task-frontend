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
      case "NEW": return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
      case "IN_PROGRESS": return "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
      case "PENDING": return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800";
      case "FINISHED": return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800";
      case "STOPPED": return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
      case "CANCELLED": return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "LOW": return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800";
      case "MEDIUM": return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800";
      case "HIGH": return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800";
      case "CRITICAL": return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
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
    <div className={`bg-white dark:bg-gray-900 rounded-lg border transition-colors ${isTaskOverdue ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}>
      <div className={`transition-all duration-500 ease-in-out ${viewMode === 'list' ? 'p-4' : 'p-5'}`}>
        {viewMode === 'list' ? (
          /* List View Layout */
          <div className="space-y-3 transition-all duration-500 ease-in-out">
            {/* Header Row */}
             <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    {getStatusIcon(task.status)}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{task.title}</h3>
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="flex items-center gap-1 text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg shadow-sm">
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
                  <span className="px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
                    Overdue
                  </span>
                )}
              </div>
            </div>

            {/* Project and Team Row */}
             <div className="flex flex-wrap items-center gap-3 text-sm">
              {task.project?.name && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{task.project.name}</span>
                  </span>
                </div>
              )}
              {task.team?.name && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
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
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">Assignee:</span>
                <div className="flex items-center gap-2">
                  <UserAvatar name={task.assignee?.name || 'Unassigned'} size="sm" />
                  <span className="font-semibold text-gray-900 dark:text-white">{task.assignee?.name || 'Unassigned'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
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
                <div className="p-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-500" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  Start: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(task.start_date)}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Calendar className="h-4 w-4 text-rose-600 dark:text-rose-500" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  Due: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(task.due_date)}</span>
                </span>
              </div>
              {task.follow_up_date && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
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
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  {getStatusIcon(task.status)}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{task.title}</h3>
                {task.attachments && task.attachments.length > 0 && (
                  <div className="flex items-center gap-1 text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg shadow-sm">
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
                <span className="px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
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
                    <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">{task.project.name}</span>
                    </span>
                  </div>
                )}
                {task.team?.name && (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
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
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">Assignee:</span>
                  <div className="flex items-center gap-2">
                    <UserAvatar name={task.assignee?.name || 'Unassigned'} size="sm" />
                    <span className="font-semibold text-gray-900 dark:text-white">{task.assignee?.name || 'Unassigned'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
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
                  <div className="p-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Start: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(task.start_date)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <Calendar className="h-4 w-4 text-rose-600 dark:text-rose-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Due: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(task.due_date)}</span>
                  </span>
                </div>
                {task.follow_up_date && (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
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
