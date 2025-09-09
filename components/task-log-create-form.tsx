"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Calendar, FileText, User, CheckCircle2, CircleAlert } from "lucide-react";
import { api } from "@/lib/api-service";
import { toast } from "sonner";
import type { TaskLog, TaskLogCreate } from "@/types";

interface TaskLogCreateFormProps {
  taskId: number;
  taskTitle: string;
  onLogCreated?: () => void;
  trigger?: React.ReactNode;
}

export function TaskLogCreateForm({ taskId, taskTitle, onLogCreated, trigger }: TaskLogCreateFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingLogs, setExistingLogs] = useState<TaskLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  
  const [formData, setFormData] = useState<TaskLogCreate>({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
  });

  const handleDialogOpen = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Load existing logs when dialog opens
      await fetchExistingLogs();
      // Set default start time to current time
      const now = new Date();
      const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setFormData(prev => ({
        ...prev,
        start_time: localISOTime,
      }));
    }
  };

  const fetchExistingLogs = async () => {
    setLogsLoading(true);
    try {
      const logs = await api.tasks.getTaskLogs(taskId);
      setExistingLogs(logs);
    } catch (error) {
      console.error("Error fetching task logs:", error);
      toast.error("Failed to load existing logs", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.start_time) {
      toast.error("Please fill in all required fields", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
      return;
    }

    // Validate end time is after start time if provided
    if (formData.end_time && formData.end_time <= formData.start_time) {
      toast.error("End time must be after start time", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
      return;
    }

    setIsLoading(true);
    try {
      const logData: TaskLogCreate = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        start_time: formData.start_time,
        end_time: formData.end_time || undefined,
      };

      await api.tasks.createTaskLog(taskId, logData);
      
      toast.success("Task log created successfully", {
        description: "The log entry has been added to the task.",
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
      });

      // Refresh logs list
      await fetchExistingLogs();
      
      // Call callback
      onLogCreated?.();
      
    } catch (error) {
      console.error("Error creating task log:", error);
      toast.error("Failed to create task log", {
        description: "Please try again.",
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return "Ongoing";
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Plus className="h-4 w-4 mr-1" />
      Add Log
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90vw] max-h-[85vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Add Log Entry
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Create a log entry for task: <span className="font-medium">{taskTitle}</span>
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(85vh-160px)] pr-2">
          {/* Left Column - Form */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Log Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Log Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g., Implemented user authentication"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what was accomplished, challenges faced, or notes about the work..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">
                        Start Date & Time <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="start_time"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_time">
                        End Date & Time <span className="text-gray-500">(Optional)</span>
                      </Label>
                      <Input
                        id="end_time"
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="min-w-[100px]"
                    >
                      {isLoading ? "Creating..." : "Create Log"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Previous Logs */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Previous Logs ({existingLogs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : existingLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No logs yet</p>
                    <p className="text-sm text-gray-400">Create the first log entry for this task</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {existingLogs.map((log, index) => (
                        <div key={log.id} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">{log.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              #{existingLogs.length - index}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{log.description}</p>
                          
                          <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Started: {formatDateTime(log.start_time)}</span>
                            </div>
                            {log.end_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Ended: {formatDateTime(log.end_time)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>Duration: {calculateDuration(log.start_time, log.end_time)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
