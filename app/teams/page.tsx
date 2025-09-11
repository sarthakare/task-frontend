"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { TeamCreateForm } from "@/components/team-create-form";
import { TeamEditForm } from "@/components/team-edit-form";
import { TeamDetailsModal } from "@/components/team-details-modal";
import { Users, UserCheck, Building2, Crown, Calendar, MoreHorizontal, Power, PowerOff, Search, CheckCircle2, CircleAlert, Loader2, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api-service";
import { toast } from "sonner";
import { canCreateTeams, canEditTeams } from "@/utils/auth";
import type { Team } from "@/types";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeTeams: 0,
    totalMembers: 0,
    teamLeads: 0
  });

  // Check permissions
  const canCreate = canCreateTeams();
  const canEdit = canEditTeams();

  // Team details modal state
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const data = await api.teams.getAllTeams();
      setTeams(data);
      
      // Calculate stats
      const activeTeams = data.filter(team => team.status === 'active').length;
      const totalMembers = data.reduce((sum, team) => sum + team.members.length, 0);
      const teamLeads = data.length; // Each team has one lead
      
      setStats({
        totalTeams: data.length,
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

  // Filter teams based on search term and status
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && team.status === "active") ||
      (statusFilter === "inactive" && team.status === "inactive");
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Team Management" 
        description="Organize and manage your teams effectively"
      />

      {/* Search and Actions */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search teams..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
              {canCreate && <TeamCreateForm onTeamCreated={handleTeamCreated} />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Teams</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-blue-900">{stats.totalTeams}</div>
            )}
            <p className="text-xs text-blue-700">All teams</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Active Teams</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-green-900">{stats.activeTeams}</div>
            )}
            <p className="text-xs text-green-700">Currently active</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Team Members</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-purple-900">{stats.totalMembers}</div>
            )}
            <p className="text-xs text-purple-700">Across all teams</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Team Leads</CardTitle>
            <UserCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-orange-900">{stats.teamLeads}</div>
            )}
            <p className="text-xs text-orange-700">Team leaders</p>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Teams ({filteredTeams.length})</span>
            <div className="text-sm text-gray-500">
              {filteredTeams.length !== teams.length && `Showing ${filteredTeams.length} of ${teams.length} teams`}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading teams...</span>
              </div>
            </div>
          ) : filteredTeams.length > 0 ? (
            <div className="space-y-4">
              {filteredTeams.map((team) => (
                <div key={team.id} className={`p-4 border rounded-lg ${team.status === 'active' ? 'bg-white' : 'bg-gray-50 border-gray-300'} hover:shadow-md transition-shadow`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium ${team.status === 'active' ? 'text-gray-900' : 'text-gray-600'}`}>{team.name}</h3>
                          <p className={`text-sm mt-1 ${team.status === 'active' ? 'text-gray-600' : 'text-gray-500'}`}>{team.description}</p>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          {canEdit && (
                            <TeamEditForm 
                              team={team} 
                              onTeamUpdated={handleTeamUpdated}
                            />
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleViewTeamDetails(team)}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              
                              {/* Only show status change options if user has edit permissions */}
                              {canEdit && (
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
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          team.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {team.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {team.department}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            <span>Lead: {team.leader.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {new Date(team.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {teams.length === 0 ? "No teams yet" : "No teams found"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {teams.length === 0 
                  ? "Create your first team to start organizing your work effectively"
                  : "Try adjusting your search criteria or filters."
                }
              </p>
              {teams.length === 0 && canCreate && (
                <TeamCreateForm 
                  onTeamCreated={handleTeamCreated}
                  trigger={
                    <Button>
                      <Building2 className="h-4 w-4 mr-2" />
                      Create Your First Team
                    </Button>
                  }
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Details Modal */}
      <TeamDetailsModal 
        team={selectedTeam}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
}
