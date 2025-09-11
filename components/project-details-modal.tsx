"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Project Details: {project.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2 space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Project Overview</span>
                <Badge className={statusInfo.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{project.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Project Manager:</span>
                    <span className="text-sm text-gray-600">{project.manager.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Start Date:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(project.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">End Date:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(project.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Teams:</span>
                    <span className="text-sm text-gray-600">
                      {project.assigned_teams.length} {project.assigned_teams.length === 1 ? 'Team' : 'Teams'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Total Members:</span>
                    <span className="text-sm text-gray-600">
                      {project.assigned_teams.reduce((total, team) => total + team.members.length, 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Days Remaining:</span>
                    <span className={`text-sm font-medium ${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-orange-600' : 'text-gray-600'}`}>
                      {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
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
              </div>
            </CardContent>
          </Card>

          {/* Assigned Teams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.assigned_teams.length > 0 ? (
                <div className="space-y-3">
                  {project.assigned_teams.map((team) => (
                    <div key={team.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{team.name}</h4>
                        <Badge variant="outline">
                          {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Department:</span> {team.department}
                      </div>
                      {team.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Description:</span> {team.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No teams assigned to this project</p>
              )}
            </CardContent>
          </Card>

          {/* Project Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Project Tasks
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
              ) : projectTasks.length > 0 ? (
                <div className="space-y-3">
                  {projectTasks.map((task) => (
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
                        <span>Assigned to: {task.assigned_to}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No tasks found for this project</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
