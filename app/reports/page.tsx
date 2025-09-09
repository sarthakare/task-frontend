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
  Filter,
  RefreshCw,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api-service";
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

interface AnalyticsData {
  overview: DashboardOverview | null;
  userStats: UserStats | null;
  projectStats: ProjectStats | null;
  teamStats: TeamStats | null;
  recentActivities: RecentActivity[];
  loading: {
    overview: boolean;
    userStats: boolean;
    projectStats: boolean;
    teamStats: boolean;
    activities: boolean;
  };
  error: string | null;
}

export default function ReportsPage() {
  const [data, setData] = useState<AnalyticsData>({
    overview: null,
    userStats: null,
    projectStats: null,
    teamStats: null,
    recentActivities: [],
    loading: {
      overview: true,
      userStats: true,
      projectStats: true,
      teamStats: true,
      activities: true,
    },
    error: null
  });

  const fetchAnalyticsData = async () => {
    // Reset all loading states
    setData(prev => ({ 
      ...prev, 
      loading: {
        overview: true,
        userStats: true,
        projectStats: true,
        teamStats: true,
        activities: true,
      },
      error: null 
    }));

    // Fetch data individually to allow independent loading states
    try {
      // Fetch overview data
      const overview = await api.dashboard.getOverview();
      setData(prev => ({ 
        ...prev, 
        overview, 
        loading: { ...prev.loading, overview: false }
      }));
    } catch (error) {
      setData(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, overview: false },
        error: `Overview: ${error instanceof Error ? error.message : 'Failed to fetch'}`
      }));
    }

    try {
      // Fetch user stats
      const userStats = await api.users.getUserStats();
      setData(prev => ({ 
        ...prev, 
        userStats, 
        loading: { ...prev.loading, userStats: false }
      }));
    } catch (error) {
      setData(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, userStats: false }
      }));
    }

    try {
      // Fetch project stats
      const projectStats = await api.projects.getProjectStats();
      setData(prev => ({ 
        ...prev, 
        projectStats, 
        loading: { ...prev.loading, projectStats: false }
      }));
    } catch (error) {
      setData(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, projectStats: false }
      }));
    }

    try {
      // Fetch team stats
      const teamStats = await api.teams.getTeamStats();
      setData(prev => ({ 
        ...prev, 
        teamStats, 
        loading: { ...prev.loading, teamStats: false }
      }));
    } catch (error) {
      setData(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, teamStats: false }
      }));
    }

    try {
      // Fetch activities
      const activities = await api.dashboard.getRecentActivities(10);
      setData(prev => ({ 
        ...prev, 
        recentActivities: activities, 
        loading: { ...prev.loading, activities: false }
      }));
    } catch (error) {
      setData(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, activities: false }
      }));
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

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter Data
        </Button>
        <Button variant="outline" onClick={fetchAnalyticsData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {data.loading.overview ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-900">{data.overview?.total_projects || 0}</div>
                <p className="text-xs text-blue-700">
                  {data.overview?.active_projects || 0} active projects
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {data.loading.overview ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-900">{calculateCompletionRate()}%</div>
                <p className="text-xs text-green-700">
                  {data.overview?.completed_tasks || 0} of {data.overview?.total_tasks || 0} tasks
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Avg. Task Duration</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {data.loading.overview ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-900">{calculateAvgTaskDuration()}</div>
                <p className="text-xs text-purple-700">days per task</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Team Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {data.loading.overview ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-900">{calculateTeamEfficiency()}%</div>
                <p className="text-xs text-orange-700">
                  {data.overview?.overdue_tasks || 0} overdue tasks
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts and Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {data.loading.overview ? (
              <div className="flex items-center justify-center h-48">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading task data...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completed Tasks</span>
                  <span className="text-sm text-gray-600">{data.overview?.completed_tasks || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${calculateCompletionRate()}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Tasks</span>
                  <span className="text-sm text-gray-600">{data.overview?.pending_tasks || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ 
                      width: `${data.overview?.total_tasks ? (data.overview.pending_tasks / data.overview.total_tasks) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overdue Tasks</span>
                  <span className="text-sm text-gray-600">{data.overview?.overdue_tasks || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ 
                      width: `${data.overview?.total_tasks ? (data.overview.overdue_tasks / data.overview.total_tasks) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Total Users</p>
                      {data.loading.userStats ? (
                        <div className="flex items-center space-x-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-xs text-blue-700">Loading...</span>
                        </div>
                      ) : (
                        <p className="text-xs text-blue-700">{data.userStats?.active_users || 0} active</p>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {data.loading.userStats ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        data.userStats?.total_users || 0
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-green-900">Active Projects</p>
                      {data.loading.overview ? (
                        <div className="flex items-center space-x-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-xs text-green-700">Loading...</span>
                        </div>
                      ) : (
                        <p className="text-xs text-green-700">Currently running</p>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {data.loading.overview ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        data.overview?.active_projects || 0
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-purple-900">Team Count</p>
                      {data.loading.teamStats ? (
                        <div className="flex items-center space-x-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-xs text-purple-700">Loading...</span>
                        </div>
                      ) : (
                        <p className="text-xs text-purple-700">{data.teamStats?.active_teams || 0} active teams</p>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {data.loading.teamStats ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        data.teamStats?.total_teams || 0
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* Performance Summary */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Current Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Task Completion</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                {data.loading.overview ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-900">
                      {calculateCompletionRate()}%
                    </div>
                    <p className="text-xs text-blue-700">
                      {data.overview?.completed_tasks || 0} / {data.overview?.total_tasks || 0} completed
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Active Projects</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                {data.loading.overview ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-900">
                      {data.overview?.active_projects || 0}
                    </div>
                    <p className="text-xs text-green-700">
                      of {data.projectStats?.total || data.overview?.total_projects || 0} total projects
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-900">Active Users</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                {data.loading.userStats ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-purple-900">
                      {data.userStats?.active_users || 0}
                    </div>
                    <p className="text-xs text-purple-700">
                      of {data.userStats?.total_users || 0} total users
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-900">Team Efficiency</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                {data.loading.overview ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-orange-900">
                      {calculateTeamEfficiency()}%
                    </div>
                    <p className="text-xs text-orange-700">
                      {data.overview?.overdue_tasks || 0} overdue tasks
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
