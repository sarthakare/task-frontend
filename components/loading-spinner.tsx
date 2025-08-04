import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: number; // diameter per dot, in px
  className?: string;
  message?: string;
  dotColorClass?: string; // tailwind gradient color classes
}

export function LoadingSpinner({
  size = 20,
  className = "",
  message = "Loading...",
  dotColorClass = "from-pink-400 via-purple-400 to-indigo-400",
}: LoadingSpinnerProps) {
  // Dynamic dot sizing
  const dotStyle = {
    width: size,
    height: size,
  };

  // Custom pulse/bounce keyframes
  const keyframes = `
    @keyframes pulse-bounce-1 {
      0%, 60%, 100% { transform: scale(1) }
      30% { transform: scale(1.3) }
    }
    @keyframes pulse-bounce-2 {
      0%, 100% { transform: scale(1) }
      15% { transform: scale(1.15) }
      45% { transform: scale(1.3) }
      85% { transform: scale(1.15) }
    }
    @keyframes pulse-bounce-3 {
      0%, 60%, 100% { transform: scale(1) }
      50% { transform: scale(1.3) }
    }
  `;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-10",
        className
      )}
      aria-busy="true"
      aria-label={message}
    >
      <style>{keyframes}</style>
      <div className="flex space-x-3 mb-4">
        {/* Dot 1 */}
        <span
          className={cn(
            "rounded-full bg-gradient-to-br",
            dotColorClass
          )}
          style={{
            ...dotStyle,
            animation: "pulse-bounce-1 1.1s infinite cubic-bezier(0.6, 0, 0.3, 1)",
            boxShadow: "0 2px 12px 0 rgba(124,58,237,0.18)",
          }}
        />
        {/* Dot 2 */}
        <span
          className={cn(
            "rounded-full bg-gradient-to-br",
            dotColorClass
          )}
          style={{
            ...dotStyle,
            animation: "pulse-bounce-2 1.1s infinite cubic-bezier(0.6, 0, 0.3, 1)",
            boxShadow: "0 2px 12px 0 rgba(232,121,249,0.19)",
          }}
        />
        {/* Dot 3 */}
        <span
          className={cn(
            "rounded-full bg-gradient-to-br",
            dotColorClass
          )}
          style={{
            ...dotStyle,
            animation: "pulse-bounce-3 1.1s infinite cubic-bezier(0.6, 0, 0.3, 1)",
            boxShadow: "0 2px 12px 0 rgba(139,92,246,0.15)",
          }}
        />
      </div>
      {message && (
        <span className="text-center text-base text-gray-700 dark:text-gray-300 tracking-wide font-medium select-none drop-shadow-sm px-3">
          {message}
        </span>
      )}
    </div>
  );
}
