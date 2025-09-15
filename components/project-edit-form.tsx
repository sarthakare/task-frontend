"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, XCircle, Users, Loader2, CheckCircle2, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import { canEditProjects } from "@/utils/auth";
import { useUser } from "@/components/user-provider";
import type { User, Team, Project, ProjectUpdate } from "@/types";

interface ProjectEditFormProps {
  project: Project;
  trigger?: React.ReactNode;
  onProjectUpdated?: () => void;
}

export function ProjectEditForm({ project, trigger, onProjectUpdated }: ProjectEditFormProps) {
  const { currentUser } = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    manager_id: project.manager_id.toString(),
    assigned_teams: project.assigned_teams.map(team => team.id),
    start_date: project.start_date.split('T')[0], // Convert to YYYY-MM-DD format
    end_date: project.end_date.split('T')[0],
    status: project.status as 'active' | 'on_hold' | 'completed' | 'cancelled'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form data when project changes
  useEffect(() => {
    setFormData({
      name: project.name,
      description: project.description,
      manager_id: project.manager_id.toString(),
      assigned_teams: project.assigned_teams.map(team => team.id),
      start_date: project.start_date.split('T')[0],
      end_date: project.end_date.split('T')[0],
      status: project.status as 'active' | 'on_hold' | 'completed' | 'cancelled'
    });
  }, [project]);

  // Fetch data when component mounts or dialog opens
  useEffect(() => {
    if (isEditDialogOpen) {
      fetchUsers();
      fetchTeams();
    }
  }, [isEditDialogOpen]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await api.users.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const data = await api.teams.getAllTeams();
      // Only show active teams
      setTeams(data.filter(team => team.status === 'active'));
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTeamToggle = (teamId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assigned_teams: checked
        ? [...prev.assigned_teams, teamId]
        : prev.assigned_teams.filter(id => id !== teamId)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.manager_id) {
      newErrors.manager_id = 'Project manager is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    // Validate date range
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (formData.assigned_teams.length === 0) {
      newErrors.assigned_teams = 'At least one team must be assigned';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check permissions before submitting
    if (!canEditProjects()) {
      toast.error('Access Denied', {
        description: 'Only admin and CEO users can edit projects.',
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API - only send changed fields
      const projectData: ProjectUpdate = {};
      
      if (formData.name !== project.name) projectData.name = formData.name;
      if (formData.description !== project.description) projectData.description = formData.description;
      if (parseInt(formData.manager_id) !== project.manager_id) projectData.manager_id = parseInt(formData.manager_id);
      if (formData.start_date !== project.start_date.split('T')[0]) projectData.start_date = formData.start_date;
      if (formData.end_date !== project.end_date.split('T')[0]) projectData.end_date = formData.end_date;
      if (formData.status !== project.status) projectData.status = formData.status;
      
      // Check if team list changed
      const currentTeamIds = project.assigned_teams.map(t => t.id).sort();
      const newTeamIds = formData.assigned_teams.sort();
      if (JSON.stringify(currentTeamIds) !== JSON.stringify(newTeamIds)) {
        projectData.assigned_teams = formData.assigned_teams;
      }

      // Only update if there are changes
      if (Object.keys(projectData).length === 0) {
        toast.info('No changes to save');
        setIsEditDialogOpen(false);
        return;
      }

      const updatedProject = await api.projects.updateProject(project.id, projectData);
      console.log('Project updated successfully:', updatedProject);

      // Close dialog
      setIsEditDialogOpen(false);

      // Show success toast
      toast.success('Project updated successfully!', {
        description: `${formData.name} has been updated.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });

      // Call callback to refresh parent component
      if (onProjectUpdated) {
        onProjectUpdated();
      }

    } catch (error) {
      console.error('Error updating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      setErrors({ submit: errorMessage });

      // Show error toast
      toast.error('Failed to update project', {
        description: errorMessage,
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: project.name,
      description: project.description,
      manager_id: project.manager_id.toString(),
      assigned_teams: project.assigned_teams.map(team => team.id),
      start_date: project.start_date.split('T')[0],
      end_date: project.end_date.split('T')[0],
      status: project.status as 'active' | 'on_hold' | 'completed' | 'cancelled'
    });
    setErrors({});
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => {
        if (!canEditProjects()) {
          toast.error('Access Denied', {
            description: 'Only admin and CEO users can edit projects.',
            icon: <CircleAlert className="text-red-600" />,
            style: { color: "red" },
          });
          return;
        }
        setIsEditDialogOpen(true);
      }}
      className="cursor-pointer"
    >
      <Edit className="h-4 w-4 mr-1" />
      Edit
    </Button>
  );

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="min-w-[80vw] min-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <Edit className="h-5 w-5 text-white" />
            </div>
            Edit Project: {project.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Update the project details, timeline, and team assignments as needed.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                    className={`h-10 bg-white border-gray-200 hover:border-green-300 transition-colors focus:border-green-500 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.name}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="h-10 bg-white border-gray-200 hover:border-green-300 transition-colors focus:border-green-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter project description and objectives"
                  rows={3}
                  className={`bg-white border-gray-200 hover:border-green-300 transition-colors focus:border-green-500 ${errors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {errors.description && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.description}
                </p>}
              </div>
            </div>

            {/* Project Management */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                Project Management
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manager_id" className="text-sm font-medium text-gray-700">Project Manager *</Label>
                  <Select value={formData.manager_id} onValueChange={(value) => handleInputChange('manager_id', value)} disabled={isLoadingUsers}>
                    <SelectTrigger className={`h-10 bg-white border-gray-200 hover:border-blue-300 transition-colors focus:border-blue-500 ${errors.manager_id ? 'border-red-500 focus:border-red-500' : ''}`}>
                      <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Select project manager"} />
                      {isLoadingUsers && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          <div className="flex flex-col max-w-[200px]">
                            <span className="font-medium truncate" title={user.name}>
                              {user.name.length > 25 ? `${user.name.substring(0, 25)}...` : user.name}
                            </span>
                            <span className="text-xs text-gray-500 truncate" title={`${user.role} • ${user.department}`}>
                              {user.role} • {user.department.length > 15 ? `${user.department.substring(0, 15)}...` : user.department}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.manager_id && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.manager_id}
                  </p>}
                  {users.length === 0 && !isLoadingUsers && (
                    <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                      No users available. Please create some users first.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigned_teams" className="text-sm font-medium text-gray-700">Assigned Teams</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`team-${team.id}`}
                          checked={formData.assigned_teams.includes(team.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                assigned_teams: [...prev.assigned_teams, team.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                assigned_teams: prev.assigned_teams.filter(id => id !== team.id)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`team-${team.id}`} className="text-sm cursor-pointer">
                          {team.name} ({team.department})
                        </Label>
                      </div>
                    ))}
                  </div>
                  {isLoadingTeams && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading teams...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                Timeline
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className={`h-10 bg-white border-gray-200 hover:border-purple-300 transition-colors focus:border-purple-500 ${errors.start_date ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.start_date && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.start_date}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-sm font-medium text-gray-700">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    min={formData.start_date}
                    className={`h-10 bg-white border-gray-200 hover:border-purple-300 transition-colors focus:border-purple-500 ${errors.end_date ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.end_date && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.end_date}
                  </p>}
                </div>
              </div>
            </div>


            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditDialogOpen(false);
                }}
                disabled={isSubmitting}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Update Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
