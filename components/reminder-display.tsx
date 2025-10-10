"use client";

import { useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
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
    // Convert to IST (Indian Standard Time) and show date only
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800";
      case "HIGH":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800";
      case "LOW":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusLabel = (isCompleted: boolean, dueDate: string) => {
    if (isCompleted) {
      return { label: "Completed", color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800" };
    }
    
    // Get current IST date
    const now = new Date();
    const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const today = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
    const due = new Date(dueDate);
    const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    if (dueDateOnly < today) {
      return { label: "Overdue", color: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800" };
    }
    
    if (dueDateOnly.getTime() === today.getTime()) {
      return { label: "Today", color: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" };
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDateOnly.getTime() === tomorrow.getTime()) {
      return { label: "Tomorrow", color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800" };
    }
    
    return { label: "Upcoming", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700" };
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
    <div className={`bg-white dark:bg-gray-900 rounded-lg border transition-colors ${reminder.is_completed ? 'border-green-300 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10' : !reminder.is_completed && new Date(reminder.due_date) < new Date() ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 pr-4">
              {reminder.title}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {reminder.description}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center justify-center cursor-pointer">
                <MoreVertical className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!reminder.is_completed && (
                <DropdownMenuItem onClick={handleMarkCompleted} disabled={loading} className="cursor-pointer">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Completed
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} disabled={loading} className="text-red-600 cursor-pointer">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${getPriorityColor(reminder.priority)}`}>
            {reminder.priority}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-500" />
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              Due: <span className="font-semibold text-gray-900 dark:text-white">{formatDateTime(reminder.due_date)}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-lg">
              <User className="h-4 w-4 text-purple-600 dark:text-purple-500" />
            </div>
            <div className="flex items-center gap-2">
              <UserAvatar name={reminder.user.name} size="sm" />
              <span className="font-semibold text-gray-900 dark:text-white">{reminder.user.name}</span>
            </div>
          </div>
          
          {reminder.task && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-lg">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-500" />
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                Task: <span className="font-semibold text-gray-900 dark:text-white">{reminder.task.title}</span>
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10 rounded-lg">
              <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              Created: <span className="font-semibold text-gray-900 dark:text-white">{formatDateTime(reminder.created_at)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
