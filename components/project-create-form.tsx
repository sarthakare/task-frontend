"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, XCircle, Loader2, Users, CheckCircle2, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
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
    <Button onClick={() => setIsCreateDialogOpen(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Create Project
    </Button>
  );

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">Create New Project</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter project name"
                  className={`transition-colors ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.name && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.name}
                </p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter project description and objectives"
                  rows={3}
                  className={`transition-colors ${errors.description ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.description && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.description}
                </p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="manager_id" className="text-sm font-medium text-gray-700">Project Manager</Label>
                <Select value={formData.manager_id} onValueChange={(value) => handleInputChange('manager_id', value)}>
                  <SelectTrigger className={`transition-colors ${errors.manager_id ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
                    <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Select project manager"} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex">
                          <span className="font-medium">{user.name} <span className="text-sm text-gray-500">({user.role} • {user.department})</span></span>
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
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  min={today}
                  className={`transition-colors ${errors.start_date ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
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
                  min={formData.start_date || today}
                  className={`transition-colors ${errors.end_date ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.end_date && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.end_date}
                </p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Assigned Teams</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                {teams.length > 0 ? (
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`team-${team.id}`}
                          checked={formData.assigned_teams.includes(team.id)}
                          onCheckedChange={(checked) => handleTeamToggle(team.id, checked as boolean)}
                        />
                        <label htmlFor={`team-${team.id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{team.name}</span>
                            <span className="text-sm text-gray-500">{team.department}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {team.members.length} members • Lead: {team.leader.name}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {isLoadingTeams ? 'Loading teams...' : 'No active teams available. Create some teams first.'}
                    </p>
                  </div>
                )}
              </div>
              {errors.assigned_teams && <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {errors.assigned_teams}
              </p>}
              {formData.assigned_teams.length > 0 && (
                <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                  {formData.assigned_teams.length} team(s) assigned
                </p>
              )}
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
                  setIsCreateDialogOpen(false);
                }}
                disabled={isSubmitting}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
