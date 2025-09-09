"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { UserCreateForm } from "@/components/user-create-form";
import { 
  Users, 
  Search,
  MoreHorizontal,
  Loader2,
  Edit,
  Power,
  CheckCircle2,
  CircleAlert
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api-service";

// Types based on backend schemas
interface User {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  department: string;
  role: string;
  supervisor_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_department: Record<string, number>;
  users_by_role: Record<string, number>;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Edit user state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Deactivate/Activate state
  const [isTogglingStatus, setIsTogglingStatus] = useState<number | null>(null);

  // Fetch users and stats on component mount
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.users.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users', {
        description: api.utils.handleError(error),
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await api.users.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch user statistics', {
        description: api.utils.handleError(error),
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle user refresh after creation
  const handleUserCreated = () => {
    fetchUsers();
    fetchStats();
  };

  // Edit user function
  const handleEditUser = async (userData: Partial<User>) => {
    if (!editingUser) return;
    
    setIsSubmitting(true);
    try {
      await api.users.updateUser(editingUser.id, userData);
      toast.success('User updated successfully!', {
        description: `${editingUser.name} has been updated.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user', {
        description: api.utils.handleError(error),
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle user status (activate/deactivate)
  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    setIsTogglingStatus(userId);
    try {
      await api.users.updateUser(userId, { is_active: !currentStatus });
      const action = currentStatus ? 'deactivated' : 'activated';
      toast.success(`User ${action} successfully!`, {
        description: `User has been ${action}.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to toggle user status', {
        description: api.utils.handleError(error),
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setIsTogglingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="User Management" 
        description="Manage team members and their permissions"
      />

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserCreateForm onUserCreated={handleUserCreated} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-900">{stats?.total_users || 0}</div>
                <p className="text-xs text-blue-700">Total members</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-900">{stats?.active_users || 0}</div>
                <p className="text-xs text-green-700">Active members</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Total Managers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-900">{stats?.users_by_role?.manager || 0}</div>
                <p className="text-xs text-purple-700">Team managers</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Team Lead</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-900">{stats?.users_by_role?.team_lead || 0}</div>
                <p className="text-xs text-orange-700">Team leaders</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading users...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 italic">
                {searchTerm ? 'No users found matching your search.' : 'No users found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        // Assign background color based on the user's role (manager, team_lead, member, intern)
                        user.role === 'manager' ? 'bg-purple-100' :
                        user.role === 'team_lead' ? 'bg-blue-100' :
                        user.role === 'member' ? 'bg-green-100' :
                        user.role === 'intern' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        <span className={`font-medium ${
                          user.role === 'manager' ? 'text-purple-600' :
                          user.role === 'team_lead' ? 'text-blue-600' :
                          user.role === 'member' ? 'text-green-600' :
                          user.role === 'intern' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.mobile && (
                          <p className="text-sm text-gray-500">{user.mobile}</p>
                        )}
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'team_lead' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'member' ? 'bg-green-100 text-green-800' :
                            user.role === 'intern' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {user.department.charAt(0).toUpperCase() + user.department.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                            disabled={isTogglingStatus === user.id}
                          >
                            <Power className="h-4 w-4 mr-2" />
                            {isTogglingStatus === user.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User: {editingUser?.name}</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <EditUserForm 
              user={editingUser} 
              onSubmit={handleEditUser}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingUser(null);
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Edit User Form Component
interface EditUserFormProps {
  user: User;
  onSubmit: (userData: Partial<User>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function EditUserForm({ user, onSubmit, onCancel, isSubmitting }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    mobile: user.mobile || '',
    department: user.department,
    role: user.role,
  });

  const [roles, setRoles] = useState<string[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

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

  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const data = await api.users.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };  

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Full Name</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter full name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-email">Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-mobile">Mobile Number</Label>
          <Input
            id="edit-mobile"
            type="tel"
            value={formData.mobile}
            onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
            placeholder="Enter mobile number"
          />
        </div>
                 <div className="space-y-2">
           <Label htmlFor="edit-department">Department</Label>
           {isLoadingDepartments ? (
             <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
               <Loader2 className="h-4 w-4 animate-spin" />
               <span className="text-sm text-muted-foreground">Loading departments...</span>
             </div>
           ) : (
             <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
               <SelectTrigger>
                 <SelectValue placeholder="Select department" />
               </SelectTrigger>
               <SelectContent>
                 {departments.map((dept: string) => (
                   <SelectItem key={dept} value={dept}>
                     {dept.charAt(0).toUpperCase() + dept.slice(1).replace('_', ' ')}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           )}
         </div>
      </div>

             <div className="space-y-2">
         <Label htmlFor="edit-role">Role</Label>
         {isLoadingRoles ? (
           <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
             <Loader2 className="h-4 w-4 animate-spin" />
             <span className="text-sm text-muted-foreground">Loading roles...</span>
           </div>
         ) : (
           <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
             <SelectTrigger>
               <SelectValue placeholder="Select role" />
             </SelectTrigger>
             <SelectContent>
               {roles.map((role: string) => (
                 <SelectItem key={role} value={role}>
                   {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
         )}
        
        {/* Role change warning */}
        {formData.role !== user.role && (
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Role Change Warning:</strong> Changing a user&apos;s role will affect their permissions and access levels.
            </p>
            <p className="text-sm text-blue-600 mt-1">
              <strong>Current Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update User'}
        </Button>
      </div>
    </form>
  );
}
