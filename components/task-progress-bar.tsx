"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api-service";
import type { TaskLog } from "@/types";

interface TaskProgressBarProps {
  taskId: number;
  taskTitle: string;
  refreshTrigger?: number;
}

export function TaskProgressBar({ taskId, taskTitle, refreshTrigger }: TaskProgressBarProps) {
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const fetchedLogs = await api.tasks.getTaskLogs(taskId);
        setLogs(fetchedLogs);
        
        // Calculate overall progress - sum of all subtask percentages (capped at 100%)
        const totalProgress = fetchedLogs.reduce((sum, log) => {
          return sum + (log.percentage || 0);
        }, 0);
        
        // Total progress is the sum of all subtask percentages, capped at 100%
        const overallProgress = Math.min(100, totalProgress);
        
        setOverallProgress(Math.round(overallProgress));
      } catch (error) {
        console.error("Error fetching task logs for progress:", error);
        setLogs([]);
        setOverallProgress(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [taskId, refreshTrigger]);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    if (progress >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 100) return { label: "Complete", color: "bg-green-100 text-green-800" };
    if (progress >= 76) return { label: "Almost Done", color: "bg-blue-100 text-blue-800" };
    if (progress >= 1) return { label: "In Progress", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Not Started", color: "bg-red-100 text-red-800" };
  };

  const status = getProgressStatus(overallProgress);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Task Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          Task Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{overallProgress}%</span>
              <Badge className={`text-xs ${status.color}`}>
                {status.label}
              </Badge>
            </div>
          </div>
          
          <div className="relative">
            <Progress 
              value={overallProgress} 
              className="h-3"
            />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor(overallProgress)}`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Progress Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Logs: {logs.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">
              Total: {logs.length > 0 ? Math.round(logs.reduce((sum, log) => sum + (log.percentage || 0), 0)) : 0}%
            </span>
          </div>
        </div>

        {/* Progress Breakdown */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Recent Progress</h4>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {logs.slice(0, 3).map((log, index) => (
                <div key={log.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate flex-1 mr-2" title={log.title}>
                    {log.title}
                  </span>
                  {log.percentage !== null && log.percentage !== undefined && (
                    <Badge variant="outline" className="text-xs bg-gray-50">
                      {log.percentage}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
