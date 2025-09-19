"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="space-y-6">
      <PageHeader 
        title="Tasks" 
        description="Manage and track all your tasks and assignments"
        action={
          <TaskCreateForm onTaskCreated={handleTaskCreated} />
        }
      />


      {/* Task Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Tasks</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
            <FolderOpen className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-blue-900 mb-1">{stats.totalTasks}</div>
                <p className="text-xs text-blue-700 font-medium">All tasks</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900">New Tasks</CardTitle>
            <div className="p-2 bg-slate-100 rounded-lg">
              <Clock className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stats.newTasks}</div>
                <p className="text-xs text-slate-700 font-medium">Not started</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">In Progress</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-amber-900 mb-1">{stats.inProgressTasks}</div>
                <p className="text-xs text-amber-700 font-medium">Active tasks</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Pending</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
            <Pause className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-orange-900 mb-1">{stats.pendingTasks}</div>
                <p className="text-xs text-orange-700 font-medium">Awaiting review</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Completed</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-emerald-900 mb-1">{stats.finishedTasks}</div>
                <p className="text-xs text-emerald-700 font-medium">Finished tasks</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Overdue</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
            <X className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-red-900 mb-1">{stats.overdueTasks}</div>
                <p className="text-xs text-red-700 font-medium">Past due date</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar - 55% width on large screens */}
            <div className="relative flex-1 lg:w-[55%]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks, descriptions, or assignees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 border-gray-200 focus:border-blue-300 focus:ring-blue-200 w-full"
              />
            </div>

            {/* Filters - 45% width on large screens, arranged in 3 columns */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:w-[45%]">
              <div className="flex-1">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200 w-full cursor-pointer">
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
              </div>

              <div className="flex-1">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200 w-full cursor-pointer">
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
              </div>

              <div className="flex-1">
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200 w-full cursor-pointer">
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
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FolderOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <span className="text-lg font-semibold">Tasks</span>
                <div className="text-sm text-gray-500 font-normal">
                  {filteredTasks.length !== tasks.length 
                    ? `Showing ${filteredTasks.length} of ${tasks.length} tasks`
                    : `${filteredTasks.length} tasks total`
                  }
                </div>
              </div>
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className={`h-8 px-3 transition-all duration-200 cursor-pointer ${
                    viewMode === 'card' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:from-purple-600 hover:to-blue-600 hover:text-white' 
                      : 'text-gray-600 hover:bg-blue-200'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  Card
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-8 px-3 transition-all duration-200 cursor-pointer ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:from-purple-600 hover:to-blue-600 hover:text-white' 
                      : 'text-gray-600 hover:bg-blue-200'
                  }`}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTasks ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading tasks...</span>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-4">
                {tasks.length === 0 
                  ? "Get started by creating your first task." 
                  : "Try adjusting your search criteria or filters."
                }
              </p>
              {tasks.length === 0 && (
                <TaskCreateForm trigger={
                  <Button className="cursor-pointer">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Create First Task
                  </Button>
                } onTaskCreated={handleTaskCreated} />
              )}
            </div>
          ) : (
            <div className={`transition-all duration-500 ease-in-out ${
              viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-3'
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
        </CardContent>
      </Card>
    </div>
  );
}