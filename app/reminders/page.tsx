"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { ReminderCreateForm } from "@/components/reminder-create-form";
import { ReminderDisplay } from "@/components/reminder-display";
import { 
  Bell, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  Loader2
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
      toast.error(error instanceof Error ? error.message : "Failed to load reminders");
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
    <div className="space-y-6">
      <PageHeader 
        title="Reminders & Escalation" 
        description="Stay on top of important deadlines and escalations"
      />

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <ReminderCreateForm onReminderCreated={handleReminderCreated} />
        <Button variant="outline" disabled>
          <Bell className="h-4 w-4 mr-2" />
          Set Alert
        </Button>
        <Button variant="outline" disabled>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Escalate Issue
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search reminders..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{stats.active_reminders}</div>
            )}
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{stats.overdue_reminders}</div>
            )}
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{stats.today_reminders}</div>
            )}
            <p className="text-xs text-muted-foreground">Due today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats.completed_reminders}</div>
            )}
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle>All Reminders ({filteredReminders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border">
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <div className="flex gap-2 mb-3">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedReminders.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? (
                <p className="text-sm text-gray-500">
                  No reminders found matching &quot;{searchTerm}&quot;
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No reminders yet. Create your first reminder to get started!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
