"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, XCircle, Loader2, Upload, X, FileText, CheckCircle2, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import type { User, Team, Project, TaskCreate, TaskStatus, TaskPriority } from "@/types";

interface TaskCreateFormProps {
  trigger?: React.ReactNode;
  onTaskCreated?: () => void;
}

export function TaskCreateForm({ trigger, onTaskCreated }: TaskCreateFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    team_id: '',
    assigned_to: '',
    status: 'NEW' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    start_date: '',
    due_date: '',
    follow_up_date: '',
    tags: [] as string[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
      // Prepare data for API
      const taskData: TaskCreate = {
        title: formData.title,
        description: formData.description,
        assigned_to: parseInt(formData.assigned_to),
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date,
        due_date: formData.due_date,
        follow_up_date: formData.follow_up_date,
        tags: formData.tags,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      // Add optional fields if they have values
      if (formData.project_id) {
        taskData.project_id = parseInt(formData.project_id);
      }
      
      if (formData.team_id) {
        taskData.team_id = parseInt(formData.team_id);
      }

      const newTask = await api.tasks.createTask(taskData);
      console.log('Task created successfully:', newTask);

      // Reset form
      setFormData({
        title: '',
        description: '',
        project_id: '',
        team_id: '',
        assigned_to: '',
        status: 'NEW',
        priority: 'MEDIUM',
        start_date: '',
        due_date: '',
        follow_up_date: '',
        tags: [],
      });
      setAttachments([]);

      // Close dialog
      setIsDialogOpen(false);

      // Show success toast
      toast.success('Task created successfully!', {
        description: `${formData.title} has been created and assigned.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });

      // Call callback to refresh parent component
      if (onTaskCreated) {
        onTaskCreated();
      }

    } catch (error) {
      console.error('Error creating task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      setErrors({ submit: errorMessage });

      // Show error toast
      toast.error('Failed to create task', {
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
      title: '',
      description: '',
      project_id: '',
      team_id: '',
      assigned_to: '',
      status: 'NEW',
      priority: 'MEDIUM',
      start_date: '',
      due_date: '',
      follow_up_date: '',
      tags: [],
    });
    setAttachments([]);
    setErrors({});
  };

  const defaultTrigger = (
    <Button onClick={() => setIsDialogOpen(true)} className="cursor-pointer">
      <Plus className="h-4 w-4 mr-2" />
      Create Task
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="min-w-[80vw] min-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Fill out the form below to create a new task with all necessary details and assignments.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full"></div>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">Task Name *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter task name"
                    className={`h-10 bg-white border-gray-200 hover:border-indigo-300 transition-colors ${errors.title ? 'border-red-500 focus:border-red-500' : 'focus:border-indigo-500'}`}
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
                    className={`bg-white border-gray-200 hover:border-indigo-300 transition-colors ${errors.description ? 'border-red-500 focus:border-red-500' : 'focus:border-indigo-500'}`}
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
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                Assignment & Context
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project_id" className="text-sm font-medium text-gray-700">Project</Label>
                  <Select value={formData.project_id} onValueChange={(value) => handleInputChange('project_id', value)}>
                    <SelectTrigger className="h-10 bg-white border-gray-200 hover:border-blue-300 transition-colors">
                      <SelectValue placeholder={isLoadingProjects ? "Loading..." : "Select project"} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          <div className="flex flex-col max-w-[200px]">
                            <span className="font-medium truncate" title={project.name}>
                              {project.name.length > 25 ? `${project.name.substring(0, 25)}...` : project.name}
                            </span>
                            <span className="text-xs text-gray-500 truncate" title={project.manager.name}>
                              Manager: {project.manager.name.length > 20 ? `${project.manager.name.substring(0, 20)}...` : project.manager.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team_id" className="text-sm font-medium text-gray-700">Team</Label>
                  <Select value={formData.team_id} onValueChange={(value) => handleInputChange('team_id', value)}>
                    <SelectTrigger className="h-10 bg-white border-gray-200 hover:border-blue-300 transition-colors">
                      <SelectValue placeholder={isLoadingTeams ? "Loading..." : "Select team"} />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          <div className="flex flex-col max-w-[200px]">
                            <span className="font-medium truncate" title={team.name}>
                              {team.name.length > 25 ? `${team.name.substring(0, 25)}...` : team.name}
                            </span>
                            <span className="text-xs text-gray-500 truncate" title={`${team.department} • ${team.members.length} members`}>
                              {team.department.length > 15 ? `${team.department.substring(0, 15)}...` : team.department} • {team.members.length} members
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigned_to" className="text-sm font-medium text-gray-700">Assignee *</Label>
                  <Select value={formData.assigned_to} onValueChange={(value) => handleInputChange('assigned_to', value)}>
                    <SelectTrigger className={`h-10 bg-white border-gray-200 hover:border-blue-300 transition-colors ${errors.assigned_to ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
                      <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Select assignee"} />
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
                  {errors.assigned_to && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.assigned_to}
                  </p>}
                </div>
              </div>
            </div>

            {/* Status & Priority */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                Status & Priority
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="h-10 bg-white border-gray-200 hover:border-green-300 transition-colors">
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
                    <SelectTrigger className="h-10 bg-white border-gray-200 hover:border-green-300 transition-colors">
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
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
                Dates
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className={`h-10 bg-white border-gray-200 hover:border-orange-300 transition-colors ${errors.start_date ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'}`}
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
                    className={`h-10 bg-white border-gray-200 hover:border-orange-300 transition-colors ${errors.due_date ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'}`}
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
                    className={`h-10 bg-white border-gray-200 hover:border-orange-300 transition-colors ${errors.follow_up_date ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'}`}
                  />
                  {errors.follow_up_date && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.follow_up_date}
                  </p>}
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                Attachments
              </h3>
              
              <div className="space-y-3">
                <Label htmlFor="attachments" className="text-sm font-medium text-gray-700">Upload Files</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="file:mr-4 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-50 file:to-pink-50 file:text-purple-700 hover:file:from-purple-100 hover:file:to-pink-100 transition-all"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => document.getElementById('attachments')?.click()}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Browse
                  </Button>
                </div>
                
                {attachments.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 font-medium">{attachments.length} file(s) selected:</p>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md border border-purple-200">
                              <FileText className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
                disabled={isSubmitting}
                className="px-6 h-10 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
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
