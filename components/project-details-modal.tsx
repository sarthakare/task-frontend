"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Users, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FolderOpen,
  Target,
  TrendingUp,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api-service";
import type { Project, Task } from "@/types";

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailsModal({ project, isOpen, onClose }: ProjectDetailsModalProps) {
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      fetchProjectTasks();
    }
  }, [project, isOpen]);

  const fetchProjectTasks = async () => {
    if (!project) return;
    
    setIsLoadingTasks(true);
    try {
      const tasks = await api.tasks.getAllTasks();
      // Filter tasks that belong to this project
      const projectTasks = tasks.filter(task => task.project_id === project.id);
      setProjectTasks(projectTasks);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      setProjectTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  if (!project) return null;

  // Calculate project progress based on tasks
  const completedTasks = projectTasks.filter(task => task.status === 'FINISHED').length;
  const totalTasks = projectTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate days remaining
  const endDate = new Date(project.end_date);
  const today = new Date();
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Active' };
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' };
      case 'on_hold':
        return { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'On Hold' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: status };
    }
  };

  const statusInfo = getStatusInfo(project.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[80vw] min-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
            Project Details: {project.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            View comprehensive project information, team assignments, and task progress.
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2 space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Project Name</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="font-medium text-gray-900">{project.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Description</Label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-700">{project.description}</p>
              </div>
            </div>
          </div>

          {/* Project Management */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
              Project Management
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Project Manager</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{project.manager.name}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Assigned Teams</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {project.assigned_teams.length} {project.assigned_teams.length === 1 ? 'Team' : 'Teams'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Total Members</Label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {project.assigned_teams.reduce((total, team) => total + team.members.length, 0)} members
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
              Timeline
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {new Date(project.start_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">End Date</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {new Date(project.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Days Remaining</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className={`font-medium ${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-orange-600' : 'text-gray-700'}`}>
                      {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Progress */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
              Project Progress
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Overall Progress</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Completion Status</span>
                    <span className="text-sm font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Total Tasks</Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
                    <div className="text-xs text-blue-600 font-medium">Total Tasks</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Completed</Label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-center">
                    <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                    <div className="text-xs text-green-600 font-medium">Completed</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Remaining</Label>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md text-center">
                    <div className="text-2xl font-bold text-orange-600">{totalTasks - completedTasks}</div>
                    <div className="text-xs text-orange-600 font-medium">Remaining</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Completion Rate</Label>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-md text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                    </div>
                    <div className="text-xs text-purple-600 font-medium">Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Teams */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></div>
              Assigned Teams
            </h3>
            
            {project.assigned_teams.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {project.assigned_teams.map((team) => (
                  <div key={team.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{team.name}</h4>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          <span className="font-medium">Department:</span> {team.department}
                        </span>
                      </div>
                      
                      {team.description && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Description:</span> {team.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No teams assigned to this project</p>
              </div>
            )}
          </div>

          {/* Project Tasks */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full"></div>
              Project Tasks
            </h3>
            
            {isLoadingTasks ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-500">Loading tasks...</span>
                </div>
              </div>
            ) : projectTasks.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {projectTasks.map((task) => (
                  <div key={task.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{task.title}</h4>
                      <Badge 
                        className={
                          task.status === 'FINISHED' ? 'bg-green-100 text-green-800 border-green-200' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          task.status === 'PENDING' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          task.status === 'NEW' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                          task.status === 'STOPPED' ? 'bg-red-100 text-red-800 border-red-200' :
                          task.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">Priority:</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                          {task.priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">Due:</span>
                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span className="font-medium">Assigned to:</span>
                        <span>{task.assigned_to}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No tasks found for this project</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
