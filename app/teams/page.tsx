"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { TeamCreateForm } from "@/components/team-create-form";
import { TeamEditForm } from "@/components/team-edit-form";
import { TeamDetailsModal } from "@/components/team-details-modal";
import { Users, UserCheck, Building2, Crown, Calendar, MoreHorizontal, Power, PowerOff, Search, CheckCircle2, CircleAlert, Loader2, Eye, Grid3X3, List, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api-service";
import { toast } from "sonner";
import { canCreateTeams, canManageTeams } from "@/utils/auth";
import { useUser } from "@/components/user-provider";
import type { Team } from "@/types";

export default function TeamsPage() {
  const { currentUser } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeTeams: 0,
    totalMembers: 0,
    teamLeads: 0
  });

  // Check permissions (client-side only to avoid hydration mismatch)
  const [canCreate, setCanCreate] = useState(false);
  const [isAdminOrCEO, setIsAdminOrCEO] = useState(false);

  useEffect(() => {
    setCanCreate(canCreateTeams());
    setIsAdminOrCEO(canManageTeams());
  }, [currentUser]);

  // Team details modal state
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const [teamsData, departmentsData] = await Promise.all([
        api.teams.getAllTeams(),
        api.users.getDepartments()
      ]);

      setTeams(teamsData);
      setDepartments(departmentsData);

      // Calculate stats
      const activeTeams = teamsData.filter(team => team.status === 'active').length;
      const totalMembers = teamsData.reduce((sum, team) => sum + team.members.length, 0);
      const teamLeads = teamsData.length; // Each team has one lead

      setStats({
        totalTeams: teamsData.length,
        activeTeams,
        totalMembers,
        teamLeads
      });
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamCreated = () => {
    fetchTeams(); // Refresh teams list after creating a new team
  };

  const handleTeamUpdated = () => {
    fetchTeams(); // Refresh teams list after updating a team
  };

  const handleViewTeamDetails = (team: Team) => {
    setSelectedTeam(team);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTeam(null);
  };

  const handleToggleTeamStatus = async (team: Team) => {
    const newStatus = team.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activate' : 'deactivate';

    try {
      await api.teams.updateTeam(team.id, { status: newStatus });

      toast.success(`Team ${actionText}d successfully!`, {
        description: `${team.name} is now ${newStatus}.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });

      fetchTeams(); // Refresh the teams list
    } catch (error) {
      console.error(`Error ${actionText}ing team:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to ${actionText} team`;

      toast.error(`Failed to ${actionText} team`, {
        description: errorMessage,
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    }
  };

  // Filter teams based on search term, status, and department
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && team.status === "active") ||
      (statusFilter === "inactive" && team.status === "inactive");

    const matchesDepartment = departmentFilter === "all" ||
      team.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Team Management"
        description="Organize and manage your teams effectively"
        action={canCreate && <TeamCreateForm onTeamCreated={handleTeamCreated} />}
      />

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Teams */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Teams</h3>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTeams}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">All teams</p>
            </>
          )}
        </div>

        {/* Active Teams */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Active Teams</h3>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-green-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeTeams}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Currently active</p>
            </>
          )}
        </div>

        {/* Team Members */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Team Members</h3>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalMembers}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Across all teams</p>
            </>
          )}
        </div>

        {/* Team Leads */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <UserCheck className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Team Leads</h3>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.teamLeads}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Team leaders</p>
            </>
          )}
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search teams..."
                className="pl-10 pr-3 py-2 w-full text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
              <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={(value: string) => setDepartmentFilter(value)}>
              <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Teams</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredTeams.length !== teams.length
                  ? `Showing ${filteredTeams.length} of ${teams.length} teams`
                  : `${filteredTeams.length} teams total`
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
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading teams...</span>
              </div>
            </div>
          ) : filteredTeams.length > 0 ? (
            <div className={viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-2.5'}>
              {filteredTeams.map((team) => (
                <div key={team.id} className={`bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${viewMode === 'list' ? 'p-3.5' : 'p-4'
                  } ${team.status === 'active' ? '' : 'opacity-75'}`}>
                  {viewMode === 'card' ? (
                    /* Card View Layout - Modern */
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                          {team.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                          {team.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}
                          </span>
                          <span className={`px-3 py-1.5 text-xs font-medium rounded-lg ${team.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                            {team.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                            {team.department}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                            </div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">Lead:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{team.leader.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                            </div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">Created:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{new Date(team.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        {isAdminOrCEO ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-9 w-9 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center cursor-pointer">
                                <MoreHorizontal className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewTeamDetails(team)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>

                              <TeamEditForm
                                team={team}
                                onTeamUpdated={handleTeamUpdated}
                                trigger={
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit Team
                                  </DropdownMenuItem>
                                }
                              />

                              <DropdownMenuItem
                                onClick={() => handleToggleTeamStatus(team)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                {team.status === 'active' ? (
                                  <>
                                    <PowerOff className="h-4 w-4" />
                                    Deactivate Team
                                  </>
                                ) : (
                                  <>
                                    <Power className="h-4 w-4" />
                                    Activate Team
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <button
                            className="h-9 w-9 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center cursor-pointer"
                            onClick={() => handleViewTeamDetails(team)}
                          >
                            <Eye className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* List View Layout - Modern */
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{team.name}</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{team.description}</p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 ml-4">
                            {isAdminOrCEO ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="h-9 w-9 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center cursor-pointer">
                                    <MoreHorizontal className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleViewTeamDetails(team)}
                                    className="flex items-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>

                                  <TeamEditForm
                                    team={team}
                                    onTeamUpdated={handleTeamUpdated}
                                    trigger={
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="flex items-center gap-2 cursor-pointer"
                                      >
                                        <Edit className="h-4 w-4" />
                                        Edit Team
                                      </DropdownMenuItem>
                                    }
                                  />

                                  <DropdownMenuItem
                                    onClick={() => handleToggleTeamStatus(team)}
                                    className="flex items-center gap-2"
                                  >
                                    {team.status === 'active' ? (
                                      <>
                                        <PowerOff className="h-4 w-4" />
                                        Deactivate Team
                                      </>
                                    ) : (
                                      <>
                                        <Power className="h-4 w-4" />
                                        Activate Team
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <button
                                className="h-9 w-9 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center cursor-pointer"
                                onClick={() => handleViewTeamDetails(team)}
                              >
                                <Eye className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}
                          </span>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${team.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                            {team.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                            {team.department}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm mt-3">
                          <div className="flex items-center gap-2">
                            <Crown className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-500" />
                            <span className="text-gray-600 dark:text-gray-400">Lead: <span className="font-semibold text-gray-900 dark:text-white">{team.leader.name}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
                            <span className="text-gray-600 dark:text-gray-400">Created: <span className="font-semibold text-gray-900 dark:text-white">{new Date(team.created_at).toLocaleDateString()}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4">
                <Building2 className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {teams.length === 0 ? "No teams yet" : "No teams found"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {teams.length === 0
                  ? "Create your first team to start organizing your work effectively"
                  : "Try adjusting your search criteria or filters."
                }
              </p>
              {teams.length === 0 && canCreate && (
                <TeamCreateForm
                  onTeamCreated={handleTeamCreated}
                  trigger={
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
                      <Building2 className="h-4 w-4" />
                      Create Your First Team
                    </button>
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Team Details Modal */}
      <TeamDetailsModal
        team={selectedTeam}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
}
