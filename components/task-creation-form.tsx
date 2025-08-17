"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import type { Task, User } from "@/types";
import { getToken } from "@/utils/auth";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/loading-spinner";
import { apiFetch } from "@/lib/api";
import { DateTimePicker } from "./dateTimePicker";

interface TaskCreationFormProps {
  currentUser: User;
  onTaskCreated: (task: Task) => void;
}

type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export function TaskCreationForm({
  currentUser,
  onTaskCreated,
}: TaskCreationFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: currentUser.id,
    priority: "MEDIUM" as TaskPriority,
    startDate: "", // 🔹 Added
    dueDate: "",
    followUpDate: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const maxTags = 10;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users that current user can assign tasks to
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const res = await apiFetch("/users/all");
        if (!res.ok) throw new Error("Failed to fetch users");
        const usersData = await res.json();
        setUsers(usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error("Failed to load users", {
          icon: <CircleAlert className="text-red-600" />,
          style: { color: "red" },
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const token = getToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // 🔹 Disable button immediately

    const payload = {
      title: formData.title,
      description: formData.description,
      assigned_to: formData.assignedTo,
      priority: formData.priority,
      start_date: formData.startDate,
      due_date: formData.dueDate,
      follow_up_date: formData.followUpDate || null,
      tags: formData.tags,
    };

    try {
      console.log("Sending payload:", payload);
      const response = await apiFetch("/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create task");
      }

      const newTask: Task = await response.json();
      onTaskCreated(newTask);

      toast.success(`"${newTask.title}" Task created successfully!`, {
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });
    } catch {
      toast.error("Task creation failed. Please try again.", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setIsSubmitting(false); // 🔹 Re-enable button
    }
  };

  const addTag = () => {
    if (
      newTag.trim() &&
      !formData.tags.includes(newTag.trim()) &&
      formData.tags.length < maxTags
    ) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className="overflow-y-auto p-4">
      {isLoadingUsers ? (
        <div className="mt-2">
          <LoadingSpinner size={16} message="Loading users..." />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title">Task Title<span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter task title..."
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter task description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To<span className="text-red-500">*</span></Label>
              <Select
                value={formData.assignedTo.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedTo: parseInt(value) })
                }
                disabled={isLoadingUsers}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingUsers ? "Loading users..." : "Select user"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.department} - {user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority<span className="text-red-500">*</span></Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="w-full">
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
              <DateTimePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(val) => setFormData({ ...formData, startDate: val })}
                required
              />
            </div>

            <div className="space-y-2">
              <DateTimePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(val) => setFormData({ ...formData, dueDate: val })}
                required
              />
            </div>

            <div className="space-y-2">
              <DateTimePicker
                label="Follow-up Date"
                value={formData.followUpDate}
                onChange={(val) => setFormData({ ...formData, followUpDate: val })}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(),
                    formData.tags.length < maxTags && addTag())
                }
                disabled={formData.tags.length >= maxTags}
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                disabled={formData.tags.length >= maxTags}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            {formData.tags.length >= maxTags && (
              <div className="text-xs text-red-500 mt-1">
                Max 10 tags are allowed.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
