"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Calendar, User, CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
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
    percentage: undefined,
  });

  const handleDialogOpen = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Load existing logs when dialog opens
      await fetchExistingLogs();
      // Reset form data when opening
      setFormData({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        percentage: undefined,
      });
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
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.start_time || !formData.end_time) {
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
        end_time: formData.end_time,
        percentage: formData.percentage,
      };

      console.log("Sending log data:", logData);  // Debug log
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
      <DialogContent className="min-w-[80vw] min-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            Add Log Entry
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Create a log entry for task: <span className="font-medium text-gray-900">{taskTitle}</span>
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-6">
                {/* Log Details Section */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                    Log Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                        Log Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="e.g., Implemented user authentication"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="h-10 bg-white border-gray-200 hover:border-purple-300 transition-colors focus:border-purple-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what was accomplished, challenges faced, or notes about the work..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-white border-gray-200 hover:border-purple-300 transition-colors focus:border-purple-500 min-h-[100px]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Time Tracking Section */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full"></div>
                    Time Tracking
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time" className="text-sm font-medium text-gray-700">
                        Start Date & Time <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="start_time"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                        className="h-10 bg-white border-gray-200 hover:border-blue-300 transition-colors focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_time" className="text-sm font-medium text-gray-700">
                        End Date & Time <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="end_time"
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                        className="h-10 bg-white border-gray-200 hover:border-blue-300 transition-colors focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                    Work Progress
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="percentage" className="text-sm font-medium text-gray-700">
                      Percentage Completed (0-100%)
                    </Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={formData.percentage || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ 
                          ...prev, 
                          percentage: value === "" ? undefined : parseInt(value) || 0 
                        }));
                      }}
                      className="h-10 bg-white border-gray-200 hover:border-purple-300 transition-colors focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500">
                      Enter the percentage of work completed for this subtask (0-100)
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Previous Logs */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Previous Logs ({existingLogs.length})
                  </h3>
                  
                  <div>
                    {logsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    ) : existingLogs.length === 0 ? (
                      <div className="text-center py-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <Clock className="h-12 w-12 text-green-400 mx-auto mb-3" />
                        <p className="text-green-600 font-medium">No logs yet</p>
                        <p className="text-sm text-green-500">Create the first log entry for this task</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-3">
                          {existingLogs.map((log, index) => (
                            <div key={log.id} className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200 hover:border-green-200 transition-colors">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{log.title}</h4>
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  #{existingLogs.length - index}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{log.description}</p>
                              
                              <div className="space-y-1 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-blue-500" />
                                  <span>Started: {formatDateTime(log.start_time)}</span>
                                </div>
                                {log.end_time && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-green-500" />
                                    <span>Ended: {formatDateTime(log.end_time)}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-purple-500" />
                                  <span>Duration: {calculateDuration(log.start_time, log.end_time)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-6 h-10 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Log
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
