"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { TaskCreateForm } from "@/components/task-create-form";
import { TaskCard } from "@/components/task-card";
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause,
  X,
  FolderOpen,
  Filter,
  CircleAlert,
  Loader2,
  Grid3X3,
  List,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-service";
import { toast } from "sonner";
import type { Task, TaskStatus, TaskPriority } from "@/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [shownLogs, setShownLogs] = useState<Set<number>>(new Set());
  const [logRefreshTrigger, setLogRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [accessScope, setAccessScope] = useState<{
    user_role: string;
    scope_description: string;
    viewable_user_count: number;
    viewable_users: Array<{
      id: number;
      name: string;
      role: string;
      department: string;
    }>;
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    name: string;
    role: string;
    department: string;
  } | null>(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    newTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    finishedTasks: 0,
    overdueTasks: 0
  });

  useEffect(() => {
    fetchTasks();
    fetchAccessScope();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const data = await api.tasks.getAllTasks();
      // Handle both array and object responses
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        const responseData = data as { tasks?: Task[] };
        setTasks(responseData.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks", {
        description: "Unable to load tasks. Please try again.",
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
      setIsLoadingStats(false);
    }
  };

  const fetchAccessScope = async () => {
    try {
      const data = await api.tasks.getAccessScope();
      setAccessScope(data);
    } catch (error) {
      console.error("Error fetching access scope:", error);
      // Don't show error toast for this as it's not critical
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const data = await api.users.getCurrentUser();
      setCurrentUser(data);
    } catch (error) {
      console.error("Error fetching current user:", error);
      // Don't show error toast for this as it's not critical
    }
  };

  const canEditTask = (task: Task): boolean => {
    if (!currentUser || !accessScope) return false;
    
    const userRole = currentUser.role.toUpperCase();
    
    // ADMIN and CEO can edit all tasks
    if (userRole === 'ADMIN' || userRole === 'CEO') {
      return true;
    }
    
    // User can edit their own created tasks
    if (task.creator?.id === currentUser.id) {
      return true;
    }
    
    // Check if user can edit based on role hierarchy (but NOT just because they're assigned)
    const viewableUserIds = accessScope.viewable_users.map(u => u.id);
    
    // User can edit if the CREATOR is in their scope (not the assignee)
    // This means they can manage tasks created by their subordinates
    if (viewableUserIds.includes(task.creator?.id || 0)) {
      return true;
    }
    
    // Being an assignee does NOT give edit rights
    // Only hierarchy or being the creator gives edit rights
    
    return false;
  };

  const canUpdateTaskStatus = (task: Task): boolean => {
    if (!currentUser) return false;
    
    const userRole = currentUser.role.toUpperCase();
    
    // ADMIN and CEO can update status of all tasks
    if (userRole === 'ADMIN' || userRole === 'CEO') {
      return true;
    }
    
    // User can update status of their own created tasks
    if (task.creator?.id === currentUser.id) {
      return true;
    }
    
    // User can update status if they are assigned to the task
    if (task.assigned_to === currentUser.id) {
      return true;
    }
    
    // Check if user can update status based on role hierarchy
    if (accessScope) {
      const viewableUserIds = accessScope.viewable_users.map(u => u.id);
      
      // User can update status if the CREATOR is in their scope
      if (viewableUserIds.includes(task.creator?.id || 0)) {
        return true;
      }
    }
    
    return false;
  };

  const calculateStats = () => {
    const now = new Date();
    
    const newTasks = tasks.filter(task => task.status === 'NEW').length;
    const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
    const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
    const finishedTasks = tasks.filter(task => task.status === 'FINISHED').length;
    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return dueDate < now && !['FINISHED', 'CANCELLED'].includes(task.status);
    }).length;

    setStats({
      totalTasks: tasks.length,
      newTasks,
      inProgressTasks,
      pendingTasks,
      finishedTasks,
      overdueTasks
    });
  };

  const handleTaskCreated = () => {
    fetchTasks(); // Refresh tasks list after creating a new task
  };

  const handleTaskUpdated = () => {
    fetchTasks(); // Refresh tasks list after updating a task
  };


  // Get unique assignees for filter
  const uniqueAssignees = Array.from(new Set(tasks.map(task => task.assignee?.name).filter(Boolean)));

  // Filtered tasks list
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      task.assignee?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === "all" || task.assignee?.name === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });


  const toggleTaskLogs = (taskId: number) => {
    setShownLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleLogCreated = () => {
    setLogRefreshTrigger(prev => prev + 1);
    // Optionally refresh tasks to get updated log counts
    fetchTasks();
  };


  return (
    <div className="space-y-4">
      <PageHeader 
        title="Tasks" 
        description="Manage and track all your tasks and assignments"
        action={
          <TaskCreateForm onTaskCreated={handleTaskCreated} />
        }
      />

      {/* Task Overview Cards - Modern Glass */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total Tasks */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-all group-hover:scale-110">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Tasks</h3>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{stats.totalTasks}</div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">All tasks</p>
              </>
            )}
          </div>
        </div>

        {/* New Tasks */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500/10 to-gray-500/10 dark:from-slate-500/5 dark:to-gray-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl shadow-lg group-hover:shadow-slate-500/50 transition-all group-hover:scale-110">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">New Tasks</h3>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 dark:from-slate-400 dark:to-gray-400 bg-clip-text text-transparent">{stats.newTasks}</div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">Not started</p>
              </>
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 dark:from-amber-500/5 dark:to-yellow-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg group-hover:shadow-amber-500/50 transition-all group-hover:scale-110">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">In Progress</h3>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 bg-clip-text text-transparent">{stats.inProgressTasks}</div>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1">Active tasks</p>
              </>
            )}
          </div>
        </div>

        {/* Pending */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/5 dark:to-red-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-orange-500/50 transition-all group-hover:scale-110">
                <Pause className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Pending</h3>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">{stats.pendingTasks}</div>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mt-1">Awaiting review</p>
              </>
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-green-500/50 transition-all group-hover:scale-110">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Completed</h3>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-green-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">{stats.finishedTasks}</div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">Finished tasks</p>
              </>
            )}
          </div>
        </div>

        {/* Overdue */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-500/5 dark:to-rose-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg group-hover:shadow-red-500/50 transition-all group-hover:scale-110">
                <X className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Overdue</h3>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-red-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">{stats.overdueTasks}</div>
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">Past due date</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters - Modern Glass */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500/10 to-gray-500/10 dark:from-slate-500/5 dark:to-gray-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search tasks, descriptions, or assignees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FINISHED">Finished</SelectItem>
                  <SelectItem value="STOPPED">Stopped</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-11 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="h-11 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                  <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {uniqueAssignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List - Modern Glass */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-rose-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tasks</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredTasks.length !== tasks.length 
                    ? `Showing ${filteredTasks.length} of ${tasks.length} tasks`
                    : `${filteredTasks.length} tasks total`
                  }
                </p>
              </div>
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`h-9 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  viewMode === 'card' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="text-sm font-medium">Card</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`h-9 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <List className="h-4 w-4" />
                <span className="text-sm font-medium">List</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
          {isLoadingTasks ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading tasks...</span>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-full w-fit mx-auto mb-4">
                <FolderOpen className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No tasks found</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {tasks.length === 0 
                  ? "Get started by creating your first task." 
                  : "Try adjusting your search criteria or filters."
                }
              </p>
              {tasks.length === 0 && (
                <TaskCreateForm trigger={
                  <button className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-offset-2 cursor-pointer">
                    <FolderOpen className="h-4 w-4" />
                    Create First Task
                  </button>
                } onTaskCreated={handleTaskCreated} />
              )}
            </div>
          ) : (
            <div className={`transition-all duration-500 ease-in-out ${
              viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-2.5'
            }`}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                          task={task} 
                  canEdit={canEditTask(task)}
                  canUpdateStatus={canUpdateTaskStatus(task)}
                          onTaskUpdated={handleTaskUpdated}
                        onLogCreated={handleLogCreated}
                  shownLogs={shownLogs}
                  onToggleLogs={toggleTaskLogs}
                  logRefreshTrigger={logRefreshTrigger}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}