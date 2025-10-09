"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TaskStatusData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface UserActivityData {
  date: string;
  tasks_completed: number;
  tasks_created: number;
  users_active: number;
}

interface ProjectProgressData {
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

interface TeamPerformanceData {
  team: string;
  efficiency: number;
  tasks_completed: number;
  avg_duration: number;
}

interface AnalyticsChartsProps {
  taskStatusData: TaskStatusData[];
  userActivityData: UserActivityData[];
  projectProgressData: ProjectProgressData[];
  teamPerformanceData: TeamPerformanceData[];
  loading?: boolean;
}


export function TaskStatusChart({ data, loading }: { data: TaskStatusData[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: { name?: string; percent?: number }) => `${name || 'Unknown'} ${percent ? (percent * 100).toFixed(0) : 0}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function UserActivityChart({ data, loading }: { data: UserActivityData[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area 
          type="monotone" 
          dataKey="tasks_completed" 
          stackId="1" 
          stroke="#8884d8" 
          fill="#8884d8" 
          name="Tasks Completed"
        />
        <Area 
          type="monotone" 
          dataKey="tasks_created" 
          stackId="1" 
          stroke="#82ca9d" 
          fill="#82ca9d" 
          name="Tasks Created"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ProjectProgressChart({ data, loading }: { data: ProjectProgressData[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} />
        <YAxis dataKey="name" type="category" width={100} />
        <Tooltip 
          formatter={(value: number, _name: string) => [`${value}%`, 'Progress']}
          labelFormatter={(label: string) => `Project: ${label}`}
        />
        <Bar dataKey="percentage" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TeamPerformanceChart({ data, loading }: { data: TeamPerformanceData[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="team" />
        <YAxis />
        <Tooltip 
          formatter={(value: number, name: string) => {
            if (name === 'efficiency') return [`${value}%`, 'Efficiency'];
            if (name === 'tasks_completed') return [value, 'Tasks Completed'];
            if (name === 'avg_duration') return [`${value} days`, 'Avg Duration'];
            return [value, name];
          }}
        />
        <Bar dataKey="efficiency" fill="#8884d8" name="Efficiency %" />
        <Bar dataKey="tasks_completed" fill="#82ca9d" name="Tasks Completed" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendIndicator({ 
  current, 
  previous, 
  label, 
  icon: Icon = TrendingUp 
}: { 
  current: number; 
  previous: number; 
  label: string; 
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const change = current - previous;
  const changePercent = previous > 0 ? ((change / previous) * 100) : 0;
  const isPositive = change >= 0;
  
  return (
    <div className="flex items-center space-x-2">
      <Icon className={`h-4 w-4 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
      <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
      </span>
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  );
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  color = "blue" 
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  const colorClasses = {
    blue: {
      gradient: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5",
      iconBg: "from-blue-500 to-indigo-600",
      iconShadow: "group-hover:shadow-blue-500/50"
    },
    green: {
      gradient: "from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5",
      iconBg: "from-green-500 to-emerald-600",
      iconShadow: "group-hover:shadow-green-500/50"
    },
    purple: {
      gradient: "from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5",
      iconBg: "from-purple-500 to-pink-600",
      iconShadow: "group-hover:shadow-purple-500/50"
    },
    orange: {
      gradient: "from-orange-500/10 to-amber-500/10 dark:from-orange-500/5 dark:to-amber-500/5",
      iconBg: "from-orange-500 to-amber-600",
      iconShadow: "group-hover:shadow-orange-500/50"
    },
    red: {
      gradient: "from-red-500/10 to-rose-500/10 dark:from-red-500/5 dark:to-rose-500/5",
      iconBg: "from-red-500 to-rose-600",
      iconShadow: "group-hover:shadow-red-500/50"
    }
  };

  const colors = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.gradient} backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient.replace('/10', '/5').replace('/5', '/2')} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      <div className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 bg-gradient-to-br ${colors.iconBg} rounded-xl shadow-lg ${colors.iconShadow} transition-all group-hover:scale-110`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
        {change !== undefined && changeLabel && (
          <div className="flex items-center gap-1 mt-2">
            {change >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
            )}
            <span className={`text-xs font-medium ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function AnalyticsOverview({ 
  taskStatusData, 
  userActivityData, 
  projectProgressData, 
  teamPerformanceData, 
  loading = false 
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-4">
      {/* Task Status Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative">
          <div className="p-4 border-b border-white/20 dark:border-white/10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Task Status Distribution</h3>
          </div>
          <div className="p-4 bg-white/40 dark:bg-slate-900/40">
            <TaskStatusChart data={taskStatusData} loading={loading} />
          </div>
        </div>
      </div>

      {/* User Activity Trends */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative">
          <div className="p-4 border-b border-white/20 dark:border-white/10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Activity Trends</h3>
          </div>
          <div className="p-4 bg-white/40 dark:bg-slate-900/40">
            <UserActivityChart data={userActivityData} loading={loading} />
          </div>
        </div>
      </div>

      {/* Project Progress */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative">
          <div className="p-4 border-b border-white/20 dark:border-white/10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Progress Overview</h3>
          </div>
          <div className="p-4 bg-white/40 dark:bg-slate-900/40">
            <ProjectProgressChart data={projectProgressData} loading={loading} />
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 dark:from-orange-500/5 dark:to-amber-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative">
          <div className="p-4 border-b border-white/20 dark:border-white/10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Team Performance Metrics</h3>
          </div>
          <div className="p-4 bg-white/40 dark:bg-slate-900/40">
            <TeamPerformanceChart data={teamPerformanceData} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
