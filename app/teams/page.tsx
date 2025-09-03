"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Plus, Users, UserCheck, Building2 } from "lucide-react";

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Team Management" 
        description="Organize and manage your teams effectively"
      />

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Invite Members
        </Button>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Active teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Across all teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Leads</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Team leaders</p>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample Team */}
            <div className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">Development Team</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Core development team working on the main application
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      8 Members
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Lead: John Doe</div>
                  <div>Created: Jan 15, 2024</div>
                </div>
              </div>
            </div>

            {/* Another Sample Team */}
            <div className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">Design Team</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    UI/UX design team for user experience
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      4 Members
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Lead: Jane Smith</div>
                  <div>Created: Jan 20, 2024</div>
                </div>
              </div>
            </div>

            {/* Placeholder for more teams */}
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 italic">
                Create more teams to organize your work better
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
