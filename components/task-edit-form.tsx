"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Edit, XCircle, Loader2, CheckCircle2, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import type { User, Team, Project, Task, TaskUpdate, TaskStatus, TaskPriority } from "@/types";

interface TaskEditFormProps {
  task: Task;
  trigger?: React.ReactNode;
  onTaskUpdated?: () => void;
}

export function TaskEditForm({ task, trigger, onTaskUpdated }: TaskEditFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    project_id: task.project_id?.toString() || '',
    team_id: task.team_id?.toString() || '',
    assigned_to: task.assigned_to.toString(),
    status: task.status as TaskStatus,
    priority: task.priority as TaskPriority,
    start_date: task.start_date.split('T')[0],
    due_date: task.due_date.split('T')[0],
    follow_up_date: task.follow_up_date.split('T')[0],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form data when task changes
  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description,
      project_id: task.project_id?.toString() || '',
      team_id: task.team_id?.toString() || '',
      assigned_to: task.assigned_to.toString(),
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      start_date: task.start_date.split('T')[0],
      due_date: task.due_date.split('T')[0],
      follow_up_date: task.follow_up_date.split('T')[0],
    });
  }, [task]);

  // Fetch data when component mounts or dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      fetchUsers();
      fetchTeams();
      fetchProjects();
    }
  }, [isDialogOpen]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await api.users.getAllUsers();
      setUsers(data.filter(user => user.is_active));
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
      setTeams(data.filter(team => team.status === 'active'));
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const data = await api.projects.getAllProjects();
      setProjects(data.filter(project => project.status === 'active'));
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
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

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.assigned_to) {
      newErrors.assigned_to = 'Assignee is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    if (!formData.follow_up_date) {
      newErrors.follow_up_date = 'Follow-up date is required';
    }

    // Validate date ranges
    if (formData.start_date && formData.due_date) {
      const startDate = new Date(formData.start_date);
      const dueDate = new Date(formData.due_date);
      
      if (dueDate <= startDate) {
        newErrors.due_date = 'Due date must be after start date';
      }
    }

    if (formData.start_date && formData.follow_up_date) {
      const startDate = new Date(formData.start_date);
      const followUpDate = new Date(formData.follow_up_date);
      
      if (followUpDate < startDate) {
        newErrors.follow_up_date = 'Follow-up date cannot be before start date';
      }
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
      // Prepare data for API - only send changed fields
      const taskData: TaskUpdate = {};
      
      if (formData.title !== task.title) taskData.title = formData.title;
      if (formData.description !== task.description) taskData.description = formData.description;
      if (parseInt(formData.assigned_to) !== task.assigned_to) taskData.assigned_to = parseInt(formData.assigned_to);
      if (formData.status !== task.status) taskData.status = formData.status;
      if (formData.priority !== task.priority) taskData.priority = formData.priority;
      if (formData.start_date !== task.start_date.split('T')[0]) taskData.start_date = formData.start_date;
      if (formData.due_date !== task.due_date.split('T')[0]) taskData.due_date = formData.due_date;
      if (formData.follow_up_date !== task.follow_up_date.split('T')[0]) taskData.follow_up_date = formData.follow_up_date;
      
      // Handle optional fields
      const currentProjectId = task.project_id?.toString() || '';
      const currentTeamId = task.team_id?.toString() || '';
      
      if (formData.project_id !== currentProjectId) {
        taskData.project_id = formData.project_id ? parseInt(formData.project_id) : undefined;
      }
      
      if (formData.team_id !== currentTeamId) {
        taskData.team_id = formData.team_id ? parseInt(formData.team_id) : undefined;
      }

      // Only update if there are changes
      if (Object.keys(taskData).length === 0) {
        toast.info('No changes to save');
        setIsDialogOpen(false);
        return;
      }

      const updatedTask = await api.tasks.updateTask(task.id, taskData);
      console.log('Task updated successfully:', updatedTask);

      // Close dialog
      setIsDialogOpen(false);

      // Show success toast
      toast.success('Task updated successfully!', {
        description: `${formData.title} has been updated.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });

      // Call callback to refresh parent component
      if (onTaskUpdated) {
        onTaskUpdated();
      }

    } catch (error) {
      console.error('Error updating task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      setErrors({ submit: errorMessage });

      // Show error toast
      toast.error('Failed to update task', {
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
      title: task.title,
      description: task.description,
      project_id: task.project_id?.toString() || '',
      team_id: task.team_id?.toString() || '',
      assigned_to: task.assigned_to.toString(),
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      start_date: task.start_date.split('T')[0],
      due_date: task.due_date.split('T')[0],
      follow_up_date: task.follow_up_date.split('T')[0],
    });
    setErrors({});
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
      <Edit className="h-4 w-4 mr-1" />
      Edit
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Edit Task: {task.title}
          </DialogTitle>
          <DialogDescription>
            Update the task details, assignment, and timeline as needed.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">Task Name *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter task name"
                    className={`transition-colors ${errors.title ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {errors.title && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.title}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter task description and requirements"
                    rows={3}
                    className={`transition-colors ${errors.description ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {errors.description && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.description}
                  </p>}
                </div>
              </div>
            </div>

            {/* Assignment & Context */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Assignment & Context</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project_id" className="text-sm font-medium text-gray-700">Project (Optional)</Label>
                  <Select value={formData.project_id} onValueChange={(value) => handleInputChange('project_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingProjects ? "Loading..." : "Select project"} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{project.name}</span>
                            <span className="text-xs text-gray-500">Manager: {project.manager.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team_id" className="text-sm font-medium text-gray-700">Team (Optional)</Label>
                  <Select value={formData.team_id} onValueChange={(value) => handleInputChange('team_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingTeams ? "Loading..." : "Select team"} />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{team.name}</span>
                            <span className="text-xs text-gray-500">{team.department} • {team.members.length} members</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to" className="text-sm font-medium text-gray-700">Assignee *</Label>
                <Select value={formData.assigned_to} onValueChange={(value) => handleInputChange('assigned_to', value)}>
                  <SelectTrigger className={`transition-colors ${errors.assigned_to ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
                    <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Select assignee"} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-gray-500">{user.role} • {user.department}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assigned_to && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.assigned_to}
                </p>}
              </div>
            </div>

            {/* Status & Priority */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Status & Priority</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="FINISHED">Finished</SelectItem>
                      <SelectItem value="STOPPED">Stopped</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium text-gray-700">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Dates</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className={`transition-colors ${errors.start_date ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {errors.start_date && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.start_date}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date" className="text-sm font-medium text-gray-700">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    min={formData.start_date}
                    className={`transition-colors ${errors.due_date ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {errors.due_date && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.due_date}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="follow_up_date" className="text-sm font-medium text-gray-700">Follow-up Date *</Label>
                  <Input
                    id="follow_up_date"
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                    min={formData.start_date}
                    className={`transition-colors ${errors.follow_up_date ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {errors.follow_up_date && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.follow_up_date}
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
                  setIsDialogOpen(false);
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
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
