"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Check if current path is an auth route
  const isAuthRoute = pathname.startsWith("/auth/");
  
  // For auth routes, render children without sidebar
  if (isAuthRoute) {
    return <>{children}</>;
  }
  
  // For all other routes, render with sidebar layout
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-auto p-5">
        {children}
      </main>
    </div>
  );
}
