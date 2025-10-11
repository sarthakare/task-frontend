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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
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
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {overview?.user_role === 'MEMBER' ? overview?.total_tasks || 0 :
                 overview?.user_role === 'TEAM_LEAD' ? overview?.team_info?.member_count || 0 :
                 overview?.user_role === 'MANAGER' ? overview?.direct_subordinates_count || 0 :
                 overview?.total_users || 0}
              </div>
              <div className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                {overview?.user_role === 'MEMBER' ? `${overview?.completed_tasks || 0} completed` :
                 overview?.user_role === 'TEAM_LEAD' ? `${overview?.active_users || 0} active` :
                 overview?.user_role === 'MANAGER' ? `${overview?.active_users || 0} active` :
                 `${overview?.active_users || 0} active`}
              </div>
            </>
          )}
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <FolderOpen className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
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
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {overview?.user_role === 'MEMBER' ? overview?.completed_tasks || 0 : overview?.total_projects || 0}
              </div>
              <div className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                {overview?.user_role === 'MEMBER' ? 
                  `${((overview?.completed_tasks || 0) / Math.max(overview?.total_tasks || 1, 1) * 100).toFixed(1)}% completion rate` :
                  `${overview?.active_projects || 0} active`}
              </div>
            </>
          )}
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
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
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {overview?.user_role === 'MEMBER' ? overview?.pending_tasks || 0 : overview?.completed_tasks || 0}
              </div>
              <div className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">
                <Target className="h-3 w-3 mr-1" />
                {overview?.user_role === 'MEMBER' ? 
                  `${overview?.overdue_tasks || 0} overdue` :
                  `${((overview?.completed_tasks || 0) / Math.max(overview?.total_tasks || 1, 1) * 100).toFixed(1)}% completion rate`}
              </div>
            </>
          )}
        </div>

        {/* Metric Card 4 */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
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
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {overview?.user_role === 'MEMBER' ? overview?.overdue_tasks || 0 : overview?.pending_tasks || 0}
              </div>
              <div className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">
                <AlertCircle className="h-3 w-3 mr-1" />
                {overview?.user_role === 'MEMBER' ? 
                  'Need attention' :
                  `${overview?.overdue_tasks || 0} overdue`}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Access Scope Info */}
      {overview?.scope_description && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Your Access Scope</span>
              <Badge variant="secondary" className="text-xs font-medium">
                {overview.scope_description.user_role}
              </Badge>
              {overview.team_info && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {overview.team_info.team_name} • {overview.team_info.department}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {overview.scope_description.scope_description}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* People in Scope */}
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded w-fit mx-auto mb-2">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{overview.scope_description.viewable_user_count}</div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">People in Scope</div>
            </div>

            {/* Projects */}
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded w-fit mx-auto mb-2">
                <FolderOpen className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{overview.total_projects}</div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Projects</div>
            </div>

            {/* Tasks */}
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded w-fit mx-auto mb-2">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{overview.total_tasks}</div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Tasks</div>
            </div>

            {/* Direct Reports */}
            {overview.scope_details && overview.scope_details.total_direct_reports > 0 && (
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded w-fit mx-auto mb-2">
                  <Users className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{overview.scope_details.total_direct_reports}</div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Direct Reports</div>
              </div>
            )}

            {/* Teams Leading */}
            {overview.scope_details && overview.scope_details.total_teams_leading > 0 && (
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded w-fit mx-auto mb-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{overview.scope_details.total_teams_leading}</div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Teams Leading</div>
              </div>
            )}

            {/* Department Members */}
            {overview.scope_details?.department_info && (
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded w-fit mx-auto mb-2">
                  <Users className="h-4 w-4 text-teal-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{overview.scope_details.department_info.total_members}</div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Dept. Members</div>
              </div>
            )}

            {/* Total Subordinates */}
            {overview.scope_details && overview.scope_details.total_subordinates > 0 && (
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded w-fit mx-auto mb-2">
                  <Users className="h-4 w-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{overview.scope_details.total_subordinates}</div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Total Subordinates</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Projects</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overview of active projects</p>
            </div>
            <button 
              onClick={() => window.location.href = '/projects'}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4 text-blue-500" />
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
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4">
                  <FolderOpen className="h-12 w-12 text-blue-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No active projects</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Create your first project to get started</p>
              </div>
            ) : (
              recentProjects.map((project) => {
                return (
                  <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{project.name}</h4>
                      <Badge className={`${getStatusColor(project.status)} font-medium px-2 py-1`}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{project.description}</p>
                      <div className="flex items-center justify-between text-sm pt-2">
                        <span className="text-gray-600 dark:text-gray-400">{project.assigned_teams.length} team{project.assigned_teams.length !== 1 ? 's' : ''}</span>
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Users className="h-3.5 w-3.5" />
                          {project.manager.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200 dark:border-gray-700">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          Started: {new Date(project.start_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          Due: {new Date(project.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
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
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full w-fit mx-auto mb-4">
                  <Activity className="h-12 w-12 text-green-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No recent activities</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Activity will appear here as your team works</p>
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={activity.id || index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0 mt-0.5 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {getActivityIcon(activity.description)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{activity.user.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatTimeAgo(activity.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {!isActivitiesLoading && recentActivities.length > 0 && (
            <button 
              onClick={() => window.location.href = '/reports'}
              className="w-full mt-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-sm font-medium text-gray-900 dark:text-white"
            >
              View All Activities
            </button>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Task Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Task Summary</h3>
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
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Total Tasks</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{overview?.total_tasks || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Completed</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{overview?.completed_tasks || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Pending</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{overview?.pending_tasks || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Overdue</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{overview?.overdue_tasks || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Bell className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
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
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-4">
                  <Bell className="h-12 w-12 text-red-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No upcoming deadlines</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">All tasks are on track</p>
              </div>
            ) : (
              upcomingDeadlines.map((task, index) => (
                <div key={task.id || index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-l-blue-500 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                    <Badge className={`${getPriorityColor(task.priority)} font-medium px-2 py-0.5`}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{task.project?.name || 'No project'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
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
              className="w-full mt-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-sm font-medium text-gray-900 dark:text-white"
            >
              View All Tasks
            </button>
          )}
        </div>
      </div>

    </div>
  );
}