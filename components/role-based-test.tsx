"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleBasedReports } from "./role-based-reports";
import type { AnalyticsData } from "@/lib/analytics-service";

export function RoleBasedTest() {
  const [selectedRole, setSelectedRole] = useState<string>("MEMBER");
  const [testData, setTestData] = useState<AnalyticsData | null>(null);

  const roles = [
    { value: "ADMIN", label: "Admin", description: "Full system access" },
    { value: "CEO", label: "CEO", description: "Organization-wide access" },
    { value: "MANAGER", label: "Manager", description: "Department scope" },
    { value: "TEAM_LEAD", label: "Team Lead", description: "Team scope" },
    { value: "MEMBER", label: "Member", description: "Personal scope" }
  ];

  const generateTestData = (role: string) => {
    const mockData: AnalyticsData = {
      overview: {
        total_users: Math.floor(Math.random() * 100) + 50,
        active_users: Math.floor(Math.random() * 80) + 40,
        total_projects: Math.floor(Math.random() * 20) + 10,
        active_projects: Math.floor(Math.random() * 15) + 5,
        total_tasks: Math.floor(Math.random() * 200) + 100,
        completed_tasks: Math.floor(Math.random() * 150) + 80,
        pending_tasks: Math.floor(Math.random() * 50) + 20,
        overdue_tasks: Math.floor(Math.random() * 10) + 2
      },
      userStats: {
        total_users: Math.floor(Math.random() * 100) + 50,
        active_users: Math.floor(Math.random() * 80) + 40,
        inactive_users: Math.floor(Math.random() * 20) + 10,
        users_by_department: {
          "Engineering": Math.floor(Math.random() * 30) + 20,
          "Marketing": Math.floor(Math.random() * 15) + 10,
          "Sales": Math.floor(Math.random() * 20) + 15,
          "HR": Math.floor(Math.random() * 10) + 5
        },
        users_by_role: {
          "CEO": 1,
          "manager": Math.floor(Math.random() * 5) + 3,
          "team_lead": Math.floor(Math.random() * 10) + 5,
          "member": Math.floor(Math.random() * 80) + 50
        }
      },
      projectStats: {
        total: Math.floor(Math.random() * 20) + 10,
        active: Math.floor(Math.random() * 15) + 5,
        completed: Math.floor(Math.random() * 10) + 3
      },
      teamStats: {
        total_teams: Math.floor(Math.random() * 15) + 8,
        active_teams: Math.floor(Math.random() * 12) + 6,
        inactive_teams: Math.floor(Math.random() * 5) + 2,
        department_counts: {
          "Engineering": Math.floor(Math.random() * 5) + 3,
          "Marketing": Math.floor(Math.random() * 3) + 2,
          "Sales": Math.floor(Math.random() * 4) + 2,
          "HR": Math.floor(Math.random() * 2) + 1
        }
      },
      taskStatusData: [
        { name: "COMPLETED", value: Math.floor(Math.random() * 50) + 30, color: "#00C49F" },
        { name: "IN_PROGRESS", value: Math.floor(Math.random() * 30) + 20, color: "#0088FE" },
        { name: "PENDING", value: Math.floor(Math.random() * 20) + 10, color: "#FFBB28" }
      ],
      userActivityData: [],
      projectProgressData: [],
      teamPerformanceData: [],
      recentActivities: [],
      loading: {
        overview: false,
        userStats: false,
        projectStats: false,
        teamStats: false,
        activities: false,
        charts: false
      },
      error: null
    };

    setTestData(mockData);
    console.log(`Generated test data for role: ${role}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Reports Test</CardTitle>
          <p className="text-sm text-gray-600">
            Test different user roles to see how reports and analytics change based on user permissions
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <Button
                  key={role.value}
                  variant={selectedRole === role.value ? "default" : "outline"}
                  onClick={() => setSelectedRole(role.value)}
                  className="flex flex-col items-start h-auto p-3"
                >
                  <span className="font-medium">{role.label}</span>
                  <span className="text-xs opacity-70">{role.description}</span>
                </Button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={() => generateTestData(selectedRole)}>
                Generate Test Data
              </Button>
              <Badge variant="outline">
                Current Role: {selectedRole}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {testData && (
        <RoleBasedReports 
          userRole={selectedRole} 
          data={testData} 
          loading={false} 
        />
      )}
    </div>
  );
}
