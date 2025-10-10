"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { UserCreateForm } from "@/components/user-create-form";
import { UserEditForm } from "@/components/user-edit-form";
import { UserAvatar } from "@/components/user-avatar";
import { 
  Users, 
  Search,
  MoreHorizontal,
  Loader2,
  Edit,
  Power,
  CheckCircle2,
  CircleAlert,
  Grid3X3,
  List
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import { canCreateUsers, canEditUsers } from "@/utils/auth";
import { useUser } from "@/components/user-provider";

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
  const { currentUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Deactivate/Activate state
  const [isTogglingStatus, setIsTogglingStatus] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Check permissions (client-side only to avoid hydration mismatch)
  const [canCreate, setCanCreate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanCreate(canCreateUsers());
    setCanEdit(canEditUsers());
  }, []);

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

  // Filter users based on search term, status, department, and role
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);
    
    // Department filter
    const matchesDepartment = departmentFilter === "all" || 
      user.department.toLowerCase() === departmentFilter.toLowerCase();
    
    // Role filter
    const matchesRole = roleFilter === "all" || 
      user.role.toLowerCase() === roleFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesRole;
  });

  // Handle user refresh after creation
  const handleUserCreated = () => {
    fetchUsers();
    fetchStats();
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
    <div className="space-y-4">
      <PageHeader 
        title="User Management" 
        description="Manage team members and their permissions"
        action={canCreate ? <UserCreateForm onUserCreated={handleUserCreated} /> : null}
      />

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Users</h3>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_users || 0}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Total members</p>
            </>
          )}
        </div>

        {/* Active Users */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Active Users</h3>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin text-green-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.active_users || 0}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Active members</p>
            </>
          )}
        </div>

        {/* Managers */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Managers</h3>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.users_by_role?.manager || 0}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Team managers</p>
            </>
          )}
        </div>

        {/* Team Leads */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Users className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Team Leads</h3>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.users_by_role?.team_lead || 0}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Team leaders</p>
            </>
          )}
        </div>

        {/* Members */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <Users className="h-5 w-5 text-indigo-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Members</h3>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.users_by_role?.member || 0}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Team members</p>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-3 py-2 w-full text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
              <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {stats?.users_by_department && Object.keys(stats.users_by_department).map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {stats?.users_by_role && Object.keys(stats.users_by_role).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">All Users</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredUsers.length !== users.length
                  ? `Showing ${filteredUsers.length} of ${users.length} users`
                  : `${filteredUsers.length} users total`
                }
              </p>
            </div>
          </div>

          {/* View Toggle Buttons */}
          <div className="flex bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`h-9 px-4 rounded flex items-center gap-2 transition-colors cursor-pointer ${viewMode === 'card'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="text-sm font-medium">Card</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`h-9 px-4 rounded flex items-center gap-2 transition-colors cursor-pointer ${viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading users...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4">
                <Users className="h-12 w-12 text-blue-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {searchTerm ? 'No users found matching your search.' : 'No users found.'}
              </p>
            </div>
          ) : (
            <div className={viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-2.5'}>
              {filteredUsers.map((user) => (
                <div key={user.id} className={`bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${viewMode === 'list' ? 'p-3.5' : 'p-4'
                  } ${!user.is_active ? 'opacity-75' : ''}`}>
                  {viewMode === 'card' ? (
                    /* Card View Layout - Modern */
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative">
                            <UserAvatar name={user.name} size="lg" />
                            <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800 ${user.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                              {user.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            {user.mobile && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">📱 {user.mobile}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {user.role.toUpperCase() !== 'CEO' && (
                            <span className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                              user.role === 'team_lead' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              user.role === 'manager' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              user.role === 'member' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                            </span>
                          )}
                          <span className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                            user.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {user.role.toUpperCase() !== 'CEO' && (
                            <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                              {user.department.charAt(0).toUpperCase() + user.department.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        {(currentUser?.role.toUpperCase() === 'ADMIN' || currentUser?.role.toUpperCase() === 'CEO') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-9 w-9 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center cursor-pointer">
                                <MoreHorizontal className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canEdit && (
                                <DropdownMenuItem 
                                  onClick={() => setEditingUser(user)}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                disabled={isTogglingStatus === user.id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Power className="h-4 w-4" />
                                {isTogglingStatus === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : null}
                                {user.is_active ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* List View Layout - Modern */
                  <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <UserAvatar name={user.name} size="md" />
                          <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 ${user.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                      <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        {user.mobile && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">📱 {user.mobile}</p>
                        )}
                          <div className="flex gap-2 mt-2">
                          {user.role.toUpperCase() !== 'CEO' && (
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                                user.role === 'team_lead' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                user.role === 'manager' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                user.role === 'member' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                            </span>
                          )}
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                              user.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {user.role.toUpperCase() !== 'CEO' && (
                              <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                              {user.department.charAt(0).toUpperCase() + user.department.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {(currentUser?.role.toUpperCase() === 'ADMIN' || currentUser?.role.toUpperCase() === 'CEO') && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <button className="h-9 w-9 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center cursor-pointer">
                                <MoreHorizontal className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                              </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {canEdit && (
                              <DropdownMenuItem 
                                onClick={() => setEditingUser(user)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                              disabled={isTogglingStatus === user.id}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Power className="h-4 w-4" />
                              {isTogglingStatus === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : null}
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit User Dialog */}
      {editingUser && (
        <UserEditForm 
          user={editingUser}
          onUserUpdated={() => {
            fetchUsers();
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}
