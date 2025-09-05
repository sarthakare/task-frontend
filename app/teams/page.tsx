"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { TeamCreateForm } from "@/components/team-create-form";
import { TeamEditForm } from "@/components/team-edit-form";
import { Users, UserCheck, Building2, Crown, Calendar, MoreHorizontal, Power, PowerOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api-service";
import { toast } from "sonner";
import type { Team } from "@/types";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeTeams: 0,
    totalMembers: 0,
    teamLeads: 0
  });

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

  const handleToggleTeamStatus = async (team: Team) => {
    const newStatus = team.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activate' : 'deactivate';
    
    try {
      await api.teams.updateTeam(team.id, { status: newStatus });
      
      toast.success(`Team ${actionText}d successfully!`, {
        description: `${team.name} is now ${newStatus}.`,
        duration: 4000,
      });
      
      fetchTeams(); // Refresh the teams list
    } catch (error) {
      console.error(`Error ${actionText}ing team:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to ${actionText} team`;
      
      toast.error(`Failed to ${actionText} team`, {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Team Management" 
        description="Organize and manage your teams effectively"
      />

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <TeamCreateForm onTeamCreated={handleTeamCreated} />
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.totalTeams}</div>
            <p className="text-xs text-muted-foreground">All teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.activeTeams}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across all teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Leads</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.teamLeads}</div>
            <p className="text-xs text-muted-foreground">Team leaders</p>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Teams</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg bg-gray-50 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : teams.length > 0 ? (
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{team.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          <TeamEditForm 
                            team={team} 
                            onTeamUpdated={handleTeamUpdated}
                          />
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
              <p className="text-sm text-gray-500 mb-6">
                Create your first team to start organizing your work effectively
              </p>
              <TeamCreateForm 
                onTeamCreated={handleTeamCreated}
                trigger={
                  <Button>
                    <Building2 className="h-4 w-4 mr-2" />
                    Create Your First Team
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
