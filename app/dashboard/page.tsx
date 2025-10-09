"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
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
  BarChart3,
  AlertCircle,
  CircleAlert,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api-service";
import { toast } from "sonner";
import type { DashboardOverview, Activity as ActivityType, Task, Project } from "@/types";

export default function Dashboard() {
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
    <div className="space-y-4">
      <PageHeader 
        title={getRoleBasedTitle(overview?.user_role || '')} 
        description={getRoleBasedDescription(overview?.user_role || '', overview)}
      />

      {/* Key Metrics - Interactive Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-all group-hover:scale-110">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                {overview?.user_role === 'MEMBER' ? 'Tasks' : 'People'}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {overview?.user_role === 'MEMBER' ? 'My Tasks' : 
               overview?.user_role === 'TEAM_LEAD' ? 'Team Members' :
               overview?.user_role === 'MANAGER' ? 'Direct Reports' : 'Total Users'}
            </h3>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
                  {overview?.user_role === 'MEMBER' ? overview?.total_tasks || 0 :
                   overview?.user_role === 'TEAM_LEAD' ? overview?.team_info?.member_count || 0 :
                   overview?.user_role === 'MANAGER' ? overview?.direct_subordinates_count || 0 :
                   overview?.total_users || 0}
                </div>
                <div className="flex items-center text-xs font-medium text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {overview?.user_role === 'MEMBER' ? `${overview?.completed_tasks || 0} completed` :
                   overview?.user_role === 'TEAM_LEAD' ? `${overview?.active_users || 0} active` :
                   overview?.user_role === 'MANAGER' ? `${overview?.active_users || 0} active` :
                   `${overview?.active_users || 0} active`}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-green-500/50 transition-all group-hover:scale-110">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                {overview?.user_role === 'MEMBER' ? 'Done' : 'Projects'}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {overview?.user_role === 'MEMBER' ? 'Completed Tasks' : 'Total Projects'}
            </h3>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
                  {overview?.user_role === 'MEMBER' ? overview?.completed_tasks || 0 : overview?.total_projects || 0}
                </div>
                <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {overview?.user_role === 'MEMBER' ? 
                    `${((overview?.completed_tasks || 0) / Math.max(overview?.total_tasks || 1, 1) * 100).toFixed(1)}% completion rate` :
                    `${overview?.active_projects || 0} active`}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all group-hover:scale-110">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                {overview?.user_role === 'MEMBER' ? 'Pending' : 'Completed'}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {overview?.user_role === 'MEMBER' ? 'Pending Tasks' : 'Completed Tasks'}
            </h3>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                  {overview?.user_role === 'MEMBER' ? overview?.pending_tasks || 0 : overview?.completed_tasks || 0}
                </div>
                <div className="flex items-center text-xs font-medium text-purple-600 dark:text-purple-400">
                  <Target className="h-3 w-3 mr-1" />
                  {overview?.user_role === 'MEMBER' ? 
                    `${overview?.overdue_tasks || 0} overdue` :
                    `${((overview?.completed_tasks || 0) / Math.max(overview?.total_tasks || 1, 1) * 100).toFixed(1)}% completion rate`}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/5 dark:to-red-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-orange-500/50 transition-all group-hover:scale-110">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                {overview?.user_role === 'MEMBER' ? 'Overdue' : 'Pending'}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {overview?.user_role === 'MEMBER' ? 'Overdue Tasks' : 'Pending Tasks'}
            </h3>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent mb-2">
                  {overview?.user_role === 'MEMBER' ? overview?.overdue_tasks || 0 : overview?.pending_tasks || 0}
                </div>
                <div className="flex items-center text-xs font-medium text-orange-600 dark:text-orange-400">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {overview?.user_role === 'MEMBER' ? 
                    'Need attention' :
                    `${overview?.overdue_tasks || 0} overdue`}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comprehensive Access Scope Info - Modern Glass */}
      {overview?.scope_description && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500/10 via-gray-500/10 to-zinc-500/10 dark:from-slate-500/5 dark:via-gray-500/5 dark:to-zinc-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Your Access Scope</span>
                </div>
                <Badge variant="secondary" className="text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  {overview.scope_description.user_role}
                </Badge>
                {overview.team_info && (
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {overview.team_info.team_name} • {overview.team_info.department}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                {overview.scope_description.scope_description}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* People in Scope */}
              <div className="group text-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{overview.scope_description.viewable_user_count}</div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">People in Scope</div>
              </div>

              {/* Projects */}
              <div className="group text-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <FolderOpen className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">{overview.total_projects}</div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Projects</div>
              </div>

              {/* Tasks */}
              <div className="group text-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">{overview.total_tasks}</div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Tasks</div>
              </div>

              {/* Direct Reports */}
              {overview.scope_details && overview.scope_details.total_direct_reports > 0 && (
                <div className="group text-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">{overview.scope_details.total_direct_reports}</div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Direct Reports</div>
                </div>
              )}

              {/* Teams Leading */}
              {overview.scope_details && overview.scope_details.total_teams_leading > 0 && (
                <div className="group text-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">{overview.scope_details.total_teams_leading}</div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Teams Leading</div>
                </div>
              )}

              {/* Department Members */}
              {overview.scope_details?.department_info && (
                <div className="group text-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">{overview.scope_details.department_info.total_members}</div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Dept. Members</div>
                </div>
              )}

              {/* Total Subordinates */}
              {overview.scope_details && overview.scope_details.total_subordinates > 0 && (
                <div className="group text-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400 bg-clip-text text-transparent">{overview.scope_details.total_subordinates}</div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Total Subordinates</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Recent Projects - Modern Glass */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Projects</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track progress of ongoing projects</p>
              </div>
              <button 
                onClick={() => window.location.href = '/projects'}
                className="px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">View All</span>
              </button>
            </div>
            <div className="space-y-3">
              {isProjectsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading projects...</span>
                  </div>
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-full w-fit mx-auto mb-4">
                    <FolderOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No active projects</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Create your first project to get started</p>
                </div>
              ) : (
                recentProjects.map((project) => {
                  const progress = calculateProjectProgress(project);
                  return (
                    <div key={project.id} className="group p-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{project.name}</h4>
                        <Badge className={`${getStatusColor(project.status)} font-semibold px-3 py-1`}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span className="text-gray-700 dark:text-gray-300">Progress: {progress}%</span>
                          <span className="text-gray-600 dark:text-gray-400">{project.assigned_teams.length} team{project.assigned_teams.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="absolute h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 group-hover:shadow-lg"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <Calendar className="h-3.5 w-3.5" />
                            Due: {new Date(project.end_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <Users className="h-3.5 w-3.5" />
                            Manager: {project.manager.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities - Modern Glass */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
          <div className="relative p-4">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Latest team activities</p>
            </div>
            <div className="space-y-3">
              {isActivitiesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading activities...</span>
                  </div>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-full w-fit mx-auto mb-4">
                    <Activity className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No recent activities</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Activity will appear here as your team works</p>
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                  <div key={activity.id || index} className="group flex items-start space-x-3 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                    <div className="flex-shrink-0 mt-0.5 p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      {getActivityIcon(activity.description)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{activity.user.name}</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatTimeAgo(activity.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {!isActivitiesLoading && recentActivities.length > 0 && (
              <button 
                onClick={() => window.location.href = '/reports'}
                className="w-full mt-4 px-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 text-sm font-medium text-gray-900 dark:text-white"
              >
                View All Activities
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Task Summary - Modern Glass */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
          <div className="relative p-4">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Task Summary</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overview of task distribution</p>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-xl border border-blue-200/50 dark:border-blue-700/30 hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Total Tasks</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{overview?.total_tasks || 0}</span>
                </div>
                <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 rounded-xl border border-green-200/50 dark:border-green-700/30 hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Completed</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">{overview?.completed_tasks || 0}</span>
                </div>
                <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/5 dark:to-amber-500/5 rounded-xl border border-orange-200/50 dark:border-orange-700/30 hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Pending</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">{overview?.pending_tasks || 0}</span>
                </div>
                <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 dark:from-red-500/5 dark:to-rose-500/5 rounded-xl border border-red-200/50 dark:border-red-700/30 hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg group-hover:scale-110 transition-transform">
                      <AlertCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Overdue</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">{overview?.overdue_tasks || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines - Modern Glass */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-500/5 dark:to-rose-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
          <div className="relative p-4">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasks due soon</p>
            </div>
            <div className="space-y-3">
              {isDeadlinesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading deadlines...</span>
                  </div>
                </div>
              ) : upcomingDeadlines.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-red-500/20 to-rose-500/20 dark:from-red-500/10 dark:to-rose-500/10 rounded-full w-fit mx-auto mb-4">
                    <Bell className="h-12 w-12 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No upcoming deadlines</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">All tasks are on track</p>
                </div>
              ) : (
                upcomingDeadlines.map((task, index) => (
                  <div key={task.id || index} className="group relative p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border-l-4 border-l-blue-500 border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                      <Badge className={`${getPriorityColor(task.priority)} font-semibold px-2 py-0.5`}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">{task.project?.name || 'No project'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                        <Users className="h-3.5 w-3.5" />
                        {task.assignee.name}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {!isDeadlinesLoading && upcomingDeadlines.length > 0 && (
              <button 
                onClick={() => window.location.href = '/tasks'}
                className="w-full mt-4 px-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 text-sm font-medium text-gray-900 dark:text-white"
              >
                View All Tasks
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}