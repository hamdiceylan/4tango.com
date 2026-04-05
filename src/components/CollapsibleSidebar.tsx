"use client";

import { useState, useEffect, createContext, useContext } from "react";
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

interface CollapsibleSidebarProps {
  children: React.ReactNode;
  logo: React.ReactNode;
  userSection: React.ReactNode;
}

export default function CollapsibleSidebar({
  children,
  logo,
  userSection,
}: CollapsibleSidebarProps) {
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

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          {logo}
        </div>
        {children}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          {userSection}
        </div>
      </aside>
    );
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Header with logo and toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {isCollapsed ? (
            <Link href="/dashboard" className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto">
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
              isCollapsed ? "absolute -right-3 top-5 bg-white border border-gray-200 shadow-sm" : ""
            }`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
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
        {children}

        {/* User section at bottom */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white ${isCollapsed ? "px-2" : ""}`}>
          {userSection}
        </div>
      </aside>
    </SidebarContext.Provider>
  );
}
