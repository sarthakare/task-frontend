"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Task, User } from "@/types"
import type { HierarchyManager } from "@/lib/hierarchy"

interface ReportingDashboardProps {
  tasks: Task[]
  users: User[]
  currentUser: User
  hierarchyManager: HierarchyManager
}

export function ReportingDashboard({ tasks, users, currentUser, hierarchyManager }: ReportingDashboardProps) {
  const reports = useMemo(() => {
    const subordinates = hierarchyManager.getSubordinates(currentUser.id)
    const relevantUsers = [currentUser, ...subordinates]

    return relevantUsers.map((user) => {
      const userTasks = tasks.filter((t) => t.assignedTo === user.id)
      const completedTasks = userTasks.filter((t) => t.status === "FINISHED")
      const overdueTasks = userTasks.filter(
        (t) => new Date(t.dueDate) < new Date() && !["FINISHED", "CANCELLED", "STOPPED"].includes(t.status),
      )
      const escalatedTasks = userTasks.filter((t) => t.escalationLevel > 0)

      // Calculate average response time (mock calculation)
      const avgResponseTime =
        userTasks.length > 0
          ? userTasks.reduce((acc, task) => {
              const created = new Date(task.createdAt).getTime()
              const updated = new Date(task.updatedAt).getTime()
              return acc + (updated - created) / (1000 * 60 * 60 * 24) // days
            }, 0) / userTasks.length
          : 0

      return {
        userId: user.id,
        userName: user.name,
        totalTasks: userTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        escalatedTasks: escalatedTasks.length,
      }
    })
  }, [tasks, currentUser, hierarchyManager])

  const chartData = reports.map((report) => ({
    name: report.userName.split(" ")[0],
    completed: report.completedTasks,
    overdue: report.overdueTasks,
    total: report.totalTasks,
  }))

  const statusData = [
    { name: "Completed", value: tasks.filter((t) => t.status === "FINISHED").length, color: "#10B981" },
    { name: "In Progress", value: tasks.filter((t) => t.status === "IN_PROGRESS").length, color: "#8B5CF6" },
    { name: "Pending", value: tasks.filter((t) => t.status === "PENDING").length, color: "#F59E0B" },
    { name: "New", value: tasks.filter((t) => t.status === "NEW").length, color: "#3B82F6" },
    {
      name: "Overdue",
      value: tasks.filter(
        (t) => new Date(t.dueDate) < new Date() && !["FINISHED", "CANCELLED", "STOPPED"].includes(t.status),
      ).length,
      color: "#EF4444",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(reports.reduce((acc, r) => acc + r.completionRate, 0) / reports.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Average completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Escalations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {reports.reduce((acc, r) => acc + r.escalatedTasks, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {reports.reduce((acc, r) => acc + r.overdueTasks, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((reports.reduce((acc, r) => acc + r.avgResponseTime, 0) / reports.length) * 10) / 10}d
            </div>
            <p className="text-xs text-muted-foreground">Days to first update</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion by Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Bar dataKey="overdue" fill="#EF4444" name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Individual Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Performance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.userId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{report.userName}</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {report.completedTasks}/{report.totalTasks} completed
                    </Badge>
                    {report.overdueTasks > 0 && <Badge variant="destructive">{report.overdueTasks} overdue</Badge>}
                    {report.escalatedTasks > 0 && <Badge variant="secondary">{report.escalatedTasks} escalated</Badge>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                    <Progress value={report.completionRate} className="mb-1" />
                    <p className="text-xs text-gray-500">{report.completionRate.toFixed(1)}%</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                    <p className="text-lg font-semibold">{report.avgResponseTime} days</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Task Load</p>
                    <p className="text-lg font-semibold">{report.totalTasks} tasks</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
