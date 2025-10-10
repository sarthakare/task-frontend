"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { ReminderCreateForm } from "@/components/reminder-create-form";
import { ReminderDisplay } from "@/components/reminder-display";
import { 
  Bell, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Search,
  RefreshCw,
  Loader2,
  CircleAlert
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import { Reminder } from "@/types";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total_reminders: 0,
    active_reminders: 0,
    completed_reminders: 0,
    overdue_reminders: 0,
    today_reminders: 0
  });

  const fetchReminders = async () => {
    try {
      const [remindersResponse, statsResponse] = await Promise.all([
        api.reminders.getAllReminders(),
        api.reminders.getReminderStats()
      ]);
      setReminders(remindersResponse);
      setStats(statsResponse);
    } catch (error: unknown) {
      console.error("Error fetching reminders:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load reminders",{
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReminders();
  };

  const handleReminderCreated = () => {
    fetchReminders();
  };

  const handleReminderUpdated = () => {
    fetchReminders();
  };

  const handleReminderDeleted = () => {
    fetchReminders();
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Filter reminders based on search term
  const filteredReminders = reminders.filter((reminder) =>
    reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reminder.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reminder.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (reminder.task && reminder.task.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort reminders: overdue first, then by due date
  const sortedReminders = filteredReminders.sort((a, b) => {
    const now = new Date();
    const aOverdue = new Date(a.due_date) < now && !a.is_completed;
    const bOverdue = new Date(b.due_date) < now && !b.is_completed;
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Reminders & Escalation" 
        description="Stay on top of important deadlines and escalations"
        action={<ReminderCreateForm onReminderCreated={handleReminderCreated} />}
      />

      {/* Search and Refresh */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reminders..."
                className="pl-10 pr-3 py-2 w-full text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 h-9 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex items-center gap-2 font-medium text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Reminder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active Reminders */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Bell className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Active Reminders</h3>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active_reminders}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Currently active</p>
            </>
          )}
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Overdue</h3>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-red-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.overdue_reminders}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Requires attention</p>
            </>
          )}
        </div>

        {/* Today */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Today</h3>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-green-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.today_reminders}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Due today</p>
            </>
          )}
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Completed</h3>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed_reminders}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Total completed</p>
            </>
          )}
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <Bell className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">All Reminders</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredReminders.length} {filteredReminders.length === 1 ? 'reminder' : 'reminders'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading reminders...</span>
              </div>
            </div>
          ) : sortedReminders.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-full w-fit mx-auto mb-4">
                <Bell className="h-12 w-12 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No reminders found' : 'No reminders yet'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {searchTerm ? `No reminders found matching "${searchTerm}"` : 'Create your first reminder to get started!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedReminders.map((reminder) => (
                <ReminderDisplay
                  key={reminder.id}
                  reminder={reminder}
                  onReminderUpdated={handleReminderUpdated}
                  onReminderDeleted={handleReminderDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
