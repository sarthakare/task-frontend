"use client";

import { Button } from "./ui/button";
import { useUser } from "./user-provider";
import { UserCircle, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {action && <div>{action}</div>}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <UserCircle className="h-4 w-4 mr-2" />
              {currentUser?.name || "User"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <div className="px-2 py-1.5 text-sm text-gray-500 border-b">
              <div className="font-medium text-gray-900">{currentUser?.name}</div>
              <div>{currentUser?.email}</div>
              {currentUser?.mobile && <div>📱 {currentUser.mobile}</div>}
            </div>
            <div className="px-2 py-1.5 text-xs text-gray-500 border-b">
              <div>Role: {currentUser?.role}</div>
              <div>Department: {currentUser?.department}</div>
              <div>Member since: {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}</div>
            </div>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-red-600">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
