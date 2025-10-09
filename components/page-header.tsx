"use client";

import { Button } from "./ui/button";
import { useUser } from "./user-provider";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { NotificationBell } from "./notification-bell";
import { UserAvatar } from "./user-avatar";
import { ThemeToggle } from "./theme-toggle";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const { currentUser, logout } = useUser();

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">{title}</h1>
        {description && (
          <p className="text-gray-600 dark:text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {action && <div>{action}</div>}
        <NotificationBell className="cursor-pointer"/>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer">
              <UserAvatar name={currentUser?.name || "User"} size="sm" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">{currentUser?.name || "User"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 shadow-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0 rounded-xl overflow-hidden">
            <div className="p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <UserAvatar name={currentUser?.name || "User"} size="lg" />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">{currentUser?.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{currentUser?.email}</div>
                </div>
              </div>
              {currentUser?.mobile && (
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span>📱</span>
                  <span>{currentUser.mobile}</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                  <div className="text-gray-500 dark:text-gray-400">Role</div>
                  <div className="font-medium text-gray-900 dark:text-white">{currentUser?.role}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                  <div className="text-gray-500 dark:text-gray-400">Department</div>
                  <div className="font-medium text-gray-900 dark:text-white truncate">{currentUser?.department}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Member since {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded-b-xl">
              <DropdownMenuItem 
                onClick={logout}
                className="cursor-pointer rounded-lg py-2.5 focus:bg-red-50 dark:focus:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
                <span className="text-red-600 dark:text-red-400 font-medium">Logout</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
