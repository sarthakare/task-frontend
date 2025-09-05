"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import { getUser, getToken } from "@/utils/auth";
import { useRouter } from "next/navigation";

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  logout: () => void;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = () => {
    const user = getUser();
    const token = getToken();
    
    // Only set user if token exists
    if (token && user) {
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
    setIsLoading(false);
  };

  const refreshUser = () => {
    setIsLoading(true);
    loadUser();
  };

  useEffect(() => {
    loadUser();

    // Listen for storage changes (when user logs in/out from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authChange' || e.key === null) {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array - only run once on mount

  // Separate effect for periodic auth checking to avoid dependency issues
  useEffect(() => {
    const checkAuthInterval = setInterval(() => {
      const user = getUser();
      const token = getToken();
      
      // If token/user state doesn't match current state, refresh
      if ((!token || !user) && currentUser) {
        setCurrentUser(null);
      } else if (token && user && !currentUser) {
        setCurrentUser(user);
      }
    }, 1000); // Check every second

    return () => {
      clearInterval(checkAuthInterval);
    };
  }, [currentUser]); // Only depend on currentUser for the polling check

  const logout = () => {
    setCurrentUser(null);
    // Clear cookies and redirect to login
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Trigger storage event for other tabs
    localStorage.setItem('authChange', Date.now().toString());
    localStorage.removeItem('authChange');
    
    router.push("/auth/login");
  };

  const value = {
    currentUser,
    setCurrentUser,
    isLoading,
    logout,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
