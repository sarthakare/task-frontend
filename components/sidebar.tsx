"use client";
import { useEffect } from "react";
import { useUser } from "./user-provider";
import { UserAvatar } from "./user-avatar";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FolderOpen,
  CheckSquare,
  Bell,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  activeMenu?: string;
  onMenuChange?: (menuId: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    id: "user-management",
    label: "User Management",
    icon: <Users className="h-5 w-5" />,
    href: "/users",
  },
  {
    id: "team-management",
    label: "Team Management",
    icon: <UserCheck className="h-5 w-5" />,
    href: "/teams",
  },
  {
    id: "project-management",
    label: "Project Management",
    icon: <FolderOpen className="h-5 w-5" />,
    href: "/projects",
  },
  {
    id: "task-management",
    label: "Task Management",
    icon: <CheckSquare className="h-5 w-5" />,
    href: "/tasks",
  },
  {
    id: "reminders-escalation",
    label: "Reminders & Escalation",
    icon: <Bell className="h-5 w-5" />,
    href: "/reminders",
  },
  {
    id: "reports-analytics",
    label: "Reports & Analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    href: "/reports",
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout, refreshUser, isLoading } = useUser();
  
  // Refresh user data when sidebar loads
  useEffect(() => {
    if (!currentUser && !isLoading) {
      refreshUser();
    }
  }, [currentUser, isLoading, refreshUser]);
  
  // Determine active menu based on current path
  const getActiveMenu = () => {
    if (pathname === "/dashboard") return "dashboard";
    if (pathname === "/users") return "user-management";
    if (pathname === "/teams") return "team-management";
    if (pathname === "/projects") return "project-management";
    if (pathname === "/tasks") return "task-management";
    if (pathname === "/reminders") return "reminders-escalation";
    if (pathname === "/reports") return "reports-analytics";
    return "dashboard";
  };
  
  const activeMenu = getActiveMenu();

  const handleMenuClick = (menuId: string) => {
    // Navigate to the appropriate page based on menu selection
    switch (menuId) {
      case "dashboard":
        router.push("/dashboard");
        break;
      case "user-management":
        router.push("/users");
        break;
      case "team-management":
        router.push("/teams");
        break;
      case "project-management":
        router.push("/projects");
        break;
      case "task-management":
        router.push("/tasks");
        break;
      case "reminders-escalation":
        router.push("/reminders");
        break;
      case "reports-analytics":
        router.push("/reports");
        break;
      default:
        router.push("/dashboard");
        break;
    }
    console.log(`Menu clicked: ${menuId}`);
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-300 shadow-lg",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-slate-700 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
        {!isCollapsed && (
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Task Manager
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto h-8 w-8 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer group"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-3 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer",
              isCollapsed ? "px-2 py-3 justify-center" : "px-4 py-3 justify-start",
              activeMenu === item.id
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <span className={activeMenu === item.id ? "text-white" : ""}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="truncate text-sm">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-3 bg-gray-50 dark:bg-slate-800/50">
        {!isCollapsed ? (
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ) : currentUser ? (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-md border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <UserAvatar name={currentUser.name} size="md" />
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {currentUser.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={logout}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-center text-gray-500 dark:text-gray-400 p-3">
                <p className="font-medium">Task Manager</p>
                <p className="mt-1">v1.0</p>
              </div>
            )}
          </div>
        ) : (
          currentUser && (
            <div className="flex flex-col items-center gap-2">
              <UserAvatar name={currentUser.name} size="sm" />
              <button
                onClick={logout}
                className="h-8 w-8 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
