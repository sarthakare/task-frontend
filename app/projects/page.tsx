 "use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { ProjectCreateForm } from "@/components/project-create-form";
import { ProjectEditForm } from "@/components/project-edit-form";
import { ProjectDetailsModal } from "@/components/project-details-modal";
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
  CircleAlert,
  Loader2,
  Grid3X3,
  List
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api-service";
import { toast } from "sonner";
import { canCreateProjects, canEditProjects } from "@/utils/auth";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
    cancelledProjects: 0
  });

  // Project details modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Check permissions
  const canCreate = canCreateProjects();
  const canEdit = canEditProjects();

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

  const handleViewProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedProject(null);
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

  // Get unique managers for filter
  const uniqueManagers = Array.from(new Set(projects.map(project => project.manager.name).filter(Boolean)));

  // Filter projects based on search term and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.assigned_teams.some(team => team.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesManager = managerFilter === "all" || project.manager.name === managerFilter;

    return matchesSearch && matchesStatus && matchesManager;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Project Management" 
        description="Track and manage all your projects effectively"
        action={
          canCreate ? <ProjectCreateForm onProjectCreated={handleProjectCreated} /> : null
        }
      />

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar - 55% width on large screens */}
            <div className="relative flex-1 lg:w-[55%]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search projects, descriptions, managers, or teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 border-gray-200 focus:border-blue-300 focus:ring-blue-200 w-full"
              />
            </div>

            {/* Filters - 45% width on large screens, arranged in 2 columns */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:w-[45%]">
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200 w-full cursor-pointer">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select value={managerFilter} onValueChange={setManagerFilter}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200 w-full cursor-pointer">
                    <SelectValue placeholder="All Managers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Managers</SelectItem>
                    {uniqueManagers.map((manager) => (
                      <SelectItem key={manager} value={manager}>
                        {manager}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Projects</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-blue-900 mb-1">{stats.totalProjects}</div>
                <p className="text-xs text-blue-700 font-medium">All projects</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Active</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-emerald-900 mb-1">{stats.activeProjects}</div>
                <p className="text-xs text-emerald-700 font-medium">Currently active</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Completed</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-purple-900 mb-1">{stats.completedProjects}</div>
                <p className="text-xs text-purple-700 font-medium">Finished projects</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">On Hold</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-orange-900 mb-1">{stats.onHoldProjects}</div>
                <p className="text-xs text-orange-700 font-medium">Paused projects</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FolderOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <span className="text-lg font-semibold">Projects</span>
                <div className="text-sm text-gray-500 font-normal">
                  {filteredProjects.length !== projects.length 
                    ? `Showing ${filteredProjects.length} of ${projects.length} projects`
                    : `${filteredProjects.length} projects total`
                  }
                </div>
              </div>
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className={`h-8 px-3 transition-all duration-200 cursor-pointer ${
                    viewMode === 'card' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:from-purple-600 hover:to-blue-600 hover:text-white' 
                      : 'text-gray-600 hover:bg-blue-200'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  Card
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-8 px-3 transition-all duration-200 cursor-pointer ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:from-purple-600 hover:to-blue-600 hover:text-white' 
                      : 'text-gray-600 hover:bg-blue-200'
                  }`}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading projects...</span>
              </div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className={viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-3'}>
              {filteredProjects.map((project) => (
                <div key={project.id} className={`group border border-gray-200 rounded-xl bg-white hover:shadow-lg hover:border-blue-200 transition-all duration-200 ${
                  viewMode === 'list' ? 'p-4' : 'p-6'
                }`}>
                  {viewMode === 'card' ? (
                    /* Card View Layout */
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        {canEdit && ( 
                          <ProjectEditForm 
                            project={project} 
                            onProjectUpdated={handleProjectUpdated}
                          />
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200 cursor-pointer">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleViewProjectDetails(project)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            
                            {/* Only show status change options if user has edit permissions */}
                            {canEdit && (
                              <>
                                <DropdownMenuSeparator />
                                
                                {/* Status change options */}
                                {project.status !== 'active' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleProjectStatusChange(project, 'active')}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Play className="h-4 w-4" />
                                    Activate Project
                                  </DropdownMenuItem>
                                )}
                                
                                {project.status === 'active' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleProjectStatusChange(project, 'on_hold')}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Pause className="h-4 w-4" />
                                    Put On Hold
                                  </DropdownMenuItem>
                                )}
                                
                                {project.status !== 'completed' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleProjectStatusChange(project, 'completed')}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Mark Completed
                                  </DropdownMenuItem>
                                )}
                                
                                {project.status !== 'cancelled' && project.status !== 'completed' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleProjectStatusChange(project, 'cancelled')}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <X className="h-4 w-4" />
                                    Cancel Project
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ) : (
                    /* List View Layout */
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{project.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        {canEdit && (
                          <ProjectEditForm 
                            project={project} 
                            onProjectUpdated={handleProjectUpdated}
                          />
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200 cursor-pointer">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleViewProjectDetails(project)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            
                            {/* Only show status change options if user has edit permissions */}
                            {canEdit && (
                              <>
                                <DropdownMenuSeparator />
                                
                                {/* Status change options */}
                                {project.status !== 'active' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleProjectStatusChange(project, 'active')}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Play className="h-4 w-4" />
                                    Activate Project
                                  </DropdownMenuItem>
                                )}
                                
                                {project.status === 'active' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleProjectStatusChange(project, 'on_hold')}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Pause className="h-4 w-4" />
                                    Put On Hold
                                  </DropdownMenuItem>
                                )}
                                
                                {project.status !== 'completed' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleProjectStatusChange(project, 'completed')}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Mark Completed
                                  </DropdownMenuItem>
                                )}
                                
                                {project.status !== 'cancelled' && project.status !== 'completed' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleProjectStatusChange(project, 'cancelled')}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <X className="h-4 w-4" />
                                    Cancel Project
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )}
                  
                  {viewMode === 'card' && (
                    <>
                      <div className="flex gap-2 mb-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          project.status === 'active' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          project.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          project.status === 'on_hold' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {project.status === 'active' ? 'Active' :
                           project.status === 'completed' ? 'Completed' :
                           project.status === 'on_hold' ? 'On Hold' : 'Cancelled'}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          {project.assigned_teams.length} {project.assigned_teams.length === 1 ? 'Team' : 'Teams'}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Dates:</span>
                            <span>{new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{project.assigned_teams.reduce((total, team) => total + team.members.length, 0)}</span>
                            <span>Members</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Manager:</span>
                            <span>{project.manager.name}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {viewMode === 'list' && (
                    <>
                      <div className="flex gap-2 mb-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          project.status === 'active' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          project.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          project.status === 'on_hold' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {project.status === 'active' ? 'Active' :
                           project.status === 'completed' ? 'Completed' :
                           project.status === 'on_hold' ? 'On Hold' : 'Cancelled'}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          {project.assigned_teams.length} {project.assigned_teams.length === 1 ? 'Team' : 'Teams'}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Dates:</span>
                            <span>{new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{project.assigned_teams.reduce((total, team) => total + team.members.length, 0)}</span>
                            <span>Members</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Manager:</span>
                            <span>{project.manager.name}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FolderOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {projects.length === 0 ? "No projects yet" : "No projects found"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {projects.length === 0 
                  ? "Create your first project to start organizing your work effectively and track progress with your team."
                  : "Try adjusting your search criteria or filters to find what you're looking for."
                }
              </p>
              {projects.length === 0 && canCreate && (
                <ProjectCreateForm 
                  onProjectCreated={handleProjectCreated}
                  trigger={
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
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

      {/* Project Details Modal */}
      <ProjectDetailsModal 
        project={selectedProject}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
}
