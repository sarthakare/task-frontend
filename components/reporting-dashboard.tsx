"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getToken } from "@/utils/auth"
import { apiFetch } from "@/lib/api"
import { useEffect, useState } from "react"
import { CircleAlert } from "lucide-react"
import { toast } from "sonner"
import { LoadingSpinner } from "./loading-spinner" // added import

interface reports {
    userId: string;
    userName: string;
    completedTasks: number;
    totalTasks: number;
    overdueTasks: number;
    escalatedTasks: number;
    completionRate: number; // percentage
    avgResponseTime: number; // in days
}


export function ReportingDashboard() {
    const [reports, setReports] = useState<reports[]>([]);
    const [isLoading, setIsLoading] = useState(true); // added loading state

    const fetchReports = async () => {
        setIsLoading(true); // show loader while fetching
        try {
            const token = getToken();

            const response = await apiFetch("/reports/all", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch reports");
            }

            const data = await response.json();
            setReports(data);

        } catch (error) {
            console.error("Error fetching reports:", error);
            toast.error("Failed to fetch records", {
                icon: <CircleAlert className="text-red-600" />,
                style: { color: "red" },
            });
        } finally {
            setIsLoading(false); // hide loader when done
        }
    }

    // Fetch reports on component mount
    useEffect(() => {
        fetchReports();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Individual Reports */}
            <Card>
                <CardHeader>
                    <CardTitle>Individual Performance Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div key={report.userId} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold">{report.userName}</h3>
                                    <div className="flex gap-2">
                                        <Badge variant="outline">
                                            {report.completedTasks}/{report.totalTasks} completed
                                        </Badge>
                                        {report.overdueTasks > 0 && <Badge variant="destructive">{report.overdueTasks} overdue</Badge>}
                                        {report.escalatedTasks > 0 && <Badge variant="secondary">{report.escalatedTasks} escalated</Badge>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                                        <Progress value={report.completionRate} className="mb-1" />
                                        <p className="text-xs text-gray-500">{report.completionRate.toFixed(1)}%</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Avg Response Time</p>
                                        <p className="text-lg font-semibold">{report.avgResponseTime} days</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Task Load</p>
                                        <p className="text-lg font-semibold">{report.totalTasks} tasks</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
