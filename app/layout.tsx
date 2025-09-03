import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { UserProvider } from "@/components/user-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Comprehensive task and project management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-auto p-5">
              {children}
            </main>
          </div>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
