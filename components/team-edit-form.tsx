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
import type { User, Team, TeamUpdate } from "@/types";

interface TeamEditFormProps {
  team: Team;
  trigger?: React.ReactNode;
  onTeamUpdated?: () => void;
}

export function TeamEditForm({ team, trigger, onTeamUpdated }: TeamEditFormProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description,
    department: team.department,
    leader_id: team.leader_id.toString(),
    status: team.status as 'active' | 'inactive',
    member_ids: team.members.map(member => member.id)
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form data when team changes
  useEffect(() => {
    setFormData({
      name: team.name,
      description: team.description,
      department: team.department,
      leader_id: team.leader_id.toString(),
      status: team.status as 'active' | 'inactive',
      member_ids: team.members.map(member => member.id)
    });
  }, [team]);

  // Fetch data when component mounts or dialog opens
  useEffect(() => {
    if (isEditDialogOpen) {
      fetchUsers();
      fetchDepartments();
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
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // If team leader is selected, automatically add them to members
      if (field === 'leader_id' && value) {
        const leaderId = parseInt(value as string);
        if (!newData.member_ids.includes(leaderId)) {
          newData.member_ids = [...newData.member_ids, leaderId];
        }
      }

      return newData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleMemberToggle = (userId: number, checked: boolean) => {
    // Prevent unchecking the team leader
    const leaderId = formData.leader_id ? parseInt(formData.leader_id) : null;
    if (!checked && leaderId === userId) {
      toast.warning('Team leader cannot be removed', {
        description: 'The team leader must be a member of the team.',
        icon: <CircleAlert className="text-yellow-600" />,
        style: { color: "orange" },
      });
      return;
    }

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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API - only send changed fields
      const teamData: TeamUpdate = {};
      
      if (formData.name !== team.name) teamData.name = formData.name;
      if (formData.description !== team.description) teamData.description = formData.description;
      if (formData.department !== team.department) teamData.department = formData.department;
      if (parseInt(formData.leader_id) !== team.leader_id) teamData.leader_id = parseInt(formData.leader_id);
      if (formData.status !== team.status) teamData.status = formData.status;
      
      // Check if member list changed
      const currentMemberIds = team.members.map(m => m.id).sort();
      const newMemberIds = formData.member_ids.sort();
      if (JSON.stringify(currentMemberIds) !== JSON.stringify(newMemberIds)) {
        teamData.member_ids = formData.member_ids;
      }

      // Only update if there are changes
      if (Object.keys(teamData).length === 0) {
        toast.info('No changes to save');
        setIsEditDialogOpen(false);
        return;
      }

      const updatedTeam = await api.teams.updateTeam(team.id, teamData);
      console.log('Team updated successfully:', updatedTeam);

      // Close dialog
      setIsEditDialogOpen(false);

      // Show success toast
      toast.success('Team updated successfully!', {
        description: `${formData.name} has been updated.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });

      // Call callback to refresh parent component
      if (onTeamUpdated) {
        onTeamUpdated();
      }

    } catch (error) {
      console.error('Error updating team:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update team';
      setErrors({ submit: errorMessage });

      // Show error toast
      toast.error('Failed to update team', {
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
      name: team.name,
      description: team.description,
      department: team.department,
      leader_id: team.leader_id.toString(),
      status: team.status as 'active' | 'inactive',
      member_ids: team.members.map(member => member.id)
    });
    setErrors({});
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => setIsEditDialogOpen(true)}
    >
      <Edit className="h-4 w-4 mr-1" />
      Edit
    </Button>
  );

  // Filter users by department if a department is selected
  // If department is "All", show all active users
  const filteredUsers = formData.department
    ? formData.department === 'All' 
      ? users 
      : users.filter(user => user.department === formData.department)
    : users;

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="min-w-[80vw] min-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Edit className="h-5 w-5 text-white" />
            </div>
            Edit Team: {team.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Update the team details, leadership, and member assignments as needed.
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
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Team Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter team name"
                    className={`h-10 bg-white border-gray-200 hover:border-indigo-300 transition-colors ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-indigo-500'}`}
                  />
                  {errors.name && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.name}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter team description and purpose"
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

            {/* Department & Status */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                Department & Status
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger className={`h-10 bg-white border-gray-200 hover:border-blue-300 transition-colors ${errors.department ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
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
                    <SelectTrigger className="h-10 bg-white border-gray-200 hover:border-blue-300 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Team Leadership */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                Team Leadership
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="leader_id" className="text-sm font-medium text-gray-700">Team Lead *</Label>
                <Select value={formData.leader_id} onValueChange={(value) => handleInputChange('leader_id', value)}>
                  <SelectTrigger className={`h-10 bg-white border-gray-200 hover:border-green-300 transition-colors ${errors.leader_id ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'}`}>
                    <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Select team lead"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map((user) => (
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
                {errors.leader_id && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.leader_id}
                </p>}
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                Team Members
              </h3>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Select Team Members *</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Loading team members...</span>
                      </div>
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    <div className="space-y-0">
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded-md transition-colors">
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
                  setIsEditDialogOpen(false);
                }}
                disabled={isSubmitting}
                className="px-6 h-10 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Team
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
