"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, CircleAlert, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import type { Task, TaskStatus } from "@/types";

interface TaskStatusUpdateProps {
  task: Task;
  trigger?: React.ReactNode;
  onStatusUpdated?: () => void;
}

export function TaskStatusUpdate({ task, trigger, onStatusUpdated }: TaskStatusUpdateProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(task.status as TaskStatus);

  const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
    { value: "NEW", label: "New", color: "bg-gray-100 text-gray-800" },
    { value: "IN_PROGRESS", label: "In Progress", color: "bg-blue-100 text-blue-800" },
    { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "FINISHED", label: "Finished", color: "bg-green-100 text-green-800" },
    { value: "STOPPED", label: "Stopped", color: "bg-red-100 text-red-800" },
    { value: "CANCELLED", label: "Cancelled", color: "bg-gray-100 text-gray-800" }
  ];

  const handleStatusUpdate = async () => {
    if (selectedStatus === task.status) {
      setIsDialogOpen(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await api.tasks.updateTaskStatus(task.id, selectedStatus);
      
      toast.success('Task status updated successfully!', {
        description: `Status changed to ${statusOptions.find(s => s.value === selectedStatus)?.label}`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });

      setIsDialogOpen(false);
      
      if (onStatusUpdated) {
        onStatusUpdated();
      }

    } catch (error) {
      console.error('Error updating task status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      
      toast.error('Failed to update task status', {
        description: errorMessage,
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <RefreshCw className="h-4 w-4 mr-1" />
      Update Status
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="min-w-[500px] overflow-hidden">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
            Update Task Status
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Change the current status of the task to reflect its progress.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <div className="space-y-6 py-4">
            {/* Task Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full"></div>
                Task Information
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Task Name</label>
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {task.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
                Status Update
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Current Status</label>
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-1 border border-gray-200">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                      statusOptions.find(s => s.value === task.status)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        task.status === 'NEW' ? 'bg-gray-400' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-400' :
                        task.status === 'PENDING' ? 'bg-yellow-400' :
                        task.status === 'FINISHED' ? 'bg-green-400' :
                        task.status === 'STOPPED' ? 'bg-red-400' :
                        'bg-gray-400'
                      }`} />
                      {statusOptions.find(s => s.value === task.status)?.label || task.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">New Status</label>
                  <Select value={selectedStatus} onValueChange={(value: TaskStatus) => setSelectedStatus(value)}>
                    <SelectTrigger className="h-10 bg-white border-gray-200 hover:border-orange-300 transition-colors focus:border-orange-500">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              status.value === 'NEW' ? 'bg-gray-400' :
                              status.value === 'IN_PROGRESS' ? 'bg-blue-400' :
                              status.value === 'PENDING' ? 'bg-yellow-400' :
                              status.value === 'FINISHED' ? 'bg-green-400' :
                              status.value === 'STOPPED' ? 'bg-red-400' :
                              'bg-gray-400'
                            }`} />
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status Change Preview */}
            {selectedStatus !== task.status && (
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                  Change Preview
                </h3>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-800">From:</span>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                        statusOptions.find(s => s.value === task.status)?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {statusOptions.find(s => s.value === task.status)?.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-blue-600">
                      <RefreshCw className="h-4 w-4" />
                      <span className="text-sm font-medium">to</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-800">To:</span>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                        statusOptions.find(s => s.value === selectedStatus)?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {statusOptions.find(s => s.value === selectedStatus)?.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
              className="px-6 h-10 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isSubmitting || selectedStatus === task.status}
              className="px-6 h-10 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Status
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
