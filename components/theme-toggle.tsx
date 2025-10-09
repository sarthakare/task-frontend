"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center h-10 w-[4.5rem] rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
      style={{
        backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label="Toggle theme"
    >
      {/* Track background gradient */}
      <span className="sr-only">Toggle theme</span>
      
      {/* Toggle circle with icon */}
      <span
        className={`inline-flex items-center justify-center h-8 w-8 rounded-full shadow-lg transform transition-all duration-300 ease-in-out ${
          isDark ? 'translate-x-[2.25rem] bg-slate-700' : 'translate-x-1 bg-white'
        }`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-blue-400" />
        ) : (
          <Sun className="h-4 w-4 text-yellow-500" />
        )}
      </span>
      
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun className={`h-4 w-4 transition-opacity duration-300 ${isDark ? 'opacity-30 text-slate-400' : 'opacity-0'}`} />
        <Moon className={`h-4 w-4 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-30 text-slate-600'}`} />
      </div>
    </button>
  );
}

