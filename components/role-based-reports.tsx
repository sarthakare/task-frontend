"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Building2, 
  Target, 
  TrendingUp, 
  BarChart3,
  Shield,
  Crown,
  UserCheck,
  Users2,
  User
} from "lucide-react";
import { analyticsService, type AnalyticsData } from "@/lib/analytics-service";

interface RoleBasedReportsProps {
  userRole: string;
  data: AnalyticsData | null;
  loading: boolean;
}

export function RoleBasedReports({ userRole, data, loading }: RoleBasedReportsProps) {
  const scopeDescription = analyticsService.getRoleScopeDescription(userRole);
  const roleMetrics = analyticsService.getRoleSpecificMetrics(userRole);

  const getRoleIcon = (role: string) => {
    const icons = {
      'ADMIN': Shield,
      'CEO': Crown,
      'MANAGER': Building2,
      'TEAM_LEAD': Users2,
      'MEMBER': User
    };
    return icons[role as keyof typeof icons] || User;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'ADMIN': 'bg-red-100 text-red-800 border-red-200',
      'CEO': 'bg-purple-100 text-purple-800 border-purple-200',
      'MANAGER': 'bg-blue-100 text-blue-800 border-blue-200',
      'TEAM_LEAD': 'bg-green-100 text-green-800 border-green-200',
      'MEMBER': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const RoleIcon = getRoleIcon(userRole);

  return (
    <div className="space-y-6">
      {/* Role Header */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getRoleColor(userRole)}`}>
              <RoleIcon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {userRole.charAt(0) + userRole.slice(1).toLowerCase()} Reports & Analytics
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{scopeDescription}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Role-specific Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Key Metrics for {userRole.charAt(0) + userRole.slice(1).toLowerCase()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleMetrics.map((metric, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{metric}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role-specific Content */}
      {userRole === 'ADMIN' && <AdminReports data={data} loading={loading} />}
      {userRole === 'CEO' && <CEOReports data={data} loading={loading} />}
      {userRole === 'MANAGER' && <ManagerReports data={data} loading={loading} />}
      {userRole === 'TEAM_LEAD' && <TeamLeadReports data={data} loading={loading} />}
      {userRole === 'MEMBER' && <MemberReports data={data} loading={loading} />}
    </div>
  );
}

// Admin Reports Component
function AdminReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>System Administration Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Total Users</span>
              </div>
              <div className="text-2xl font-bold text-red-900 mt-2">
                {loading ? "..." : (data?.overview?.total_users || 0)}
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Active Users</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-2">
                {loading ? "..." : (data?.overview?.active_users || 0)}
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Projects</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-2">
                {loading ? "..." : (data?.overview?.total_projects || 0)}
              </div>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">System Health</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 mt-2">
                {loading ? "..." : "98%"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// CEO Reports Component
function CEOReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5" />
            <span>Executive Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Organization Performance</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 mt-2">
                {loading ? "..." : "87%"}
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Department Metrics</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-2">
                {loading ? "..." : (data?.overview?.total_projects || 0)}
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Strategic KPIs</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-2">
                {loading ? "..." : "92%"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Manager Reports Component
function ManagerReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Department Management Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Department Members</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-2">
                {loading ? "..." : (data?.overview?.total_users || 0)}
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Team Productivity</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-2">
                {loading ? "..." : "85%"}
              </div>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Department KPIs</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 mt-2">
                {loading ? "..." : "78%"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Team Lead Reports Component
function TeamLeadReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users2 className="h-5 w-5" />
            <span>Team Leadership Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Team Members</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-2">
                {loading ? "..." : (data?.overview?.total_users || 0)}
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Team Performance</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-2">
                {loading ? "..." : "82%"}
              </div>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Team Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 mt-2">
                {loading ? "..." : "88%"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Member Reports Component
function MemberReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Personal Performance Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">My Tasks</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {loading ? "..." : (data?.overview?.total_tasks || 0)}
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Completed Tasks</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-2">
                {loading ? "..." : (data?.overview?.completed_tasks || 0)}
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Productivity</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-2">
                {loading ? "..." : "92%"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
