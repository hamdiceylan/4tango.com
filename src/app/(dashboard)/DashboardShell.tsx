"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import Link from "next/link";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

const STORAGE_KEY = "4tango_sidebar_collapsed";

interface DashboardShellProps {
  children: ReactNode;
  userInitials: string;
  userName: string;
  userEmail: string;
}

export default function DashboardShell({
  children,
  userInitials,
  userName,
  userEmail,
}: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") {
      setIsCollapsed(true);
    }
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(STORAGE_KEY, String(newState));
  };

  // Extract nav and main content from children
  const childArray = Array.isArray(children) ? children : [children];
  const navContent = childArray[0];
  const mainContent = childArray.slice(1);

  // Use expanded width during SSR to prevent layout shift
  const sidebarWidth = mounted ? (isCollapsed ? "w-16" : "w-64") : "w-64";
  const mainMargin = mounted ? (isCollapsed ? "ml-16" : "ml-64") : "ml-64";

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ${sidebarWidth}`}
        >
          {/* Header with logo and toggle */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
            {isCollapsed && mounted ? (
              <Link
                href="/dashboard"
                className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto"
              >
                <span className="text-white font-bold text-sm">4T</span>
              </Link>
            ) : (
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">4T</span>
                </div>
                <span className="text-gray-900 font-bold text-xl">4Tango</span>
              </Link>
            )}
            <button
              onClick={toggleSidebar}
              className={`p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition ${
                isCollapsed && mounted
                  ? "absolute -right-3 top-5 bg-white border border-gray-200 shadow-sm z-50"
                  : ""
              }`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isCollapsed && mounted ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          </div>

          {/* Navigation content */}
          {navContent}

          {/* User section at bottom */}
          <div
            className={`absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white transition-all duration-300 ${
              isCollapsed && mounted ? "p-2" : "p-4"
            }`}
          >
            {isCollapsed && mounted ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-sm">{userInitials}</span>
                </div>
                <Link
                  href="/api/auth/logout"
                  prefetch={false}
                  className="text-gray-400 hover:text-gray-600 transition p-1"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold">{userInitials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm font-medium truncate">{userName}</p>
                  <p className="text-gray-500 text-xs truncate">{userEmail}</p>
                </div>
                <Link
                  href="/api/auth/logout"
                  prefetch={false}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className={`min-h-screen transition-all duration-300 ${mainMargin}`}>
          {mainContent}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
