 "use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { ProjectCreateForm } from "@/components/project-create-form";
import { ProjectEditForm } from "@/components/project-edit-form";
import { 
  FolderOpen, 
  Search,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  User,
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle2,
  X,
  Eye,
  CircleAlert
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api-service";
import { toast } from "sonner";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
    cancelledProjects: 0
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.projects.getAllProjects();
      setProjects(data);
      
      // Calculate stats
      const active = data.filter(project => project.status === 'active').length;
      const completed = data.filter(project => project.status === 'completed').length;
      const onHold = data.filter(project => project.status === 'on_hold').length;
      const cancelled = data.filter(project => project.status === 'cancelled').length;
      
      setStats({
        totalProjects: data.length,
        activeProjects: active,
        completedProjects: completed,
        onHoldProjects: onHold,
        cancelledProjects: cancelled
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectCreated = () => {
    fetchProjects(); // Refresh projects list after creating a new project
  };

  const handleProjectUpdated = () => {
    fetchProjects(); // Refresh projects list after updating a project
  };

  const handleProjectStatusChange = async (project: Project, newStatus: 'active' | 'on_hold' | 'completed' | 'cancelled') => {
    try {
      await api.projects.updateProject(project.id, { status: newStatus });
      
      const statusText = newStatus === 'on_hold' ? 'put on hold' : 
                        newStatus === 'completed' ? 'marked as completed' :
                        newStatus === 'cancelled' ? 'cancelled' : 'activated';
      
      toast.success(`Project ${statusText} successfully!`, {
        description: `${project.name} has been ${statusText}.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });
      
      fetchProjects(); // Refresh the projects list
    } catch (error) {
      console.error(`Error updating project status:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to update project status`;
      
      toast.error(`Failed to update project status`, {
        description: errorMessage,
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    }
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.assigned_teams.some(team => team.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Project Management" 
        description="Track and manage all your projects effectively"
      />

      {/* Search and Actions */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ProjectCreateForm onProjectCreated={handleProjectCreated} />
            </div>
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
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">All projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">Finished projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.onHoldProjects}</div>
            <p className="text-xs text-muted-foreground">Paused projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Projects ({filteredProjects.length})</span>
            <div className="text-sm text-gray-500">
              {filteredProjects.length !== projects.length && `Showing ${filteredProjects.length} of ${projects.length} projects`}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg bg-gray-50 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <div key={project.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          <ProjectEditForm 
                            project={project} 
                            onProjectUpdated={handleProjectUpdated}
                          />
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {/* View details functionality can be added later */}}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              {/* Status change options */}
                              {project.status !== 'active' && (
                                <DropdownMenuItem 
                                  onClick={() => handleProjectStatusChange(project, 'active')}
                                  className="flex items-center gap-2"
                                >
                                  <Play className="h-4 w-4" />
                                  Activate Project
                                </DropdownMenuItem>
                              )}
                              
                              {project.status === 'active' && (
                                <DropdownMenuItem 
                                  onClick={() => handleProjectStatusChange(project, 'on_hold')}
                                  className="flex items-center gap-2"
                                >
                                  <Pause className="h-4 w-4" />
                                  Put On Hold
                                </DropdownMenuItem>
                              )}
                              
                              {project.status !== 'completed' && (
                                <DropdownMenuItem 
                                  onClick={() => handleProjectStatusChange(project, 'completed')}
                                  className="flex items-center gap-2"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Mark Completed
                                </DropdownMenuItem>
                              )}
                              
                              {project.status !== 'cancelled' && project.status !== 'completed' && (
                                <DropdownMenuItem 
                                  onClick={() => handleProjectStatusChange(project, 'cancelled')}
                                  className="flex items-center gap-2"
                                >
                                  <X className="h-4 w-4" />
                                  Cancel Project
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'on_hold' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {project.status === 'active' ? 'Active' :
                           project.status === 'completed' ? 'Completed' :
                           project.status === 'on_hold' ? 'On Hold' : 'Cancelled'}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {project.assigned_teams.length} {project.assigned_teams.length === 1 ? 'Team' : 'Teams'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {new Date(project.end_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{project.assigned_teams.reduce((total, team) => total + team.members.length, 0)} Members</span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500 space-y-1">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Manager: {project.manager.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {projects.length === 0 ? "No projects yet" : "No projects found"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {projects.length === 0 
                  ? "Create your first project to start organizing your work effectively"
                  : "Try adjusting your search criteria or filters."
                }
              </p>
              {projects.length === 0 && (
                <ProjectCreateForm 
                  onProjectCreated={handleProjectCreated}
                  trigger={
                    <Button>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </Button>
                  }
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
