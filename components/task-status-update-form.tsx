"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/utils/auth";
import { apiFetch } from "@/lib/api";
import { Task } from "@/types";

interface TaskStatusManagerProps {
  currentTaskId: number;
  currentStatus: Task["status"];
  reloadTasks: () => void;
}

const STATUS_OPTIONS: Task["status"][] = [
  "NEW",
  "IN_PROGRESS",
  "PENDING",
  "FINISHED",
  "STOPPED",
  "CANCELLED",
];

export function TaskStatusManager({
  currentTaskId,
  currentStatus,
  reloadTasks,
}: TaskStatusManagerProps) {
  const [status, setStatus] = useState<Task["status"]>(currentStatus);
  const [loading, setLoading] = useState(false);
  const token = getToken();

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    try {
      setLoading(true);
      const res = await apiFetch(`/tasks/${currentTaskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update status");
      }

      toast.success("Task status updated successfully", {
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });
      reloadTasks(); // 🔹 Fetch updated data from backend
    } catch (err) {
      console.error(err);
      toast.error("Status update failed. Please try again.", {
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>
            Task Status<span className="text-red-500">*</span>
          </Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as Task["status"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating..." : "Update Status"}
        </Button>
      </form>
    </div>
  );
}
