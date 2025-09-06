"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-header";
import {
  Users,
  FolderOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Bell,
  Activity,
  Award,
  Target,
  Zap,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from "lucide-react";

export default function Dashboard() {
  // Static data for the dashboard
  const stats = {
    totalUsers: 156,
    activeProjects: 23,
    completedTasks: 847,
    pendingTasks: 142,
    userGrowth: 12.5,
    projectGrowth: 8.3,
    taskCompletion: 85.7,
    teamEfficiency: 92.4
  };

  const recentProjects = [
    { id: 1, name: "E-commerce Platform", progress: 75, status: "active", team: "Frontend Team", dueDate: "Dec 25, 2024" },
    { id: 2, name: "Mobile App Redesign", progress: 45, status: "active", team: "Design Team", dueDate: "Jan 15, 2025" },
    { id: 3, name: "Data Analytics Dashboard", progress: 90, status: "review", team: "Backend Team", dueDate: "Dec 20, 2024" },
    { id: 4, name: "Customer Portal", progress: 25, status: "active", team: "Full Stack Team", dueDate: "Feb 10, 2025" }
  ];

  const recentActivities = [
    { user: "Sarah Johnson", action: "completed task 'User Authentication'", time: "2 minutes ago", type: "task" },
    { user: "Mike Chen", action: "created new project 'API Integration'", time: "15 minutes ago", type: "project" },
    { user: "Emma Davis", action: "updated team 'Backend Developers'", time: "1 hour ago", type: "team" },
    { user: "Alex Rodriguez", action: "submitted code review", time: "2 hours ago", type: "review" },
    { user: "Lisa Wang", action: "joined team 'QA Testing'", time: "3 hours ago", type: "team" }
  ];

  const topPerformers = [
    { name: "Sarah Johnson", role: "Senior Developer", tasks: 28, efficiency: 96 },
    { name: "Mike Chen", role: "Project Manager", tasks: 24, efficiency: 94 },
    { name: "Emma Davis", role: "Backend Developer", tasks: 22, efficiency: 91 },
    { name: "Alex Rodriguez", role: "Frontend Developer", tasks: 20, efficiency: 89 }
  ];

  const upcomingDeadlines = [
    { project: "E-commerce Platform", task: "Payment Integration", dueDate: "Dec 20, 2024", priority: "high" },
    { project: "Mobile App Redesign", task: "UI Component Library", dueDate: "Dec 22, 2024", priority: "medium" },
    { project: "Data Analytics Dashboard", task: "Final Testing", dueDate: "Dec 18, 2024", priority: "high" },
    { project: "Customer Portal", task: "Database Schema", dueDate: "Dec 25, 2024", priority: "low" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800";
      case "review": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "project": return <FolderOpen className="h-4 w-4 text-blue-600" />;
      case "team": return <Users className="h-4 w-4 text-purple-600" />;
      case "review": return <Award className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back! Here's what's happening with your projects and teams."
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
            <div className="flex items-center text-xs text-blue-700 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats.userGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.activeProjects}</div>
            <div className="flex items-center text-xs text-green-700 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats.projectGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.completedTasks}</div>
            <div className="flex items-center text-xs text-purple-700 mt-1">
              <Target className="h-3 w-3 mr-1" />
              {stats.taskCompletion}% completion rate
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.pendingTasks}</div>
            <div className="flex items-center text-xs text-orange-700 mt-1">
              <Zap className="h-3 w-3 mr-1" />
              {stats.teamEfficiency}% team efficiency
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Recent Projects
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Track progress of ongoing projects</p>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Project
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Progress: {project.progress}%</span>
                    <span>{project.team}</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {project.dueDate}
                    </span>
                    <span className={project.progress > 75 ? "text-green-600" : project.progress > 50 ? "text-yellow-600" : "text-red-600"}>
                      {project.progress > 75 ? "On Track" : project.progress > 50 ? "At Risk" : "Behind"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Recent Activities
            </CardTitle>
            <p className="text-sm text-muted-foreground">Latest team activities</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-600 mt-1">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm">
              View All Activities
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Top Performers
            </CardTitle>
            <p className="text-sm text-muted-foreground">Team members with highest efficiency</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-900">
                        {performer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                      <div className="flex items-center text-xs text-green-600">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {performer.efficiency}%
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{performer.role}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{performer.tasks} tasks completed</span>
                      <Progress value={performer.efficiency} className="h-1 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-600" />
              Upcoming Deadlines
            </CardTitle>
            <p className="text-sm text-muted-foreground">Tasks and projects due soon</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded-r-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{deadline.task}</h4>
                    <Badge className={getPriorityColor(deadline.priority)}>
                      {deadline.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{deadline.project}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {deadline.dueDate}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      View Task
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            Quick Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground">Common tasks and shortcuts</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col bg-white hover:bg-gray-50">
              <Users className="h-6 w-6 mb-2 text-blue-600" />
              <span className="text-sm">Add User</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-white hover:bg-gray-50">
              <FolderOpen className="h-6 w-6 mb-2 text-green-600" />
              <span className="text-sm">New Project</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-white hover:bg-gray-50">
              <Users className="h-6 w-6 mb-2 text-purple-600" />
              <span className="text-sm">Create Team</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-white hover:bg-gray-50">
              <BarChart3 className="h-6 w-6 mb-2 text-orange-600" />
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}