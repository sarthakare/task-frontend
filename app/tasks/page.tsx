"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { TaskCreateForm } from "@/components/task-create-form";
import { TaskEditForm } from "@/components/task-edit-form";
import { TaskDetailsModal } from "@/components/task-details-modal";
import { TaskLogCreateForm } from "@/components/task-log-create-form";
import { TaskLogDisplay } from "@/components/task-log-display";
import { 
  Search,
  Calendar,
  User,
  Flag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause,
  X,
  FolderOpen,
  MoreHorizontal,
  Filter,
  Plus,
  Eye,
  EyeOff,
  CircleAlert,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api-service";
import { toast } from "sonner";
import type { Task, TaskStatus, TaskPriority } from "@/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [shownLogs, setShownLogs] = useState<Set<number>>(new Set());
  const [logRefreshTrigger, setLogRefreshTrigger] = useState(0);
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
  }, []);

  useEffect(() => {
    calculateStats();
  }, [tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTasks = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
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

  const handleTaskStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await api.tasks.updateTask(taskId, { status: newStatus });
      
      const statusText = newStatus === 'IN_PROGRESS' ? 'started' : 
                        newStatus === 'FINISHED' ? 'completed' :
                        newStatus === 'PENDING' ? 'marked as pending' :
                        newStatus === 'CANCELLED' ? 'cancelled' : 'updated';

      toast.success(`Task ${statusText}`, {
        description: 'Task status has been updated successfully.',
        duration: 3000,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });
      
      fetchTasks(); // Refresh the tasks list
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status', {
        description: 'Please try again.',
        duration: 4000,
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    }
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tasks" description="Loading tasks..." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Tasks</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalTasks}</div>
            <p className="text-xs text-blue-700">All tasks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">New Tasks</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.newTasks}</div>
            <p className="text-xs text-gray-700">Not started</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.inProgressTasks}</div>
            <p className="text-xs text-yellow-700">Active tasks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Pending</CardTitle>
            <Pause className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.pendingTasks}</div>
            <p className="text-xs text-orange-700">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.finishedTasks}</div>
            <p className="text-xs text-green-700">Finished tasks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Overdue</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.overdueTasks}</div>
            <p className="text-xs text-red-700">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tasks ({filteredTasks.length})</span>
            <div className="text-sm text-gray-500">
              {filteredTasks.length !== tasks.length && `Showing ${filteredTasks.length} of ${tasks.length} tasks`}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
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
                  <Button>
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Create First Task
                  </Button>
                } onTaskCreated={handleTaskCreated} />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${isOverdue(task.due_date, task.status) ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        {isOverdue(task.due_date, task.status) && (
                          <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">{task.assignee?.name || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flag className="h-3 w-3 text-gray-400" />
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3 text-gray-400" />
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <TaskDetailsModal task={task} />
                      
                      <TaskEditForm 
                        task={task} 
                        onTaskUpdated={handleTaskUpdated}
                      />
                      
                      {/* Task Log Actions */}
                      <TaskLogCreateForm
                        taskId={task.id}
                        taskTitle={task.title}
                        onLogCreated={handleLogCreated}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Log
                          </Button>
                        }
                      />
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleTaskLogs(task.id)}
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
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuSeparator />
                          
                          {/* Status change options */}
                          {task.status !== 'IN_PROGRESS' && (
                            <DropdownMenuItem 
                              onClick={() => handleTaskStatusChange(task.id, 'IN_PROGRESS')}
                              className="flex items-center gap-2"
                            >
                              <AlertCircle className="h-4 w-4" />
                              Start Task
                            </DropdownMenuItem>
                          )}
                          
                          {task.status === 'IN_PROGRESS' && (
                            <DropdownMenuItem 
                              onClick={() => handleTaskStatusChange(task.id, 'PENDING')}
                              className="flex items-center gap-2"
                            >
                              <Pause className="h-4 w-4" />
                              Mark Pending
                            </DropdownMenuItem>
                          )}
                          
                          {!['FINISHED', 'CANCELLED'].includes(task.status) && (
                            <DropdownMenuItem 
                              onClick={() => handleTaskStatusChange(task.id, 'FINISHED')}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          
                          {!['FINISHED', 'CANCELLED'].includes(task.status) && (
                            <DropdownMenuItem 
                              onClick={() => handleTaskStatusChange(task.id, 'CANCELLED')}
                              className="flex items-center gap-2"
                            >
                              <X className="h-4 w-4" />
                              Cancel Task
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Task Logs Display */}
                  {shownLogs.has(task.id) && (
                    <div className="mt-4">
                      <TaskLogDisplay
                        taskId={task.id}
                        taskTitle={task.title}
                        refreshTrigger={logRefreshTrigger}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}