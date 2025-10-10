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
          formatter={(value: number) => [`${value}%`, 'Progress']}
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
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-500"
    },
    green: {
      iconBg: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-500"
    },
    purple: {
      iconBg: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-500"
    },
    orange: {
      iconBg: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-500"
    },
    red: {
      iconBg: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-500"
    }
  };

  const colors = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 ${colors.iconBg} rounded-lg`}>
          <Icon className={`h-5 w-5 ${colors.iconColor}`} />
        </div>
      </div>
      <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
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
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Status Distribution</h3>
        </div>
        <div className="p-4">
          <TaskStatusChart data={taskStatusData} loading={loading} />
        </div>
      </div>

      {/* User Activity Trends */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Activity Trends</h3>
        </div>
        <div className="p-4">
          <UserActivityChart data={userActivityData} loading={loading} />
        </div>
      </div>

      {/* Project Progress */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Progress Overview</h3>
        </div>
        <div className="p-4">
          <ProjectProgressChart data={projectProgressData} loading={loading} />
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Performance Metrics</h3>
        </div>
        <div className="p-4">
          <TeamPerformanceChart data={teamPerformanceData} loading={loading} />
        </div>
      </div>
    </div>
  );
}
