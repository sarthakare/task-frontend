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
import type { Task, TaskPriority, User } from "@/types";
import { getToken } from "@/utils/auth";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/loading-spinner";
import { apiFetch } from "@/lib/api";
import { DateTimePicker } from "./dateTimePicker";

interface TaskEditFormProps {
  task: Task;
  onTaskUpdated: () => void;
}

export function TaskEditForm({ task, onTaskUpdated }: TaskEditFormProps) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    assignedTo: task.assigned_to || 0,
    priority: task.priority || "LOW",
    startDate: task.start_date,
    dueDate: task.due_date,
    followUpDate: task.follow_up_date || "",
    tags: task.tags || [],
  });

  const [newTag, setNewTag] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxTags = 10;

  // 🔹 Fetch users list
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateDates = (data: typeof formData) => {
    const { startDate, dueDate, followUpDate } = data;
    const newErrors: Record<string, string> = {};

    if (!startDate) newErrors.startDate = "Start date is required.";
    if (!dueDate) newErrors.dueDate = "Due date is required.";

    if (!newErrors.startDate && !newErrors.dueDate) {
      const s = new Date(startDate);
      const d = new Date(dueDate);
      if (isNaN(s.getTime()) || isNaN(d.getTime())) {
        newErrors.dueDate = "Invalid start or due date.";
      } else if (followUpDate) {
        const f = new Date(followUpDate);
        if (isNaN(f.getTime())) {
          newErrors.followUpDate = "Invalid follow-up date.";
        } else if (!(s < f && f < d)) {
          newErrors.followUpDate = "Follow-up date must be after start date and before due date.";
        }
      } else {
        if (!(s < d)) {
          newErrors.dueDate = "Due date must be after start date.";
        }
      }
    }

    return newErrors;
  };

  const handleDateChange = (field: "startDate" | "dueDate" | "followUpDate", val: string) => {
    const updated = { ...formData, [field]: val };
    setFormData(updated);
    const errs = validateDates(updated);
    setErrors(errs);
  };

  // 🔹 Update Task handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // clear previous errors
    setErrors({});

    // validate before submitting
    const newErrors = validateDates(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

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
      console.log("Updating task with payload:", payload);

      const response = await apiFetch(`/tasks/${task.id}`, {
        method: "PUT", // ✅ Update endpoint
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update task");
      }

      const updatedTask: Task = await response.json();
      onTaskUpdated();

      toast.success(`"${updatedTask.title}" Task updated successfully!`, {
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });
    } catch (err) {
      console.error("Error updating task:", err);
      toast.error("Task update failed. Please try again.", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔹 Tag handlers
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
              <Label htmlFor="title">
                Task Title<span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
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
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">
                Assign To<span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.assignedTo.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedTo: parseInt(value) })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select user" />
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
              <Label htmlFor="priority">
                Priority<span className="text-red-500">*</span>
              </Label>
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
                onChange={(val) => handleDateChange("startDate", val)}
                required
              />
              {errors.startDate && (
                <div className="text-xs text-red-500 mt-1">{errors.startDate}</div>
              )}
            </div>

            <div className="space-y-2">
              <DateTimePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(val) => handleDateChange("dueDate", val)}
                required
              />
              {errors.dueDate && (
                <div className="text-xs text-red-500 mt-1">{errors.dueDate}</div>
              )}
            </div>

            <div className="space-y-2">
              <DateTimePicker
                label="Follow-up Date"
                value={formData.followUpDate}
                onChange={(val) => handleDateChange("followUpDate", val)}
              />
              {errors.followUpDate && (
                <div className="text-xs text-red-500 mt-1">{errors.followUpDate}</div>
              )}
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
              {isSubmitting ? "Updating..." : "Update Task"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
