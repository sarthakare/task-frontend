"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download,
  RefreshCw,
  Loader2,
  FileText,
  Users,
  Target,
  Clock,
  AlertCircle
} from "lucide-react";
import { analyticsService, AnalyticsData } from "@/lib/analytics-service";
import { 
  AnalyticsOverview, 
  MetricCard
} from "@/components/analytics-charts";
import { RoleBasedReports } from "@/components/role-based-reports";
import { useAuth } from "@/contexts/auth-context";
import type { DashboardOverview } from "@/types";

interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_department: Record<string, number>;
  users_by_role: Record<string, number>;
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
}

interface TeamStats {
  total_teams: number;
  active_teams: number;
  inactive_teams: number;
  department_counts: Record<string, number>;
}

interface RecentActivity {
  id: string | number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  action: string;
  description: string;
  created_at: string;
}


export default function ReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData>({
    overview: null,
    userStats: null,
    projectStats: null,
    teamStats: null,
    taskStatusData: [],
    userActivityData: [],
    projectProgressData: [],
    teamPerformanceData: [],
    recentActivities: [],
    loading: {
      overview: true,
      userStats: true,
      projectStats: true,
      teamStats: true,
      activities: true,
      charts: true,
    },
    error: null
  });

  const [dateRange, setDateRange] = useState<string>('last_30_days');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [exportLoading, setExportLoading] = useState<{
    pdf: boolean;
    excel: boolean;
  }>({
    pdf: false,
    excel: false
  });

  const userRole = user?.role?.toUpperCase() || 'MEMBER';

  const fetchAnalyticsData = async () => {
    try {
    setData(prev => ({ 
      ...prev, 
      loading: {
        overview: true,
        userStats: true,
        projectStats: true,
        teamStats: true,
        activities: true,
          charts: true,
      },
      error: null 
    }));

      const analyticsData = await analyticsService.fetchAllAnalyticsData();
      setData(analyticsData);
    } catch (error) {
      setData(prev => ({ 
        ...prev, 
        error: `Failed to fetch analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        loading: {
          overview: false,
          userStats: false,
          projectStats: false,
          teamStats: false,
          activities: false,
          charts: false,
        }
      }));
    }
  };

  const handleExportReport = async (format: 'pdf' | 'excel' = 'pdf') => {
    try {
      setExportLoading(prev => ({ ...prev, [format]: true }));
      const result = await analyticsService.exportAnalyticsReport(format);
      
      // Create download link
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = result.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExportLoading(prev => ({ ...prev, [format]: false }));
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const calculateCompletionRate = () => {
    if (!data.overview) return 0;
    const { total_tasks, completed_tasks } = data.overview;
    return total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;
  };

  const calculateAvgTaskDuration = () => {
    // This would need additional backend endpoint for actual calculation
    // For now, using a mock calculation
    return 3.2;
  };

  const calculateTeamEfficiency = () => {
    if (!data.overview) return 0;
    const { total_tasks, completed_tasks, overdue_tasks } = data.overview;
    if (total_tasks === 0) return 0;
    // Efficiency based on completion rate minus overdue penalty
    const completionRate = (completed_tasks / total_tasks) * 100;
    const overdueRate = (overdue_tasks / total_tasks) * 100;
    return Math.max(0, Math.round(completionRate - (overdueRate * 0.5)));
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports & Analytics" 
        description={`Role-based insights and performance metrics for ${userRole.charAt(0) + userRole.slice(1).toLowerCase()}`}
      />

      {/* Error Display */}
      {data.error && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-500/5 dark:to-rose-500/5 backdrop-blur-sm border border-red-200 dark:border-red-800 shadow-xl">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-red-900 dark:text-red-300">Error loading analytics data</p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{data.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Modern Glass */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500/10 to-gray-500/10 dark:from-slate-500/5 dark:to-gray-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Export Buttons */}
            <button 
              onClick={() => handleExportReport('pdf')}
              disabled={exportLoading.pdf || exportLoading.excel}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                {exportLoading.pdf ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <span>Export PDF</span>
            </button>
            
            <button 
              onClick={() => handleExportReport('excel')}
              disabled={exportLoading.pdf || exportLoading.excel}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-green-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                {exportLoading.excel ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <span>Export Excel</span>
            </button>
            
            {/* Filters */}
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white text-sm font-medium transition-all cursor-pointer"
            >
              <option value="last_7_days">Last 7 days</option>
              <option value="last_30_days">Last 30 days</option>
              <option value="last_90_days">Last 90 days</option>
              <option value="last_year">Last year</option>
            </select>
            
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white text-sm font-medium transition-all cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="hr">HR</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
              <option value="it">IT</option>
            </select>
            
            <button 
              onClick={fetchAnalyticsData}
              className="px-5 py-2.5 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 font-medium text-gray-900 dark:text-white cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role-based Reports */}
      <RoleBasedReports 
        userRole={userRole} 
        data={data} 
        loading={data.loading.overview} 
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Projects"
          value={data.loading.overview ? "..." : (data.overview?.total_projects || 0)}
          change={data.overview ? 12 : undefined}
          changeLabel="vs last month"
          icon={BarChart3}
          color="blue"
        />
        <MetricCard
          title="Task Completion Rate"
          value={data.loading.overview ? "..." : `${calculateCompletionRate()}%`}
          change={data.overview ? 8 : undefined}
          changeLabel="vs last month"
          icon={Target}
          color="green"
        />
        <MetricCard
          title="Active Users"
          value={data.loading.userStats ? "..." : (data.userStats?.active_users || 0)}
          change={data.userStats ? 5 : undefined}
          changeLabel="vs last month"
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Team Efficiency"
          value={data.loading.overview ? "..." : `${calculateTeamEfficiency()}%`}
          change={data.overview ? -2 : undefined}
          changeLabel="vs last month"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Avg. Task Duration"
          value={data.loading.overview ? "..." : `${calculateAvgTaskDuration()} days`}
          change={data.overview ? -1 : undefined}
          changeLabel="vs last month"
          icon={Clock}
          color="blue"
        />
        <MetricCard
          title="Overdue Tasks"
          value={data.loading.overview ? "..." : (data.overview?.overdue_tasks || 0)}
          change={data.overview ? -15 : undefined}
          changeLabel="vs last month"
          icon={AlertCircle}
          color="red"
        />
        <MetricCard
          title="Active Teams"
          value={data.loading.teamStats ? "..." : (data.teamStats?.active_teams || 0)}
          change={data.teamStats ? 0 : undefined}
          changeLabel="vs last month"
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Pending Tasks"
          value={data.loading.overview ? "..." : (data.overview?.pending_tasks || 0)}
          change={data.overview ? 3 : undefined}
          changeLabel="vs last month"
          icon={Calendar}
          color="purple"
        />
                </div>
                
      {/* Analytics Charts */}
      <AnalyticsOverview
        taskStatusData={data.taskStatusData}
        userActivityData={data.userActivityData}
        projectProgressData={data.projectProgressData}
        teamPerformanceData={data.teamPerformanceData}
        loading={data.loading.charts}
      />

      {/* Recent Activities Report - Modern Glass */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-white/20 dark:border-white/10">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent System Activities</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Latest task updates and system activities</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {data.loading.activities ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading activities...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentActivities.length > 0 ? (
                  data.recentActivities.map((activity, index) => (
                    <div key={activity.id || index} className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <UserAvatar name={activity.user?.name || 'Unknown User'} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {activity.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {activity.action || activity.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full w-fit mx-auto mb-4">
                      <Calendar className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No recent activities found</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Activities will appear here as tasks are updated</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
