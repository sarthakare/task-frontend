"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { 
  Plus, 
  FolderOpen, 
  Search,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Project Management" 
        description="Track and manage all your projects effectively"
      />

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
        <Button variant="outline">
          <FolderOpen className="h-4 w-4 mr-2" />
          Import Project
        </Button>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Project Templates
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
                  placeholder="Search projects..."
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Finished projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">On-time delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample Project */}
            <div className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">E-commerce Platform</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Modern e-commerce platform with advanced features
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      In Progress
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                      High Priority
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      75% Complete
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: Mar 15, 2024
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      6 Members
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Lead: John Doe</div>
                  <div>Started: Jan 10, 2024</div>
                </div>
              </div>
            </div>

            {/* Another Sample Project */}
            <div className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">Mobile App Redesign</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete redesign of the mobile application
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Medium Priority
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      100% Complete
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Completed: Feb 28, 2024
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      4 Members
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Lead: Jane Smith</div>
                  <div>Started: Dec 1, 2023</div>
                </div>
              </div>
            </div>

            {/* Placeholder for more projects */}
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 italic">
                Create more projects to organize your work better
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
