"use client";

import { Task, User } from "@/types";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-service";
import { toast } from "sonner";
import { useUser } from "@/components/user-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import {
  AlertTriangle,
  Clock,
  FileText,
  TrendingUp,
} from "lucide-react";

interface TaskMetrics {
  total: number;
  finished: number;
  overdue: number;
  upcoming: number;
}

interface TaskResponse {
  total: number;
  finished: number;
  overdue: number;
  upcoming: number;
  tasks: Task[];
}

export default function DashboardPage() {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<TaskMetrics>({
    total: 0,
    finished: 0,
    overdue: 0,
    upcoming: 0,
  });

  const fetchTasks = async () => {
    try {
      const data = await api.tasks.getAllTasks();
      // Handle both array and object responses
      if (Array.isArray(data)) {
        setTasks(data);
        setMetrics({
          total: data.length,
          finished: data.filter(task => task.status === 'completed').length,
          overdue: data.filter(task => task.status === 'overdue').length,
          upcoming: data.filter(task => task.status === 'pending').length,
        });
      } else {
        const responseData = data as any;
        setTasks(responseData.tasks || []);
        setMetrics({
          total: responseData.total || 0,
          finished: responseData.finished || 0,
          overdue: responseData.overdue || 0,
          upcoming: responseData.upcoming || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks", {
        description: api.utils.handleError(error),
      });
    }
  };

  useEffect(() => {
    // fetchTasks();
  }, []);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completionRate =
    metrics.total > 0
      ? Math.round((metrics.finished / metrics.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back, manage your tasks and projects efficiently"
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tasks
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.overdue}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.upcoming}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks to focus on
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completionRate}%
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.status === 'FINISHED' ? 'bg-green-100 text-green-800' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</div>
                      <div>Assigned: {task.assigned_to || 'Unassigned'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              No tasks yet — create some!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
