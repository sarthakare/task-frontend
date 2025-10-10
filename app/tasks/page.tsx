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

      {/* Task Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FolderOpen className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Tasks</h3>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">All tasks</p>
            </>
          )}
        </div>

        {/* New Tasks */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">New Tasks</h3>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.newTasks}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Not started</p>
            </>
          )}
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">In Progress</h3>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inProgressTasks}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Active tasks</p>
            </>
          )}
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Pause className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Pending</h3>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingTasks}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Awaiting review</p>
            </>
          )}
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Completed</h3>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin text-green-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.finishedTasks}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Finished tasks</p>
            </>
          )}
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <X className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Overdue</h3>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin text-red-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.overdueTasks}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Past due date</p>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
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
              <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
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
              <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
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

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <FolderOpen className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredTasks.length !== tasks.length 
                  ? `Showing ${filteredTasks.length} of ${tasks.length} tasks`
                  : `${filteredTasks.length} tasks total`
                }
              </p>
            </div>
          </div>
          
          {/* View Toggle Buttons */}
          <div className="flex bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`h-9 px-4 rounded flex items-center gap-2 transition-colors cursor-pointer ${
                viewMode === 'card' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="text-sm font-medium">Card</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`h-9 px-4 rounded flex items-center gap-2 transition-colors cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-full w-fit mx-auto mb-4">
                <FolderOpen className="h-12 w-12 text-purple-500" />
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
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
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
  );
}