"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Loader2,
  Clock,
  Flag,
  FileText,
  BarChart3
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

  const fetchTeamTasks = useCallback(async () => {
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
  }, [team]);

  useEffect(() => {
    if (team && isOpen) {
      fetchTeamTasks();
    }
  }, [team, isOpen, fetchTeamTasks]);

  if (!team) return null;

  // Calculate team task statistics
  const completedTasks = teamTasks.filter(task => task.status === 'FINISHED').length;
  const totalTasks = teamTasks.length;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900">
        <DialogHeader className="pb-6 pr-10 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-6 w-6 text-blue-500" />
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white pr-4">
                  {team.name}
                </DialogTitle>
              </div>
              <DialogDescription className="text-gray-600 dark:text-gray-400 text-base">
                Complete team information and member details
              </DialogDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={`${statusInfo.color} border text-sm font-medium px-3 py-1`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border text-sm font-medium px-3 py-1">
                <Users className="h-3 w-3 mr-1" />
                {team.members.length} Members
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
          <div className="space-y-6 py-4">
            
            {/* Team Description */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Description
              </h3>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-gray-800 dark:text-gray-300 leading-relaxed text-sm">{team.description}</p>
              </div>
            </div>

            {/* Team Leadership & Info */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                Leadership & Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-md">
                      <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-yellow-800 dark:text-yellow-600">Team Leader</p>
                      <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-400">{team.leader.name}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                      <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-800 dark:text-purple-600">Department</p>
                      <p className="text-sm font-semibold text-purple-900 dark:text-purple-400 capitalize">{team.department}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Team Members */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Team Members ({team.members.length})
              </h3>
              
              {team.members.length > 0 ? (
                <div className="space-y-3">
                  {team.members.map((member) => (
                    <div key={member.id} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                            <User className="h-4 w-4 text-green-600 dark:text-green-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-900 dark:text-green-400">{member.name}</h4>
                            {member.id === team.leader_id && (
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs mt-1">
                                <Crown className="h-3 w-3 mr-1" />
                                Team Leader
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border text-sm font-medium px-3 py-1 capitalize">
                          {member.role}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-green-600 dark:text-green-500" />
                          <span className="text-xs text-green-800 dark:text-green-400">{member.email}</span>
                        </div>
                        {member.mobile && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-green-600 dark:text-green-500" />
                            <span className="text-xs text-green-800 dark:text-green-400">{member.mobile}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-green-600 dark:text-green-500" />
                          <span className="text-xs text-green-800 dark:text-green-400 capitalize">{member.department}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
                  <Users className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No members in this team</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Team Tasks */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Team Tasks ({totalTasks})
              </h3>
              
              {isLoadingTasks ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Loading tasks...</span>
                  </div>
                </div>
              ) : teamTasks.length > 0 ? (
                <div className="space-y-4">
                  {/* Task Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTasks}</div>
                      <div className="text-xs text-blue-800 dark:text-blue-600 font-medium">Total Tasks</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
                      <div className="text-xs text-green-800 dark:text-green-600 font-medium">Completed</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800 text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalTasks - completedTasks}</div>
                      <div className="text-xs text-orange-800 dark:text-orange-600 font-medium">Remaining</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                      </div>
                      <div className="text-xs text-purple-800 dark:text-purple-600 font-medium">Complete</div>
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="space-y-3">
                    {teamTasks.map((task) => (
                      <div key={task.id} className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
                              <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-500" />
                            </div>
                            <h4 className="font-semibold text-indigo-900 dark:text-indigo-400">{task.title}</h4>
                          </div>
                          <Badge 
                            className={
                              task.status === 'FINISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' :
                              task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                              task.status === 'PENDING' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800' :
                              task.status === 'NEW' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700' :
                              task.status === 'STOPPED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' :
                              task.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                            }
                          >
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-indigo-800 dark:text-indigo-400 mb-3 leading-relaxed">{task.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2">
                            <Flag className="h-3 w-3 text-indigo-600 dark:text-indigo-500" />
                            <span className="text-xs text-indigo-800 dark:text-indigo-400 font-medium">Priority: {task.priority}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-indigo-600 dark:text-indigo-500" />
                            <span className="text-xs text-indigo-800 dark:text-indigo-400 font-medium">Due: {formatDate(task.due_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-indigo-600 dark:text-indigo-500" />
                            <span className="text-xs text-indigo-800 dark:text-indigo-400 font-medium">Assigned: {task.assignee?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
                  <CheckCircle className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No tasks found for this team</p>
                </div>
              )}
            </div>

            <Separator />

            {/* System Information */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                System Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Created</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDateTime(team.created_at)}</p>
                    </div>
                  </div>
                </div>

                {team.updated_at && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-800 dark:text-blue-600">Last Updated</p>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-400">{formatDateTime(team.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
