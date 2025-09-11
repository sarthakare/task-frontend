"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  User, 
  Crown,
  Building2,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api-service";
import type { Team, Task } from "@/types";

interface TeamDetailsModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamDetailsModal({ team, isOpen, onClose }: TeamDetailsModalProps) {
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  useEffect(() => {
    if (team && isOpen) {
      fetchTeamTasks();
    }
  }, [team, isOpen]);

  const fetchTeamTasks = async () => {
    if (!team) return;
    
    setIsLoadingTasks(true);
    try {
      const tasks = await api.tasks.getAllTasks();
      // Filter tasks that belong to this team
      const teamTasks = tasks.filter(task => task.team_id === team.id);
      setTeamTasks(teamTasks);
    } catch (error) {
      console.error('Error fetching team tasks:', error);
      setTeamTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  if (!team) return null;

  // Calculate team task statistics
  const completedTasks = teamTasks.filter(task => task.status === 'FINISHED').length;
  const totalTasks = teamTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' };
      case 'inactive':
        return { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Inactive' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: status };
    }
  };

  const statusInfo = getStatusInfo(team.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Team Details: {team.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2 space-y-6">
          {/* Team Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Team Overview</span>
                <Badge className={statusInfo.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{team.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Team Lead:</span>
                    <span className="text-sm text-gray-600">{team.leader.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Department:</span>
                    <span className="text-sm text-gray-600 capitalize">{team.department}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Total Members:</span>
                    <span className="text-sm text-gray-600">{team.members.length}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Created:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(team.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Status:</span>
                    <span className="text-sm text-gray-600 capitalize">{team.status}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({team.members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {team.members.length > 0 ? (
                <div className="space-y-3">
                  {team.members.map((member) => (
                    <div key={member.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <h4 className="font-medium text-gray-900">{member.name}</h4>
                            {member.id === team.leader_id && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Crown className="h-3 w-3 mr-1" />
                                Leader
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {member.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{member.email}</span>
                        </div>
                        {member.mobile && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{member.mobile}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span className="capitalize">{member.department}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No members in this team</p>
              )}
            </CardContent>
          </Card>

          {/* Team Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Team Tasks ({totalTasks})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading tasks...</span>
                  </div>
                </div>
              ) : teamTasks.length > 0 ? (
                <div className="space-y-4">
                  {/* Task Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
                      <div className="text-xs text-gray-500">Total Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{totalTasks - completedTasks}</div>
                      <div className="text-xs text-gray-500">Remaining</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                      </div>
                      <div className="text-xs text-gray-500">Complete</div>
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="space-y-3">
                    {teamTasks.map((task) => (
                      <div key={task.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <Badge 
                            className={
                              task.status === 'FINISHED' ? 'bg-green-100 text-green-800' :
                              task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              task.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                              task.status === 'NEW' ? 'bg-gray-100 text-gray-800' :
                              task.status === 'STOPPED' ? 'bg-red-100 text-red-800' :
                              task.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Priority: {task.priority}</span>
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          <span>Assigned to: {task.assignee.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No tasks found for this team</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
