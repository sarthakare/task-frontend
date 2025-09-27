"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Icon className={`h-4 w-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
      <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
      </span>
      <span className="text-sm text-gray-600">{label}</span>
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
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-900",
    green: "from-green-50 to-green-100 border-green-200 text-green-900",
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-900",
    orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-900",
    red: "from-red-50 to-red-100 border-red-200 text-red-900"
  };

  return (
    <Card className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && changeLabel && (
          <div className="flex items-center space-x-1 mt-1">
            {change >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-600">{changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
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
    <div className="space-y-6">
      {/* Task Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskStatusChart data={taskStatusData} loading={loading} />
        </CardContent>
      </Card>

      {/* User Activity Trends */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <UserActivityChart data={userActivityData} loading={loading} />
        </CardContent>
      </Card>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectProgressChart data={projectProgressData} loading={loading} />
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamPerformanceChart data={teamPerformanceData} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
