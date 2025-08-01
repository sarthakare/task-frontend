"use client"

import { useState, useMemo } from "react"
import { Clock, AlertTriangle, Search, Plus, TrendingUp, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import type { Task, User, Notification } from "@/types"
import { HierarchyManager } from "@/lib/hierarchy"
import { TaskCreationForm } from "./task-creation-form"
import { TaskCard } from "./task-card"
import { NotificationPanel } from "./notification-panel"
import { ReportingDashboard } from "./reporting-dashboard"

// Mock data
const mockUsers: User[] = [
  { id: "1", name: "Admin User", email: "admin@company.com", role: "ADMIN", department: "IT", isActive: true },
  {
    id: "2",
    name: "John CEO",
    email: "ceo@company.com",
    role: "CEO",
    parentId: "1",
    department: "Executive",
    isActive: true,
  },
  {
    id: "3",
    name: "Sarah Manager",
    email: "sarah@company.com",
    role: "MANAGER",
    parentId: "2",
    department: "Sales",
    isActive: true,
  },
  {
    id: "4",
    name: "Mike Lead",
    email: "mike@company.com",
    role: "TEAM_LEAD",
    parentId: "3",
    department: "Sales",
    isActive: true,
  },
  {
    id: "5",
    name: "Alice Executive",
    email: "alice@company.com",
    role: "EXECUTIVE",
    parentId: "4",
    department: "Sales",
    isActive: true,
  },
  {
    id: "6",
    name: "Bob Executive",
    email: "bob@company.com",
    role: "EXECUTIVE",
    parentId: "4",
    department: "Sales",
    isActive: true,
  },
]

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Q4 Sales Report",
    description: "Prepare comprehensive Q4 sales analysis",
    createdBy: "3",
    assignedTo: "5",
    observers: ["4"],
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2024-02-15",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-22T14:30:00Z",
    tags: ["sales", "report"],
    comments: [],
    escalationLevel: 0,
  },
  {
    id: "2",
    title: "Client Presentation",
    description: "Prepare presentation for ABC Corp meeting",
    createdBy: "4",
    assignedTo: "5",
    observers: ["3"],
    status: "PENDING",
    priority: "CRITICAL",
    dueDate: "2024-01-25",
    createdAt: "2024-01-18T09:00:00Z",
    updatedAt: "2024-01-23T16:45:00Z",
    tags: ["presentation", "client"],
    comments: [],
    escalationLevel: 1,
  },
]

export function TaskDashboard() {
  const [currentUser] = useState<User>(mockUsers[3]) // Mike Lead
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [users] = useState<User[]>(mockUsers)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)

  const hierarchyManager = useMemo(() => new HierarchyManager(users), [users])

  // Get tasks visible to current user based on hierarchy
  const visibleTasks = useMemo(() => {
    const subordinates = hierarchyManager.getSubordinates(currentUser.id)
    const subordinateIds = subordinates.map((s) => s.id)

    return tasks.filter(
      (task) =>
        task.assignedTo === currentUser.id ||
        task.createdBy === currentUser.id ||
        subordinateIds.includes(task.assignedTo) ||
        subordinateIds.includes(task.createdBy) ||
        task.observers.includes(currentUser.id),
    )
  }, [tasks, currentUser.id, hierarchyManager])

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return visibleTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || task.status === statusFilter
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
      const matchesAssignee = assigneeFilter === "all" || task.assignedTo === assigneeFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })
  }, [visibleTasks, searchTerm, statusFilter, priorityFilter, assigneeFilter])

  // Calculate dashboard metrics
  const metrics = useMemo(() => {
    const now = new Date()
    const overdue = filteredTasks.filter(
      (task) => new Date(task.dueDate) < now && !["FINISHED", "CANCELLED", "STOPPED"].includes(task.status),
    )
    const dueToday = filteredTasks.filter((task) => {
      const dueDate = new Date(task.dueDate)
      return (
        dueDate.toDateString() === now.toDateString() && !["FINISHED", "CANCELLED", "STOPPED"].includes(task.status)
      )
    })
    const completed = filteredTasks.filter((task) => task.status === "FINISHED")
    const inProgress = filteredTasks.filter((task) => task.status === "IN_PROGRESS")

    return {
      total: filteredTasks.length,
      overdue: overdue.length,
      dueToday: dueToday.length,
      completed: completed.length,
      inProgress: inProgress.length,
      completionRate: filteredTasks.length > 0 ? (completed.length / filteredTasks.length) * 100 : 0,
    }
  }, [filteredTasks])

  const priorityColors = {
    LOW: "bg-green-100 text-green-800 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
    HIGH: "bg-orange-100 text-orange-800 border-orange-200",
    CRITICAL: "bg-red-100 text-red-800 border-red-200",
  }

  const statusColors = {
    NEW: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    FINISHED: "bg-green-100 text-green-800",
    STOPPED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        <div className="p-6">
          {/* Add a simple header for the current page */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {currentUser.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationPanel notifications={notifications} />
              <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <TaskCreationForm
                    currentUser={currentUser}
                    users={users}
                    hierarchyManager={hierarchyManager}
                    onTaskCreated={(task) => {
                      setTasks([...tasks, task])
                      setIsCreateTaskOpen(false)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Rest of the existing content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="hierarchy">Team</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.total}</div>
                    <p className="text-xs text-muted-foreground">{metrics.inProgress} in progress</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{metrics.overdue}</div>
                    <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Due Today</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{metrics.dueToday}</div>
                    <p className="text-xs text-muted-foreground">Focus on these tasks</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{metrics.completionRate.toFixed(1)}%</div>
                    <Progress value={metrics.completionRate} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredTasks.slice(0, 5).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        users={users}
                        currentUser={currentUser}
                        onTaskUpdate={(updatedTask) => {
                          setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              {/* Filters */}
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
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
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
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    users={users}
                    currentUser={currentUser}
                    onTaskUpdate={(updatedTask) => {
                      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
                    }}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <ReportingDashboard
                tasks={visibleTasks}
                users={users}
                currentUser={currentUser}
                hierarchyManager={hierarchyManager}
              />
            </TabsContent>

            <TabsContent value="hierarchy">
              <Card>
                <CardHeader>
                  <CardTitle>Team Hierarchy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => {
                      const subordinates = hierarchyManager.getSubordinates(user.id)
                      const userTasks = tasks.filter((t) => t.assignedTo === user.id)
                      const completedTasks = userTasks.filter((t) => t.status === "FINISHED")

                      return (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{user.name}</h3>
                              <p className="text-sm text-gray-600">
                                {user.role} - {user.department}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {userTasks.length} tasks ({completedTasks.length} completed)
                            </p>
                            <p className="text-xs text-gray-600">{subordinates.length} subordinates</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
