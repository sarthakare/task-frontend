"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/utils/auth";
import { apiFetch } from "@/lib/api";
import { LoadingSpinner } from "./loading-spinner";
import { TaskLog } from "@/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface TaskLogCreationFormProps {
  currentTaskId: number;
}

export function TaskLogManager({ currentTaskId }: TaskLogCreationFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = getToken();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/logs/task/${currentTaskId}`);
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load logs",{
        icon: <CircleAlert  className="text-red-600" />,
        style: { color: "red" },
      });
      } finally {
        setLoading(false);
      }
    };

    if (currentTaskId) fetchLogs();
  }, [currentTaskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };

    try {
      const response = await apiFetch(`/logs/task/${currentTaskId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add log");
      }

      const newLog: TaskLog = await response.json();
      setLogs((prev) => [newLog, ...prev]);
      setFormData({ title: "", description: "", startTime: "", endTime: "" });
      toast.success("Log added successfully", {
      icon: <CheckCircle2 className="text-green-600" />,
      style: { color: "green" },
    });
    } catch {
      toast.error("Log creation failed. Please try again.",{
        icon: <CircleAlert  className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Log</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">
                Log Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter log title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter log description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="start">
                  Start Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">
                  End Time<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Adding..." : "Add Log"}
            </Button>
          </form>
        </div>

        {/* Logs List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="space-y-4">
            {loading ? (
              <LoadingSpinner size={18} message="Loading logs..." />
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No logs added yet.
              </p>
            ) : (
              <Table>
                <TableCaption>A list of your recent logs.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.title}</TableCell>
                      <TableCell className="p-2">{log.description}</TableCell>
                      <TableCell className="p-2 text-gray-600">
                        {new Date(log.startTime).toLocaleString()}
                      </TableCell>
                      <TableCell className="p-2 text-gray-600">
                        {log.endTime
                          ? new Date(log.endTime).toLocaleString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
