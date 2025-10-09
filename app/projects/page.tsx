"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { ProjectCreateForm } from "@/components/project-create-form";
import { ProjectEditForm } from "@/components/project-edit-form";
import { ProjectDetailsModal } from "@/components/project-details-modal";
import {
  FolderOpen,
  Search,
  Calendar,
  Users,
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
  List,
  Edit
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

  // Check permissions (client-side only to avoid hydration mismatch)
  const [canCreate, setCanCreate] = useState(false);
  const [isAdminOrCEO, setIsAdminOrCEO] = useState(false);

  useEffect(() => {
    setCanCreate(canCreateProjects());
    setIsAdminOrCEO(canEditProjects());
  }, []);

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
    <div className="space-y-4">
      <PageHeader
        title="Project Management"
        description="Track and manage all your projects effectively"
        action={
          canCreate ? <ProjectCreateForm onProjectCreated={handleProjectCreated} /> : null
        }
      />

      {/* Project Stats - Modern Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-all group-hover:scale-110">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Projects</h3>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{stats.totalProjects}</div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">All projects</p>
              </>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-green-500/50 transition-all group-hover:scale-110">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Active</h3>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-green-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">{stats.activeProjects}</div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">Currently active</p>
              </>
            )}
          </div>
        </div>

        {/* Completed Projects */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all group-hover:scale-110">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Completed</h3>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">{stats.completedProjects}</div>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-1">Finished projects</p>
              </>
            )}
          </div>
        </div>

        {/* On Hold Projects */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 dark:from-orange-500/5 dark:to-amber-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg group-hover:shadow-orange-500/50 transition-all group-hover:scale-110">
                <Pause className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">On Hold</h3>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">{stats.onHoldProjects}</div>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mt-1">Paused projects</p>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Search and Filters - Modern Glass */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500/10 to-gray-500/10 dark:from-slate-500/5 dark:to-gray-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">   
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search projects, descriptions, managers, or teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-all cursor-pointer">
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

              <Select value={managerFilter} onValueChange={setManagerFilter}>
                <SelectTrigger className="h-11 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-all cursor-pointer">
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
      </div>

      {/* Projects List - Modern Glass */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 dark:from-green-500/5 dark:via-emerald-500/5 dark:to-teal-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Projects</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredProjects.length !== projects.length
                    ? `Showing ${filteredProjects.length} of ${projects.length} projects`
                    : `${filteredProjects.length} projects total`
                  }
                </p>
              </div>
            </div>

            {/* View Toggle Buttons */}
            <div className="flex bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`h-9 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 cursor-pointer ${viewMode === 'card'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="text-sm font-medium">Card</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`h-9 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 cursor-pointer ${viewMode === 'list'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <List className="h-4 w-4" />
                <span className="text-sm font-medium">List</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading projects...</span>
              </div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className={viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-2.5'}>
              {filteredProjects.map((project) => (
                <div key={project.id} className={`group relative overflow-hidden rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ${viewMode === 'list' ? 'p-3.5' : 'p-4'
                  }`}>
                  {viewMode === 'card' ? (
                    /* Card View Layout - Modern */
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-emerald-600 dark:group-hover:from-green-400 dark:group-hover:to-emerald-400 group-hover:bg-clip-text group-hover:text-transparent transition-all line-clamp-1">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        {isAdminOrCEO ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-9 w-9 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center justify-center cursor-pointer">
                                <MoreHorizontal className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewProjectDetails(project)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>

                              <ProjectEditForm
                                project={project}
                                onProjectUpdated={handleProjectUpdated}
                                trigger={
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit Project
                                  </DropdownMenuItem>
                                }
                              />

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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <button
                            className="h-9 w-9 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
                            onClick={() => handleViewProjectDetails(project)}
                          >
                            <Eye className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* List View Layout - Modern */
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{project.name}</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {project.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        {isAdminOrCEO ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-9 w-9 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center justify-center cursor-pointer">
                                <MoreHorizontal className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewProjectDetails(project)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>

                              <ProjectEditForm
                                project={project}
                                onProjectUpdated={handleProjectUpdated}
                                trigger={
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit Project
                                  </DropdownMenuItem>
                                }
                              />

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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <button
                            className="h-9 w-9 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
                            onClick={() => handleViewProjectDetails(project)}
                          >
                            <Eye className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {viewMode === 'card' && (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${project.status === 'active' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                            project.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                              project.status === 'on_hold' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' :
                                'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                          }`}>
                          {project.status === 'active' ? 'Active' :
                            project.status === 'completed' ? 'Completed' :
                              project.status === 'on_hold' ? 'On Hold' : 'Cancelled'}
                        </span>
                        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                          {project.assigned_teams.length} {project.assigned_teams.length === 1 ? 'Team' : 'Teams'}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
                              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-lg">
                              <Users className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 font-semibold">{project.assigned_teams.reduce((total, team) => total + team.members.length, 0)} Members</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-lg">
                              <User className="h-4 w-4 text-green-600 dark:text-green-500" />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 font-semibold">{project.manager.name}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {viewMode === 'list' && (
                    <>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg shadow-sm ${project.status === 'active' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                            project.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                              project.status === 'on_hold' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' :
                                'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                          }`}>
                          {project.status === 'active' ? 'Active' :
                            project.status === 'completed' ? 'Completed' :
                              project.status === 'on_hold' ? 'On Hold' : 'Cancelled'}
                        </span>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                          {project.assigned_teams.length} {project.assigned_teams.length === 1 ? 'Team' : 'Teams'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-purple-600 dark:text-purple-500" />
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{project.assigned_teams.reduce((total, team) => total + team.members.length, 0)} Members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{project.manager.name}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-full w-fit mx-auto mb-4">
                <FolderOpen className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {projects.length === 0 ? "No projects yet" : "No projects found"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {projects.length === 0
                  ? "Create your first project to start organizing your work effectively and track progress with your team."
                  : "Try adjusting your search criteria or filters to find what you're looking for."
                }
              </p>
              {projects.length === 0 && canCreate && (
                <ProjectCreateForm
                  onProjectCreated={handleProjectCreated}
                  trigger={
                    <button className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 cursor-pointer">
                      <FolderOpen className="h-4 w-4" />
                      Create Your First Project
                    </button>
                  }
                />
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
}
