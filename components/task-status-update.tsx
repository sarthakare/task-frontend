"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, CircleAlert, Edit3 } from "lucide-react";
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
      <Edit3 className="h-4 w-4 mr-1" />
      Update Status
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Update Task Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Task</label>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
              {task.title}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Current Status</label>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                statusOptions.find(s => s.value === task.status)?.color || 'bg-gray-100 text-gray-800'
              }`}>
                {statusOptions.find(s => s.value === task.status)?.label || task.status}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">New Status</label>
            <Select value={selectedStatus} onValueChange={(value: TaskStatus) => setSelectedStatus(value)}>
              <SelectTrigger>
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

          {selectedStatus !== task.status && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Status will be changed from <strong>{statusOptions.find(s => s.value === task.status)?.label}</strong> to <strong>{statusOptions.find(s => s.value === selectedStatus)?.label}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            disabled={isSubmitting || selectedStatus === task.status}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
