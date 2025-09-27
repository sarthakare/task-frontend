"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
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
        description="Comprehensive insights and performance metrics"
      />

      {/* Error Display */}
      {data.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error loading analytics data</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{data.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <Button 
            onClick={() => handleExportReport('pdf')}
            disabled={exportLoading.pdf || exportLoading.excel}
          >
            {exportLoading.pdf ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleExportReport('excel')}
            disabled={exportLoading.pdf || exportLoading.excel}
          >
            {exportLoading.excel ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Export Excel
          </Button>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="last_7_days">Last 7 days</option>
            <option value="last_30_days">Last 30 days</option>
            <option value="last_90_days">Last 90 days</option>
            <option value="last_year">Last year</option>
          </select>
          
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
        </div>
        
        <Button variant="outline" onClick={fetchAnalyticsData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

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

      {/* Recent Activities Report */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activities</CardTitle>
          <p className="text-sm text-gray-600">Latest task updates and system activities</p>
        </CardHeader>
        <CardContent>
          {data.loading.activities ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading activities...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentActivities.length > 0 ? (
                data.recentActivities.map((activity, index) => (
                  <div key={activity.id || index} className="p-4 border rounded-lg bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {activity.user?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.action || activity.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No recent activities found</p>
                  <p className="text-sm">Activities will appear here as tasks are updated</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
