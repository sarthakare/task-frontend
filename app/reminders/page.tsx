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

      {/* Search and Refresh - Modern Glass */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500/10 to-gray-500/10 dark:from-slate-500/5 dark:to-gray-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search reminders..."
                  className="pl-12 pr-4 py-3 w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-5 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 font-medium text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
      </div>

      {/* Reminder Stats - Modern Glass */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Reminders */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-all group-hover:scale-110">
                <Bell className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Active Reminders</h3>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{stats.active_reminders}</div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">Currently active</p>
              </>
            )}
          </div>
        </div>

        {/* Overdue */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-500/5 dark:to-rose-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg group-hover:shadow-red-500/50 transition-all group-hover:scale-110">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Overdue</h3>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-red-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">{stats.overdue_reminders}</div>
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">Requires attention</p>
              </>
            )}
          </div>
        </div>

        {/* Today */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-green-500/50 transition-all group-hover:scale-110">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Today</h3>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-green-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">{stats.today_reminders}</div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">Due today</p>
              </>
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all group-hover:scale-110">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Completed</h3>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">{stats.completed_reminders}</div>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-1">Total completed</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reminders List - Modern Glass */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 dark:from-amber-500/5 dark:via-orange-500/5 dark:to-red-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-white/20 dark:border-white/10">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Reminders</h3>
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
                <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10 rounded-full w-fit mx-auto mb-4">
                  <Bell className="h-12 w-12 text-amber-600 dark:text-amber-400" />
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
    </div>
  );
}
