"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle, 
  User, 
  Calendar,
  FileText,
  MoreVertical,
  Trash2,
  CheckCircle2,
  CircleAlert
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import { Reminder } from "@/types";

interface ReminderDisplayProps {
  reminder: Reminder;
  onReminderUpdated?: () => void;
  onReminderDeleted?: () => void;
}

export function ReminderDisplay({ reminder, onReminderUpdated, onReminderDeleted }: ReminderDisplayProps) {
  const [loading, setLoading] = useState(false);

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (isCompleted: boolean, dueDate: string) => {
    if (isCompleted) {
      return "bg-green-50 border-green-200";
    }
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now) {
      return "bg-red-50 border-red-200";
    }
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    if (due >= startOfToday && due <= today) {
      return "bg-blue-50 border-blue-200";
    }
    
    return "bg-white border-gray-200";
  };

  const getStatusLabel = (isCompleted: boolean, dueDate: string) => {
    if (isCompleted) {
      return { label: "Completed", color: "bg-green-100 text-green-800" };
    }
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now) {
      return { label: "Overdue", color: "bg-red-100 text-red-800" };
    }
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    if (due >= startOfToday && due <= today) {
      return { label: "Today", color: "bg-blue-100 text-blue-800" };
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    if (due <= tomorrow) {
      return { label: "Tomorrow", color: "bg-green-100 text-green-800" };
    }
    
    return { label: "Upcoming", color: "bg-gray-100 text-gray-800" };
  };

  const handleMarkCompleted = async () => {
    if (reminder.is_completed) return;
    
    setLoading(true);
    try {
      await api.reminders.markReminderCompleted(reminder.id);
      toast.success("Reminder marked as completed!", {
        description: "The reminder has been marked as completed.",
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });
      onReminderUpdated?.();
    } catch (error: unknown) {
      console.error("Error marking reminder completed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update reminder", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;
    
    setLoading(true);
    try {
      await api.reminders.deleteReminder(reminder.id);
      toast.success("Reminder deleted successfully!", {
        description: "The reminder has been permanently deleted.",
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });
      onReminderDeleted?.();
    } catch (error: unknown) {
      console.error("Error deleting reminder:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete reminder", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = getStatusLabel(reminder.is_completed, reminder.due_date);

  return (
    <Card className={`${getStatusColor(reminder.is_completed, reminder.due_date)} transition-all hover:shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900 flex-1 pr-4">
                {reminder.title}
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!reminder.is_completed && (
                    <DropdownMenuItem onClick={handleMarkCompleted} disabled={loading}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Completed
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleDelete} disabled={loading} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {reminder.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(reminder.priority)}>
                {reminder.priority}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Due: {formatDateTime(reminder.due_date)}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {reminder.user.name}
              </span>
              {reminder.task && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Task: {reminder.task.title}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created: {formatDateTime(reminder.created_at)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
