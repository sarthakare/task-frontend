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

      {/* User Stats - Modern Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Total Users */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-all group-hover:scale-110">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Users</h3>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{stats?.total_users || 0}</div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">Total members</p>
              </>
            )}
          </div>
        </div>

        {/* Active Users */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-green-500/50 transition-all group-hover:scale-110">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Active Users</h3>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-green-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">{stats?.active_users || 0}</div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">Active members</p>
              </>
            )}
          </div>
        </div>

        {/* Managers */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all group-hover:scale-110">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Managers</h3>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">{stats?.users_by_role?.manager || 0}</div>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-1">Team managers</p>
              </>
            )}
          </div>
        </div>

        {/* Team Leads */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 dark:from-orange-500/5 dark:to-amber-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg group-hover:shadow-orange-500/50 transition-all group-hover:scale-110">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Team Leads</h3>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">{stats?.users_by_role?.team_lead || 0}</div>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mt-1">Team leaders</p>
              </>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-indigo-500/50 transition-all group-hover:scale-110">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Members</h3>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            ) : (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">{stats?.users_by_role?.member || 0}</div>
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1">Team members</p>
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search users by name, email, department, or role..."
                  className="pl-12 pr-4 py-3 w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
                <SelectTrigger className="h-11 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="h-11 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-all cursor-pointer">
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
                <SelectTrigger className="h-11 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-all cursor-pointer">
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
      </div>

      {/* Users List - Modern Glass */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-500/5 dark:via-indigo-500/5 dark:to-purple-500/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent"></div>
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Users</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredUsers.length !== users.length
                    ? `Showing ${filteredUsers.length} of ${users.length} users`
                    : `${filteredUsers.length} users total`
                  }
                </p>
              </div>
            </div>

            {/* View Toggle Buttons */}
            <div className="flex bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/40 shadow-lg p-1">
              <button
                  onClick={() => setViewMode('card')}
                className={`h-9 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 cursor-pointer ${viewMode === 'card'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="text-sm font-medium">Card</span>
              </button>
              <button
                  onClick={() => setViewMode('list')}
                className={`h-9 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 cursor-pointer ${viewMode === 'list'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
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
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading users...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-full w-fit mx-auto mb-4">
                <Users className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {searchTerm ? 'No users found matching your search.' : 'No users found.'}
              </p>
            </div>
          ) : (
            <div className={viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-2.5'}>
              {filteredUsers.map((user) => (
                <div key={user.id} className={`group relative overflow-hidden rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ${viewMode === 'list' ? 'p-3.5' : 'p-4'
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
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                            <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${
                              user.role === 'team_lead' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                              user.role === 'manager' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                              user.role === 'member' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                              'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                            </span>
                          )}
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${
                            user.is_active ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {user.role.toUpperCase() !== 'CEO' && (
                            <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/80 dark:bg-slate-700/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600 shadow-sm">
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
                              <button className="h-9 w-9 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center justify-center cursor-pointer">
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
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg shadow-sm ${
                                user.role === 'team_lead' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                                user.role === 'manager' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                                user.role === 'member' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                            </span>
                          )}
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg shadow-sm ${
                              user.is_active ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {user.role.toUpperCase() !== 'CEO' && (
                              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/80 dark:bg-slate-700/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600 shadow-sm">
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
                              <button className="h-9 w-9 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center justify-center cursor-pointer">
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
