"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import {
  Users,
  FolderOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  Activity,
  Award,
  Target,
  Zap,
  BarChart3,
  AlertCircle,
  CircleAlert,
  Loader2,
  User,
  Building,
  Shield,
} from "lucide-react";
import { api } from "@/lib/api-service";
import { toast } from "sonner";
import type { DashboardOverview, Activity as ActivityType, Task, Project } from "@/types";
import { useAuth } from "@/contexts/auth-context";

export default function Dashboard() {
  // Get current user from auth context
  const { user } = useAuth();
  
  // State for dashboard data
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityType[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isDeadlinesLoading, setIsDeadlinesLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all dashboard data in parallel
      const [overviewData, activitiesData, projectsData, deadlinesData] = await Promise.allSettled([
        api.dashboard.getOverview(),
        api.dashboard.getRecentActivities(5),
        api.dashboard.getProjects(),
        api.dashboard.getUpcomingDeadlines(7)
      ]);

      // Handle overview data
      if (overviewData.status === 'fulfilled') {
        setOverview(overviewData.value);
      } else {
        console.error('Error fetching overview:', overviewData.reason);
        toast.error('Failed to load dashboard overview',{
          icon: <CircleAlert className="text-red-600" />,
          style: { color: "red" },
        });
      }

      // Handle activities data
      if (activitiesData.status === 'fulfilled') {
        setRecentActivities(activitiesData.value);
      } else {
        console.error('Error fetching activities:', activitiesData.reason);
        toast.error('Failed to load activities',{
          icon: <CircleAlert className="text-red-600" />,
          style: { color: "red" },
        });
      }
      setIsActivitiesLoading(false);

      // Handle projects data (take only recent 4)
      if (projectsData.status === 'fulfilled') {
        const sortedProjects = projectsData.value
          .filter(project => project.status === 'active')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4);
        setRecentProjects(sortedProjects);
      } else {
        console.error('Error fetching projects:', projectsData.reason);
        toast.error('Failed to load projects',{
          icon: <CircleAlert className="text-red-600" />,
          style: { color: "red" },
        });
      }
      setIsProjectsLoading(false);

      // Handle deadlines data
      if (deadlinesData.status === 'fulfilled') {
        setUpcomingDeadlines(deadlinesData.value.slice(0, 4));
      } else {
        console.error('Error fetching deadlines:', deadlinesData.reason);
        toast.error('Failed to load deadlines',{
          icon: <CircleAlert className="text-red-600" />,
          style: { color: "red" },
        });
      }
      setIsDeadlinesLoading(false);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data',{
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800";
      case "on_hold": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-800";
      case "CRITICAL": return "bg-red-200 text-red-900";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "LOW": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('task') || action.includes('completed')) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    } else if (action.includes('project') || action.includes('created')) {
      return <FolderOpen className="h-4 w-4 text-blue-600" />;
    } else if (action.includes('team') || action.includes('joined')) {
      return <Users className="h-4 w-4 text-purple-600" />;
    } else if (action.includes('review') || action.includes('submitted')) {
      return <Award className="h-4 w-4 text-orange-600" />;
    } else {
      return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateProjectProgress = (project: Project) => {
    // Since we don't have progress data, we'll estimate based on dates
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.floor((elapsed / totalDuration) * 100);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getRoleBasedTitle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin Dashboard';
      case 'CEO':
        return 'CEO Dashboard';
      case 'MANAGER':
        return 'Manager Dashboard';
      case 'TEAM_LEAD':
        return 'Team Lead Dashboard';
      case 'MEMBER':
        return 'My Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getRoleBasedDescription = (role: string, overview: DashboardOverview | null) => {
    if (!overview) return "Loading your personalized dashboard...";
    
    switch (role) {
      case 'ADMIN':
        return "Complete system overview with all users, projects, and tasks.";
      case 'CEO':
        return "Executive overview of organizational performance and key metrics.";
      case 'MANAGER':
        return `Managing ${overview.direct_subordinates_count || 0} direct reports and their teams.`;
      case 'TEAM_LEAD':
        return overview.team_info 
          ? `Leading ${overview.team_info.team_name} (${overview.team_info.member_count} members) in ${overview.team_info.department}.`
          : "Leading your team and managing tasks.";
      case 'MEMBER':
        return "Your personal task overview and upcoming deadlines.";
      default:
        return "Here's what's happening with your projects and teams.";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={getRoleBasedTitle(overview?.user_role || '')} 
        description={getRoleBasedDescription(overview?.user_role || '', overview)}
      />

      {/* User Info Section */}
      {user && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Name */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Name</p>
                  <p className="text-sm text-gray-600">{user.name}</p>
                </div>
              </div>

              {/* Department */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Department</p>
                  <p className="text-sm text-gray-600">{user.department}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Role</p>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs mt-1 ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'CEO' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'TEAM_LEAD' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              {overview?.user_role === 'MEMBER' ? 'My Tasks' : 
               overview?.user_role === 'TEAM_LEAD' ? 'Team Members' :
               overview?.user_role === 'MANAGER' ? 'Direct Reports' : 'Total Users'}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-900">
                  {overview?.user_role === 'MEMBER' ? overview?.total_tasks || 0 :
                   overview?.user_role === 'TEAM_LEAD' ? overview?.team_info?.member_count || 0 :
                   overview?.user_role === 'MANAGER' ? overview?.direct_subordinates_count || 0 :
                   overview?.total_users || 0}
                </div>
                <div className="flex items-center text-xs text-blue-700 mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  {overview?.user_role === 'MEMBER' ? `${overview?.completed_tasks || 0} completed` :
                   overview?.user_role === 'TEAM_LEAD' ? `${overview?.active_users || 0} active` :
                   overview?.user_role === 'MANAGER' ? `${overview?.active_users || 0} active` :
                   `${overview?.active_users || 0} active`}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              {overview?.user_role === 'MEMBER' ? 'Completed Tasks' : 'Total Projects'}
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-900">
                  {overview?.user_role === 'MEMBER' ? overview?.completed_tasks || 0 : overview?.total_projects || 0}
                </div>
                <div className="flex items-center text-xs text-green-700 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {overview?.user_role === 'MEMBER' ? 
                    `${((overview?.completed_tasks || 0) / Math.max(overview?.total_tasks || 1, 1) * 100).toFixed(1)}% completion rate` :
                    `${overview?.active_projects || 0} active`}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              {overview?.user_role === 'MEMBER' ? 'Pending Tasks' : 'Completed Tasks'}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-900">
                  {overview?.user_role === 'MEMBER' ? overview?.pending_tasks || 0 : overview?.completed_tasks || 0}
                </div>
                <div className="flex items-center text-xs text-purple-700 mt-1">
                  <Target className="h-3 w-3 mr-1" />
                  {overview?.user_role === 'MEMBER' ? 
                    `${overview?.overdue_tasks || 0} overdue` :
                    `${((overview?.completed_tasks || 0) / Math.max(overview?.total_tasks || 1, 1) * 100).toFixed(1)}% completion rate`}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">
              {overview?.user_role === 'MEMBER' ? 'Overdue Tasks' : 'Pending Tasks'}
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-900">
                  {overview?.user_role === 'MEMBER' ? overview?.overdue_tasks || 0 : overview?.pending_tasks || 0}
                </div>
                <div className="flex items-center text-xs text-orange-700 mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {overview?.user_role === 'MEMBER' ? 
                    'Need attention' :
                    `${overview?.overdue_tasks || 0} overdue`}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Access Scope Info */}
      {overview?.scope_description && (
        <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Your Access Scope</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {overview.scope_description.user_role}
                </Badge>
                {overview.team_info && (
                  <span className="text-xs text-gray-500">
                    {overview.team_info.team_name} • {overview.team_info.department}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {overview.scope_description.scope_description}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* People in Scope */}
              <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-gray-900">{overview.scope_description.viewable_user_count}</div>
                <div className="text-xs text-gray-500">People in Scope</div>
              </div>

              {/* Projects */}
              <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                <FolderOpen className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-gray-900">{overview.total_projects}</div>
                <div className="text-xs text-gray-500">Projects</div>
              </div>

              {/* Tasks */}
              <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                <CheckCircle2 className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-gray-900">{overview.total_tasks}</div>
                <div className="text-xs text-gray-500">Tasks</div>
              </div>

              {/* Direct Reports */}
              {overview.scope_details && overview.scope_details.total_direct_reports > 0 && (
                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                  <Users className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-gray-900">{overview.scope_details.total_direct_reports}</div>
                  <div className="text-xs text-gray-500">Direct Reports</div>
                </div>
              )}

              {/* Teams Leading */}
              {overview.scope_details && overview.scope_details.total_teams_leading > 0 && (
                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                  <Users className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-gray-900">{overview.scope_details.total_teams_leading}</div>
                  <div className="text-xs text-gray-500">Teams Leading</div>
                </div>
              )}

              {/* Department Members */}
              {overview.scope_details?.department_info && (
                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                  <Users className="h-5 w-5 text-teal-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-gray-900">{overview.scope_details.department_info.total_members}</div>
                  <div className="text-xs text-gray-500">Dept. Members</div>
                </div>
              )}

              {/* Total Subordinates */}
              {overview.scope_details && overview.scope_details.total_subordinates > 0 && (
                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                  <Users className="h-5 w-5 text-red-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-gray-900">{overview.scope_details.total_subordinates}</div>
                  <div className="text-xs text-gray-500">Total Subordinates</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/projects'}>
              <FolderOpen className="h-4 w-4 mr-1" />
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isProjectsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading projects...</span>
                </div>
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No active projects</p>
                <p className="text-sm text-gray-400">Create your first project to get started</p>
              </div>
            ) : (
              recentProjects.map((project) => {
                const progress = calculateProjectProgress(project);
                return (
                  <div key={project.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Progress: {progress}%</span>
                        <span>{project.assigned_teams.length} team{project.assigned_teams.length !== 1 ? 's' : ''}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(project.end_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Manager: {project.manager.name}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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
              {isActivitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading activities...</span>
                  </div>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activities</p>
                  <p className="text-sm text-gray-400">Activity will appear here as your team works</p>
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.description)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.user.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {!isActivitiesLoading && recentActivities.length > 0 && (
              <Button variant="ghost" className="w-full mt-4 text-sm" onClick={() => window.location.href = '/reports'}>
                View All Activities
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Task Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Task Summary
            </CardTitle>
            <p className="text-sm text-muted-foreground">Overview of task distribution</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Total Tasks</span>
                  </div>
                  <span className="text-lg font-bold text-blue-900">{overview?.total_tasks || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Completed</span>
                  </div>
                  <span className="text-lg font-bold text-green-900">{overview?.completed_tasks || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Pending</span>
                  </div>
                  <span className="text-lg font-bold text-orange-900">{overview?.pending_tasks || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Overdue</span>
                  </div>
                  <span className="text-lg font-bold text-red-900">{overview?.overdue_tasks || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-600" />
              Upcoming Deadlines
            </CardTitle>
            <p className="text-sm text-muted-foreground">Tasks due soon</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isDeadlinesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading deadlines...</span>
                  </div>
                </div>
              ) : upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming deadlines</p>
                  <p className="text-sm text-gray-400">All tasks are on track</p>
                </div>
              ) : (
                upcomingDeadlines.map((task, index) => (
                  <div key={task.id || index} className="p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded-r-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{task.project?.name || 'No project'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {task.assignee.name}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {!isDeadlinesLoading && upcomingDeadlines.length > 0 && (
              <Button variant="ghost" className="w-full mt-4 text-sm" onClick={() => window.location.href = '/tasks'}>
                View All Tasks
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role-based Quick Actions */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            {overview?.user_role === 'MEMBER' ? 'My Quick Actions' : 'Quick Actions'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {overview?.user_role === 'MEMBER' ? 'Common tasks and shortcuts for your work' : 'Common tasks and shortcuts'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {overview?.user_role === 'MEMBER' ? (
              // Member-specific actions
              <>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/tasks'}
                >
                  <CheckCircle2 className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm">My Tasks</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/reminders'}
                >
                  <Bell className="h-6 w-6 mb-2 text-green-600" />
                  <span className="text-sm">Reminders</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/reports'}
                >
                  <BarChart3 className="h-6 w-6 mb-2 text-purple-600" />
                  <span className="text-sm">My Reports</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/projects'}
                >
                  <FolderOpen className="h-6 w-6 mb-2 text-orange-600" />
                  <span className="text-sm">Projects</span>
                </Button>
              </>
            ) : overview?.user_role === 'TEAM_LEAD' ? (
              // Team Lead actions
              <>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/teams'}
                >
                  <Users className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm">My Team</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/tasks'}
                >
                  <CheckCircle2 className="h-6 w-6 mb-2 text-green-600" />
                  <span className="text-sm">Team Tasks</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/users'}
                >
                  <Users className="h-6 w-6 mb-2 text-purple-600" />
                  <span className="text-sm">Team Members</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/reports'}
                >
                  <BarChart3 className="h-6 w-6 mb-2 text-orange-600" />
                  <span className="text-sm">Team Reports</span>
                </Button>
              </>
            ) : overview?.user_role === 'MANAGER' ? (
              // Manager actions
              <>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/users'}
                >
                  <Users className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/teams'}
                >
                  <Users className="h-6 w-6 mb-2 text-green-600" />
                  <span className="text-sm">Manage Teams</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/projects'}
                >
                  <FolderOpen className="h-6 w-6 mb-2 text-purple-600" />
                  <span className="text-sm">Projects</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/reports'}
                >
                  <BarChart3 className="h-6 w-6 mb-2 text-orange-600" />
                  <span className="text-sm">Reports</span>
                </Button>
              </>
            ) : (
              // Admin/CEO actions
              <>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/users'}
                >
                  <Users className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/projects'}
                >
                  <FolderOpen className="h-6 w-6 mb-2 text-green-600" />
                  <span className="text-sm">Projects</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/teams'}
                >
                  <Users className="h-6 w-6 mb-2 text-purple-600" />
                  <span className="text-sm">Teams</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = '/tasks'}
                >
                  <CheckCircle2 className="h-6 w-6 mb-2 text-orange-600" />
                  <span className="text-sm">Tasks</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}