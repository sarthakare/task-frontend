"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, XCircle, Users, CheckCircle2, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import { canCreateTeams } from "@/utils/auth";
import { useUser } from "@/components/user-provider";
import type { User, TeamCreate } from "@/types";

interface TeamCreateFormProps {
  trigger?: React.ReactNode;
  onTeamCreated?: () => void;
}

export function TeamCreateForm({ trigger, onTeamCreated }: TeamCreateFormProps) {
  const { currentUser } = useUser();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    leader_id: '',
    status: 'active' as 'active' | 'inactive',
    member_ids: [] as number[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data when component mounts or dialog opens
  useEffect(() => {
    if (isCreateDialogOpen) {
      fetchUsers();
      fetchDepartments();
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

  const fetchDepartments = async () => {
    setIsLoadingDepartments(true);
    try {
      const data = await api.users.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setIsLoadingDepartments(false);
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

  const handleMemberToggle = (userId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      member_ids: checked
        ? [...prev.member_ids, userId]
        : prev.member_ids.filter(id => id !== userId)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.leader_id) {
      newErrors.leader_id = 'Team lead is required';
    }

    if (formData.member_ids.length === 0) {
      newErrors.member_ids = 'At least one team member is required';
    }

    // Check if leader is also a member
    const leaderId = parseInt(formData.leader_id);
    if (leaderId && !formData.member_ids.includes(leaderId)) {
      formData.member_ids.push(leaderId);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check permissions before submitting
    if (!canCreateTeams()) {
      toast.error('Access Denied', {
        description: 'Only admin and CEO users can create teams.',
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
      const teamData: TeamCreate = {
        name: formData.name,
        description: formData.description,
        department: formData.department,
        leader_id: parseInt(formData.leader_id),
        member_ids: formData.member_ids
      };

      const createdTeam = await api.teams.createTeam(teamData);
      console.log('Team created successfully:', createdTeam);

      // Reset form and close dialog
      resetForm();
      setIsCreateDialogOpen(false);

      // Show success toast
      toast.success('Team created successfully!', {
        description: `${formData.name} has been created.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });

      // Call callback to refresh parent component
      if (onTeamCreated) {
        onTeamCreated();
      }

    } catch (error) {
      console.error('Error creating team:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create team';
      setErrors({ submit: errorMessage });

      // Show error toast
      toast.error('Failed to create team', {
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
      department: '',
      leader_id: '',
      status: 'active',
      member_ids: []
    });
    setErrors({});
  };

  const defaultTrigger = (
    <Button 
      onClick={() => {
        if (!canCreateTeams()) {
          toast.error('Access Denied', {
            description: 'Only admin and CEO users can create teams.',
            icon: <CircleAlert className="text-red-600" />,
            style: { color: "red" },
          });
          return;
        }
        setIsCreateDialogOpen(true);
      }}
    >
      <Plus className="h-4 w-4 mr-2" />
      Create Team
    </Button>
  );

  // Filter users by department if a department is selected
  const filteredUsers = formData.department
    ? users.filter(user => user.department === formData.department)
    : users;

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">Create New Team</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Team Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter team name"
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
                  placeholder="Enter team description and purpose"
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
                <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger className={`transition-colors ${errors.department ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
                    <SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.department}
                </p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leader_id" className="text-sm font-medium text-gray-700">Team Lead</Label>
              <Select value={formData.leader_id} onValueChange={(value) => handleInputChange('leader_id', value)}>
                <SelectTrigger className={`transition-colors ${errors.leader_id ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
                  <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Select team lead"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex">
                        <span className="font-medium">{user.name} <span className="text-sm text-gray-500">({user.role} • {user.department})</span></span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leader_id && <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {errors.leader_id}
              </p>}
              {filteredUsers.length === 0 && !isLoadingUsers && formData.department && (
                <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  No users available in the selected department.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Team Members</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                {filteredUsers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`member-${user.id}`}
                          checked={formData.member_ids.includes(user.id)}
                          onCheckedChange={(checked) => handleMemberToggle(user.id, checked as boolean)}
                        />
                        <label htmlFor={`member-${user.id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{user.name}</span>
                            <span className="text-sm text-gray-500">{user.role}</span>
                          </div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {formData.department ? 'No users available in selected department' : 'Select a department to see available users'}
                    </p>
                  </div>
                )}
              </div>
              {errors.member_ids && <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {errors.member_ids}
              </p>}
              {formData.member_ids.length > 0 && (
                <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                  {formData.member_ids.length} member(s) selected
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
                {isSubmitting ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
