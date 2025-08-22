"use client";

import { Task, User } from "@/types";
import { getToken, getUser } from "@/utils/auth";
import { useEffect, useState } from "react";
import { NotificationPanel } from "./notification-panel";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  AlertTriangle,
  CircleAlert,
  Clock,
  FileText,
  Plus,
  Search,
  TrendingUp,
  UserCircle,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { TaskCreationForm } from "./task-creation-form";
import { toast } from "sonner";
import { LoadingSpinner } from "./loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { TaskCard } from "./task-card";
import { apiFetch } from "@/lib/api";
import { ReportingDashboard } from "./reporting-dashboard";
import HierarchyDashboard from "./hierarchy-dashboard";

interface TaskMetrics {
  total: number;
  finished: number;
  overdue: number;
  upcoming: number;
}

interface TaskResponse {
  total: number;
  finished: number;
  overdue: number;
  upcoming: number;
  tasks: Task[];
}

export function TaskDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();
  const [metrics, setMetrics] = useState<TaskMetrics>({
    total: 0,
    finished: 0,
    overdue: 0,
    upcoming: 0,
  });

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    router.push("/auth/login");
  };

  // 🔹 Added states for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const user = getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const token = getToken();

      const response = await apiFetch("/tasks/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data: TaskResponse = await response.json();
      setTasks(data.tasks);
      setMetrics({
        total: data.total,
        finished: data.finished,
        overdue: data.overdue,
        upcoming: data.upcoming,
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 🔹 Filtered tasks list
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      );

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    ); // Show loading spinner while fetching user data
  }

  const handleTaskCreated = () => {
    setIsCreateTaskOpen(false);
    fetchTasks();
  };

  const completionRate =
    metrics.total > 0
      ? Math.round((metrics.finished / metrics.total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        <div className="p-6">
          {/* Add a simple header for the current page */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {currentUser?.name ?? "User"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationPanel notifications={notifications} />
              <Dialog
                open={isCreateTaskOpen}
                onOpenChange={setIsCreateTaskOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] min-w-[80vw] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <TaskCreationForm
                    currentUser={currentUser}
                    onTaskCreated={handleTaskCreated}
                  />
                </DialogContent>
              </Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <UserCircle className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="text-red-600">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Rest of the existing content */}
          <Tabs defaultValue="dashboard">
            <TabsList className="mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="hierarchy">Team</TabsTrigger>
            </TabsList>

            {/* Dashboard */}
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Tasks
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.total}</div>
                    <p className="text-xs text-muted-foreground">in progress</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Overdue
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {metrics.overdue}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Requires immediate attention
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Upcoming
                    </CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {metrics.upcoming}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tasks to focus on
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completion Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {completionRate}%
                    </div>
                    <Progress value={completionRate} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {tasks.length > 0 ? (
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          fetchTasks={fetchTasks}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No tasks yet — create some!
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks */}
            <TabsContent value="tasks">
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search tasks..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Status Filter */}
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FINISHED">Finished</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Priority Filter */}
                    <Select
                      value={priorityFilter}
                      onValueChange={setPriorityFilter}
                    >
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Task List */}
              <div className="space-y-4">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      fetchTasks={fetchTasks}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No tasks match your search or filters.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* reports */}
            <TabsContent value="reports">
              <ReportingDashboard />
            </TabsContent>

            {/* hierarchy */}
            <TabsContent value="hierarchy">
              <HierarchyDashboard/>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
