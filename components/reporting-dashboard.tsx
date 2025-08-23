"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getToken } from "@/utils/auth"
import { apiFetch } from "@/lib/api"
import { useEffect, useState } from "react"
import { CircleAlert, TrendingUp, Clock } from "lucide-react"
import { toast } from "sonner"
import { LoadingSpinner } from "./loading-spinner" // added import

type SortBy = 'completion_desc' | 'completion_asc' | 'response_asc' | 'response_desc' | 'overdue_desc'

interface reports {
    userId: string;
    userName: string;
    completedTasks: number;
    totalTasks: number;
    overdueTasks: number;
    escalatedTasks: number;
    completionRate: number; // percentage
    avgResponseTime: number; // in days
    department: string;
    role: string;
}


export function ReportingDashboard() {
    const [reports, setReports] = useState<reports[]>([]);
    const [isLoading, setIsLoading] = useState(true); // added loading state
    // filter & sort state
    const [departmentFilter, setDepartmentFilter] = useState<string>('')
    const [roleFilter, setRoleFilter] = useState<string>('')
    const [search, setSearch] = useState<string>('')
    const [sortBy, setSortBy] = useState<SortBy>('completion_desc')

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

    // compute some global KPIs
    const totalUsers = reports.length
    const avgCompletion = reports.length ? reports.reduce((s, r) => s + r.completionRate, 0) / reports.length : 0
    const totalOverdue = reports.reduce((s, r) => s + r.overdueTasks, 0)

    // static lists (as provided)
    const departments = [
        'Engineering',
        'design',
        'marketing',
        'sales',
        'human resourse',
        'finance',
        'operations',
    ]

    const rolesAll = ['admin', 'manager', 'team lead', 'member']
    // statuses and priorities are intentionally not used here — filters limited to department and role

    // apply filters
    const filteredReports = reports
        .filter(r => {
            if (departmentFilter && r.department !== departmentFilter) return false
            if (roleFilter && r.role !== roleFilter) return false
            // only department and role filters are applied here

            if (search) {
                const q = search.toLowerCase()
                const inName = r.userName.toLowerCase().includes(q)
                const inDept = (r.department || '').toLowerCase().includes(q)
                const inRole = (r.role || '').toLowerCase().includes(q)
                if (!inName && !inDept && !inRole) return false
            }
            return true
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'completion_desc': return b.completionRate - a.completionRate
                case 'completion_asc': return a.completionRate - b.completionRate
                case 'response_asc': return a.avgResponseTime - b.avgResponseTime
                case 'response_desc': return b.avgResponseTime - a.avgResponseTime
                case 'overdue_desc': return b.overdueTasks - a.overdueTasks
                default: return 0
            }
        })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Team Average Completion</p>
                                    <h3 className="text-2xl font-semibold">{avgCompletion.toFixed(1)}%</h3>
                                </div>
                                <div className="p-2 bg-slate-100 rounded-full">
                                    <TrendingUp className="size-5 text-green-600" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <Progress value={Math.min(Math.max(avgCompletion, 0), 100)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Users</p>
                                    <h3 className="text-2xl font-semibold">{totalUsers}</h3>
                                </div>
                                <div className="p-2 bg-slate-100 rounded-full">
                                    <CircleAlert className="size-5 text-slate-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Overdue</p>
                                    <h3 className="text-2xl font-semibold">{totalOverdue}</h3>
                                </div>
                                <div className="p-2 bg-slate-100 rounded-full">
                                    <Clock className="size-5 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Department</label>
                    <select className="border rounded-md p-1" value={departmentFilter} onChange={(e) => { setDepartmentFilter(e.target.value); setRoleFilter('') }}>
                        <option value=''>All</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Role</label>
                    <select className="border rounded-md p-1" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value=''>All</option>
                        {rolesAll.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                {/* status and priority filters removed per request; only department and role remain */}

                <div className="flex items-center gap-2 ml-auto">
                    <input className="border rounded-md p-1" placeholder="Search name, dept, role" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <select className="border rounded-md p-1" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
                        <option value='completion_desc'>Top Completion</option>
                        <option value='completion_asc'>Low Completion</option>
                        <option value='response_asc'>Fast Response</option>
                        <option value='response_desc'>Slow Response</option>
                        <option value='overdue_desc'>Most Overdue</option>
                    </select>
                </div>
            </div>

            {/* Reports grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map((report) => (
                    <Card key={report.userId} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <CardTitle className="text-sm">{report.userName}</CardTitle>
                                    <p className="text-xs text-gray-500">{report.department || '—'} • {report.role || '—'}</p>
                                    <p className="text-xs text-gray-500">{report.completedTasks}/{report.totalTasks} completed</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {report.overdueTasks > 0 && <Badge variant="destructive">{report.overdueTasks} overdue</Badge>}
                                    {report.escalatedTasks > 0 && <Badge variant="secondary">{report.escalatedTasks} escalated</Badge>}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                                    <Progress value={report.completionRate} className="mb-1" />
                                    <p className="text-xs text-gray-500">{report.completionRate.toFixed(1)}%</p>
                                </div>

                                <div className="flex items-center justify-between">
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
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
