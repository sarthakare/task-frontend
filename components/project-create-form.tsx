"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, XCircle, Loader2, CheckCircle2, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import { canCreateProjects } from "@/utils/auth";
import type { User, Team, ProjectCreate } from "@/types";

interface ProjectCreateFormProps {
  trigger?: React.ReactNode;
  onProjectCreated?: () => void;
}

export function ProjectCreateForm({ trigger, onProjectCreated }: ProjectCreateFormProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager_id: '',
    assigned_teams: [] as number[],
    start_date: '',
    end_date: '',
    status: 'active' as 'active' | 'on_hold' | 'completed' | 'cancelled'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data when component mounts or dialog opens
  useEffect(() => {
    if (isCreateDialogOpen) {
      fetchUsers();
      fetchTeams();
    }
  }, [isCreateDialogOpen]);

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
    if (!canCreateProjects()) {
      toast.error('Access Denied', {
        description: 'Only admin and CEO users can create projects.',
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
      // Prepare data for API
      const projectData: ProjectCreate = {
        name: formData.name,
        description: formData.description,
        manager_id: parseInt(formData.manager_id),
        assigned_teams: formData.assigned_teams,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status
      };

      const createdProject = await api.projects.createProject(projectData);
      console.log('Project created successfully:', createdProject);

      // Reset form and close dialog
      resetForm();
      setIsCreateDialogOpen(false);

      // Show success toast
      toast.success('Project created successfully!', {
        description: `${formData.name} has been created.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });

      // Call callback to refresh parent component
      if (onProjectCreated) {
        onProjectCreated();
      }

    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      setErrors({ submit: errorMessage });

      // Show error toast
      toast.error('Failed to create project', {
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
      name: '',
      description: '',
      manager_id: '',
      assigned_teams: [],
      start_date: '',
      end_date: '',
      status: 'active'
    });
    setErrors({});
  };

  const defaultTrigger = (
    <button 
      onClick={() => {
        if (!canCreateProjects()) {
          toast.error('Access Denied', {
            description: 'Only admin and CEO users can create projects.',
            icon: <CircleAlert className="text-red-600" />,
            style: { color: "red" },
          });
          return;
        }
        setIsCreateDialogOpen(true);
      }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
    >
      <Plus className="h-4 w-4" />
      <span>Create Project</span>
    </button>
  );

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="min-w-[80vw] min-h-[80vh] overflow-hidden bg-white dark:bg-gray-900">
        <DialogHeader className="pb-6 border-b border-gray-200 dark:border-gray-800">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Plus className="h-5 w-5 text-blue-500" />
            </div>
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
            Fill out the form below to create a new project with all necessary details and team assignments.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                    className={`h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors focus:border-blue-500 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.name}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors focus:border-blue-500">
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
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter project description and objectives"
                  rows={3}
                  className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors focus:border-blue-500 ${errors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {errors.description && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.description}
                </p>}
              </div>
            </div>

            {/* Project Management */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                Project Management
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manager_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Manager *</Label>
                  <Select value={formData.manager_id} onValueChange={(value) => handleInputChange('manager_id', value)} disabled={isLoadingUsers}>
                    <SelectTrigger className={`h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors focus:border-blue-500 ${errors.manager_id ? 'border-red-500 focus:border-red-500' : ''}`}>
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
                  {errors.manager_id && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.manager_id}
                  </p>}
                  {users.length === 0 && !isLoadingUsers && (
                    <p className="text-sm text-yellow-700 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                      No users available. Please create some users first.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigned_teams" className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned Teams</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-gray-50 dark:bg-gray-800">
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
                        <Label htmlFor={`team-${team.id}`} className="text-sm cursor-pointer text-gray-900 dark:text-white">
                          {team.name} ({team.department})
                        </Label>
                      </div>
                    ))}
                  </div>
                  {isLoadingTeams && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading teams...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                Timeline
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    min={today}
                    className={`h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors focus:border-blue-500 ${errors.start_date ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.start_date && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.start_date}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    min={formData.start_date || today}
                    className={`h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors focus:border-blue-500 ${errors.end_date ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.end_date && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.end_date}
                  </p>}
                </div>
              </div>
            </div>


            {errors.submit && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(false);
                }}
                disabled={isSubmitting}
                className="px-6 h-10 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 h-10 bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
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
