"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, CheckCircle2, CircleAlert, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import { User, Task, ReminderCreate } from "@/types";

interface ReminderCreateFormProps {
  onReminderCreated?: () => void;
}

export function ReminderCreateForm({ onReminderCreated }: ReminderCreateFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ReminderCreate & { task_id: number | undefined }>({
    title: "",
    description: "",
    due_date: "",
    priority: "MEDIUM",
    user_id: 0,
    task_id: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data when component mounts or dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      fetchUsers();
      fetchTasks();
    }
  }, [isDialogOpen]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await api.users.getAllUsers();
      setUsers(data.filter(user => user.is_active));
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const data = await api.tasks.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | undefined) => {
    // Log datetime values for debugging
    if (field === 'due_date') {
      console.log('=== DATETIME INPUT DEBUG ===');
      console.log('Raw input value:', value);
      console.log('Input type:', typeof value);
      if (value) {
        const dateObj = new Date(value as string);
        console.log('Date object:', dateObj);
        console.log('Date ISO string:', dateObj.toISOString());
        console.log('Date local string:', dateObj.toLocaleString());
        console.log('Date IST string:', dateObj.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}));
        console.log('Timezone offset (minutes):', dateObj.getTimezoneOffset());
        console.log('========================');
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Reminder title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    if (!formData.user_id || formData.user_id === 0) {
      newErrors.user_id = 'Please select a user';
    }

    // Validate due date is today or in the future (using IST)
    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      
      // Get current IST date (start of day)
      const now = new Date();
      const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      const today = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
      
      if (dueDate < today) {
        newErrors.due_date = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse the date input and set time to end of day in IST
      const [year, month, day] = formData.due_date.split('-').map(Number);
      
      // Create date object for end of day in IST (23:59:59)
      const istDate = new Date(year, month - 1, day, 23, 59, 59);
      
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Original formData.due_date:', formData.due_date);
      console.log('Parsed IST date (end of day):', istDate);
      console.log('IST date ISO:', istDate.toISOString());
      console.log('IST date local:', istDate.toLocaleString());
      console.log('IST date IST:', istDate.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}));
      console.log('=============================');
      
      await api.reminders.createReminder({
        ...formData,
        due_date: istDate.toISOString(),
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        due_date: "",
        priority: "MEDIUM",
        user_id: 0,
        task_id: undefined,
      });
      setErrors({});

      // Close dialog
      setIsDialogOpen(false);

      // Show success toast
      toast.success("Reminder created successfully!", {
        description: `${formData.title} has been created and will notify the assigned user.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });

      // Call callback to refresh parent component
      if (onReminderCreated) {
        onReminderCreated();
      }
    } catch (error: unknown) {
      console.error("Error creating reminder:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create reminder";
      setErrors({ submit: errorMessage });

      // Show error toast
      toast.error("Failed to create reminder", {
        description: errorMessage,
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentDate = () => {
    // Get current date in Indian Standard Time (IST)
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    return istTime.toISOString().slice(0, 10);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      due_date: "",
      priority: "MEDIUM",
      user_id: 0,
      task_id: undefined,
    });
    setErrors({});
  };

  const defaultTrigger = (
    <button 
      onClick={() => setIsDialogOpen(true)} 
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
    >
      <Plus className="h-4 w-4" />
      <span>Create Reminder</span>
    </button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {defaultTrigger}
      </DialogTrigger>
      <DialogContent className="min-w-[80vw] min-h-[80vh] overflow-hidden bg-white dark:bg-gray-900">
        <DialogHeader className="pb-6 border-b border-gray-200 dark:border-gray-800">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Plus className="h-5 w-5 text-blue-500" />
            </div>
            Create New Reminder
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
            Fill out the form below to create a new reminder with all necessary details and assignments.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Reminder Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter reminder title"
                    className={`h-10 bg-white border-gray-200 hover:border-orange-300 transition-colors ${errors.title ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'}`}
                  />
                  {errors.title && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.title}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter reminder description and details"
                    rows={3}
                    className={`bg-white border-gray-200 hover:border-orange-300 transition-colors ${errors.description ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'}`}
                  />
                  {errors.description && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.description}
                  </p>}
                </div>
              </div>
            </div>

            {/* Assignment & Context */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                Assignment & Context
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Assign To *</Label>
                  <Select
                    value={formData.user_id === 0 ? "" : formData.user_id.toString()}
                    onValueChange={(value) => handleInputChange('user_id', parseInt(value))}
                  >
                    <SelectTrigger className={`h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${errors.user_id ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
                      <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Select user"} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          <div className="flex flex-col max-w-[200px]">
                            <span className="font-medium truncate" title={user.name}>
                              {user.name.length > 25 ? `${user.name.substring(0, 25)}...` : user.name}
                            </span>
                            <span className="text-xs text-gray-500 truncate" title={`${user.role} • ${user.department}`}>
                              {user.role} • {user.department.length > 15 ? `${user.department.substring(0, 15)}...` : user.department}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.user_id && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.user_id}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Related Task (Optional)</Label>
                  <Select
                    value={formData.task_id?.toString() || "none"}
                    onValueChange={(value) => 
                      handleInputChange('task_id', value === "none" ? undefined : parseInt(value))
                    }
                  >
                    <SelectTrigger className="h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                      <SelectValue placeholder={isLoadingTasks ? "Loading..." : "Select task (optional)"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No task selected</SelectItem>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          <div className="flex flex-col max-w-[200px]">
                            <span className="font-medium truncate" title={task.title}>
                              {task.title.length > 25 ? `${task.title.substring(0, 25)}...` : task.title}
                            </span>
                            <span className="text-xs text-gray-500 truncate" title={`Status: ${task.status} • Priority: ${task.priority}`}>
                              {task.status} • {task.priority}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Priority & Due Date */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                Priority & Due Date
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger className="h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    min={getCurrentDate()}
                    className={`h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${errors.due_date ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'}`}
                  />
                  {errors.due_date && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.due_date}
                  </p>}
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
                disabled={isSubmitting}
                className="px-6 h-10 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 h-10 bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Reminder
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
