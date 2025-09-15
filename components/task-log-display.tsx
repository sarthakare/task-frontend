"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, FileText, Timer, CircleAlert } from "lucide-react";
import { api } from "@/lib/api-service";
import { toast } from "sonner";
import type { TaskLog } from "@/types";

interface TaskLogDisplayProps {
  taskId: number;
  taskTitle: string;
  refreshTrigger?: number; // Can be used to force refresh
}

export function TaskLogDisplay({ taskId, taskTitle, refreshTrigger }: TaskLogDisplayProps) {
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const fetchedLogs = await api.tasks.getTaskLogs(taskId);
        setLogs(fetchedLogs);
      } catch (error) {
        console.error("Error fetching task logs:", error);
        toast.error("Failed to load task logs", {
          icon: <CircleAlert className="text-red-600" />,
          style: { color: "red" },
        });
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [taskId, refreshTrigger]);


  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return { duration: "Ongoing", className: "bg-yellow-100 text-yellow-800" };
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let duration = "";
    if (diffHours > 0) {
      duration = `${diffHours}h ${diffMinutes}m`;
    } else {
      duration = `${diffMinutes}m`;
    }
    
    return { 
      duration, 
      className: diffHours >= 4 ? "bg-green-100 text-green-800" : 
                 diffHours >= 2 ? "bg-blue-100 text-blue-800" : 
                 "bg-gray-100 text-gray-800" 
    };
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeOnly = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Task Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Task Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No logs found</p>
            <p className="text-sm text-gray-400 mt-1">
              No log entries have been created for this task yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Task Logs ({logs.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold w-12">#</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Title</TableHead>
                <TableHead className="font-semibold min-w-[150px]">Description</TableHead>
                <TableHead className="font-semibold min-w-[80px]">Date</TableHead>
                <TableHead className="font-semibold min-w-[80px]">Start Time</TableHead>
                <TableHead className="font-semibold min-w-[80px]">End Time</TableHead>
                <TableHead className="font-semibold min-w-[90px]">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => {
                const { duration, className } = calculateDuration(log.start_time, log.end_time);
                const logNumber = logs.length - index;
                
                return (
                  <TableRow key={log.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-center w-12">
                      <Badge variant="outline" className="text-xs">
                        #{logNumber}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium min-w-[120px]">
                      <div className="max-w-[120px]">
                        <p className="truncate text-sm" title={log.title}>
                          {log.title}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <div className="max-w-[150px]">
                        <p className="text-sm text-gray-600 line-clamp-2" title={log.description}>
                          {log.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {formatDateOnly(log.start_time)}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-green-600" />
                        {formatTimeOnly(log.start_time)}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      {log.end_time ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-red-600" />
                          {formatTimeOnly(log.end_time)}
                        </div>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          Ongoing
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[90px]">
                      <Badge className={`text-xs ${className}`}>
                        <Timer className="h-3 w-3 mr-1" />
                        {duration}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
