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
        return "bg-gradient-to-r from-red-500 to-rose-500 text-white";
      case "HIGH":
        return "bg-gradient-to-r from-orange-500 to-amber-500 text-white";
      case "MEDIUM":
        return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white";
      case "LOW":
        return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const getStatusLabel = (isCompleted: boolean, dueDate: string) => {
    if (isCompleted) {
      return { label: "Completed", color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white" };
    }
    
    // Get current IST date
    const now = new Date();
    const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const today = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
    const due = new Date(dueDate);
    const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    if (dueDateOnly < today) {
      return { label: "Overdue", color: "bg-gradient-to-r from-red-500 to-rose-500 text-white" };
    }
    
    if (dueDateOnly.getTime() === today.getTime()) {
      return { label: "Today", color: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" };
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDateOnly.getTime() === tomorrow.getTime()) {
      return { label: "Tomorrow", color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white" };
    }
    
    return { label: "Upcoming", color: "bg-gradient-to-r from-gray-500 to-gray-600 text-white" };
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
    <div className="group relative overflow-hidden rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
      {reminder.is_completed && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-50"></div>
      )}
      {!reminder.is_completed && new Date(reminder.due_date) < new Date() && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-50"></div>
      )}
      <div className="relative p-4">
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
