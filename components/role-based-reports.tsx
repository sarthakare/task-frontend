"use client";

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
      'ADMIN': {
        iconBg: "bg-red-50 dark:bg-red-900/20",
        iconColor: "text-red-500",
      },
      'CEO': {
        iconBg: "bg-purple-50 dark:bg-purple-900/20",
        iconColor: "text-purple-500",
      },
      'MANAGER': {
        iconBg: "bg-blue-50 dark:bg-blue-900/20",
        iconColor: "text-blue-500",
      },
      'TEAM_LEAD': {
        iconBg: "bg-green-50 dark:bg-green-900/20",
        iconColor: "text-green-500",
      },
      'MEMBER': {
        iconBg: "bg-gray-50 dark:bg-gray-800",
        iconColor: "text-gray-500",
      }
    };
    return colors[role as keyof typeof colors] || colors['MEMBER'];
  };

  const RoleIcon = getRoleIcon(userRole);
  const roleColors = getRoleColor(userRole);

  return (
    <div className="space-y-4">
      {/* Role Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 ${roleColors.iconBg} rounded-lg`}>
            <RoleIcon className={`h-6 w-6 ${roleColors.iconColor}`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {userRole.charAt(0) + userRole.slice(1).toLowerCase()} Reports & Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{scopeDescription}</p>
          </div>
        </div>
      </div>

      {/* Role-specific Metrics */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-gray-900 dark:text-white" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Key Metrics for {userRole.charAt(0) + userRole.slice(1).toLowerCase()}
            </h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roleMetrics.map((metric, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{metric}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-900 dark:text-white" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Administration Dashboard</h3>
        </div>
      </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-red-800 dark:text-red-300">Total Users</span>
              </div>
              <div className="text-3xl font-bold text-red-900 dark:text-red-200">
                {loading ? "..." : (data?.overview?.total_users || 0)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-300">Active Users</span>
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-200">
                {loading ? "..." : (data?.overview?.active_users || 0)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Total Projects</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                {loading ? "..." : (data?.overview?.total_projects || 0)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">System Health</span>
              </div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-200">
                {loading ? "..." : "98%"}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

// CEO Reports Component
function CEOReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gray-900 dark:text-white" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Executive Dashboard</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">Organization Performance</span>
              </div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-200">
                {loading ? "..." : "87%"}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Department Metrics</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                {loading ? "..." : (data?.overview?.total_projects || 0)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-300">Strategic KPIs</span>
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-200">
                {loading ? "..." : "92%"}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

// Manager Reports Component
function ManagerReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-900 dark:text-white" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Department Management Dashboard</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Department Members</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                {loading ? "..." : (data?.overview?.total_users || 0)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-300">Team Productivity</span>
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-200">
                {loading ? "..." : "85%"}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">Department KPIs</span>
              </div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-200">
                {loading ? "..." : "78%"}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

// Team Lead Reports Component
function TeamLeadReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-gray-900 dark:text-white" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Leadership Dashboard</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Users2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-300">Team Members</span>
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-200">
                {loading ? "..." : (data?.overview?.total_users || 0)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Team Performance</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                {loading ? "..." : "82%"}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">Team Efficiency</span>
              </div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-200">
                {loading ? "..." : "88%"}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

// Member Reports Component
function MemberReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-900 dark:text-white" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Performance Dashboard</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-300">My Tasks</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-200">
                {loading ? "..." : (data?.overview?.total_tasks || 0)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-300">Completed Tasks</span>
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-200">
                {loading ? "..." : (data?.overview?.completed_tasks || 0)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Productivity</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                {loading ? "..." : "92%"}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
