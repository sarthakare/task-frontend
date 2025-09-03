"use client";

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
  UserCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "./user-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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
  const { currentUser, logout } = useUser();
  
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
        "flex flex-col border-r bg-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">Task Manager</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeMenu === item.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3",
              isCollapsed ? "px-2" : "px-3",
              activeMenu === item.id
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            onClick={() => handleMenuClick(item.id)}
          >
            {item.icon}
            {!isCollapsed && (
              <span className="truncate">{item.label}</span>
            )}
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        {!isCollapsed && currentUser ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {currentUser.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser.role}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <UserCircle className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="text-red-600">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            <p>Task Manager v1.0</p>
            <p className="mt-1">© 2024 All rights reserved</p>
          </div>
        )}
      </div>
    </div>
  );
}
