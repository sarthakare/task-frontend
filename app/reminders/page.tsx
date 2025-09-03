"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { 
  Plus, 
  Bell, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Search,
  Filter,
  RefreshCw
} from "lucide-react";

export default function RemindersPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reminders & Escalation" 
        description="Stay on top of important deadlines and escalations"
      />

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Reminder
        </Button>
        <Button variant="outline">
          <Bell className="h-4 w-4 mr-2" />
          Set Alert
        </Button>
        <Button variant="outline">
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
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
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
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Due today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">12</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle>All Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overdue Reminder */}
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-red-900">Project Review Meeting</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Quarterly project review meeting with stakeholders
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                      Overdue
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                      High Priority
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-red-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Was due: Feb 28, 2024
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Escalated to Manager
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-red-600">
                  <div>Assigned: John Doe</div>
                  <div>Escalated: 2 days ago</div>
                </div>
              </div>
            </div>

            {/* Today's Reminder */}
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-blue-900">Client Presentation</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Prepare presentation for client meeting
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Today
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Medium Priority
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-blue-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due: Today, 3:00 PM
                    </span>
                    <span className="flex items-center gap-1">
                      <Bell className="h-3 w-3" />
                      Reminder set
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-blue-600">
                  <div>Assigned: Jane Smith</div>
                  <div>Created: 2 days ago</div>
                </div>
              </div>
            </div>

            {/* Upcoming Reminder */}
            <div className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">Team Standup</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Daily team standup meeting
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Tomorrow
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Low Priority
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due: Tomorrow, 9:00 AM
                    </span>
                    <span className="flex items-center gap-1">
                      <Bell className="h-3 w-3" />
                      Reminder set
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Assigned: Team Lead</div>
                  <div>Created: 1 week ago</div>
                </div>
              </div>
            </div>

            {/* Placeholder for more reminders */}
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 italic">
                Create more reminders to stay organized
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
