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
        gradient: "from-red-500/10 to-rose-500/10 dark:from-red-500/5 dark:to-rose-500/5",
        iconBg: "from-red-500 to-rose-600",
      },
      'CEO': {
        gradient: "from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5",
        iconBg: "from-purple-500 to-pink-600",
      },
      'MANAGER': {
        gradient: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5",
        iconBg: "from-blue-500 to-indigo-600",
      },
      'TEAM_LEAD': {
        gradient: "from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5",
        iconBg: "from-green-500 to-emerald-600",
      },
      'MEMBER': {
        gradient: "from-gray-500/10 to-slate-500/10 dark:from-gray-500/5 dark:to-slate-500/5",
        iconBg: "from-gray-500 to-slate-600",
      }
    };
    return colors[role as keyof typeof colors] || colors['MEMBER'];
  };

  const RoleIcon = getRoleIcon(userRole);
  const roleColors = getRoleColor(userRole);

  return (
    <div className="space-y-4">
      {/* Role Header - Glass Morphism */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${roleColors.gradient} backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative p-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-gradient-to-br ${roleColors.iconBg} rounded-xl shadow-lg`}>
              <RoleIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {userRole.charAt(0) + userRole.slice(1).toLowerCase()} Reports & Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{scopeDescription}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific Metrics - Glass Morphism */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative">
          <div className="p-4 border-b border-white/20 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-gray-900 dark:text-white" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Key Metrics for {userRole.charAt(0) + userRole.slice(1).toLowerCase()}
              </h3>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roleMetrics.map((metric, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/40 shadow-lg">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{metric}</span>
                </div>
              ))}
            </div>
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-500/5 dark:to-rose-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
      <div className="relative">
        <div className="p-4 border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-900 dark:text-white" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">System Administration Dashboard</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 dark:from-red-500/10 dark:to-rose-500/10 border border-red-200 dark:border-red-800 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-red-800 dark:text-red-300">Total Users</span>
              </div>
              <div className="text-3xl font-bold text-red-900 dark:text-red-200">
                {loading ? "..." : (data?.overview?.total_users || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-800 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-300">Active Users</span>
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-200">
                {loading ? "..." : (data?.overview?.active_users || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Total Projects</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                {loading ? "..." : (data?.overview?.total_projects || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-200 dark:border-purple-800 shadow-lg">
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
    </div>
  );
}

// CEO Reports Component
function CEOReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
      <div className="relative">
        <div className="p-4 border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gray-900 dark:text-white" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Executive Dashboard</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-200 dark:border-purple-800 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">Organization Performance</span>
              </div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-200">
                {loading ? "..." : "87%"}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Department Metrics</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                {loading ? "..." : (data?.overview?.total_projects || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-800 shadow-lg">
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
    </div>
  );
}

// Manager Reports Component
function ManagerReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
      <div className="relative">
        <div className="p-4 border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-900 dark:text-white" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Department Management Dashboard</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Department Members</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                {loading ? "..." : (data?.overview?.total_users || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-800 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-300">Team Productivity</span>
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-200">
                {loading ? "..." : "85%"}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-200 dark:border-purple-800 shadow-lg">
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
    </div>
  );
}

// Team Lead Reports Component
function TeamLeadReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
      <div className="relative">
        <div className="p-4 border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-gray-900 dark:text-white" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Team Leadership Dashboard</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-800 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-300">Team Members</span>
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-200">
                {loading ? "..." : (data?.overview?.total_users || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Team Performance</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                {loading ? "..." : "82%"}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-200 dark:border-purple-800 shadow-lg">
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
    </div>
  );
}

// Member Reports Component
function MemberReports({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-500/10 to-slate-500/10 dark:from-gray-500/5 dark:to-slate-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
      <div className="relative">
        <div className="p-4 border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-900 dark:text-white" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Performance Dashboard</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-500/20 to-slate-500/20 dark:from-gray-500/10 dark:to-slate-500/10 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-300">My Tasks</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-200">
                {loading ? "..." : (data?.overview?.total_tasks || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-800 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-300">Completed Tasks</span>
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-200">
                {loading ? "..." : (data?.overview?.completed_tasks || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-800 shadow-lg">
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
    </div>
  );
}
