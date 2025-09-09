"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, CheckCircle2, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import { User, Task, ReminderCreate } from "@/types";

interface ReminderCreateFormProps {
  onReminderCreated?: () => void;
}

export function ReminderCreateForm({ onReminderCreated }: ReminderCreateFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState<ReminderCreate & { task_id: number | undefined }>({
    title: "",
    description: "",
    due_date: "",
    priority: "MEDIUM",
    user_id: 0,
    task_id: undefined,
  });

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [usersResponse, tasksResponse] = await Promise.all([
        api.users.getAllUsers(),
        api.tasks.getAllTasks()
      ]);
      setUsers(usersResponse);
      setTasks(tasksResponse);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load users and tasks", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleDialogOpen = (open: boolean) => {
    setOpen(open);
    if (open) {
      fetchData();
      // Reset form when opening
      setFormData({
        title: "",
        description: "",
        due_date: "",
        priority: "MEDIUM",
        user_id: 0,
        task_id: undefined,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error("Title is required", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
      return;
    }
    if (!formData.due_date) {
      toast.error("Due date is required", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
      return;
    }
    if (!formData.user_id || formData.user_id === 0) {
      toast.error("Please select a user", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
      return;
    }

    setLoading(true);
    try {
      await api.reminders.createReminder({
        ...formData,
        due_date: new Date(formData.due_date).toISOString(),
      });
      
      toast.success("Reminder created successfully!", {
        description: "The reminder has been created and will notify the assigned user.",
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });
      setOpen(false);
      onReminderCreated?.();
    } catch (error: unknown) {
      console.error("Error creating reminder:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create reminder", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Reminder
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Reminder</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading data...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter reminder title"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter reminder description"
                  rows={3}
                  required
                />
              </div>

              {/* Due Date */}
              <div>
                <Label htmlFor="due_date">Due Date & Time</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  min={getCurrentDateTime()}
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned User */}
              <div>
                <Label htmlFor="user_id">Assign To</Label>
                <Select
                  value={formData.user_id === 0 ? "" : formData.user_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, user_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Related Task (Optional) */}
              <div>
                <Label htmlFor="task_id">Related Task (Optional)</Label>
                <Select
                  value={formData.task_id?.toString() || "none"}
                  onValueChange={(value) => 
                    setFormData({ 
                      ...formData, 
                      task_id: value === "none" ? undefined : parseInt(value) 
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No task selected</SelectItem>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Reminder
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
