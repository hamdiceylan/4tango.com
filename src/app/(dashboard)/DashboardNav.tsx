"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { OrganizerRole } from "@prisma/client";
import { hasPermission, type Permission } from "@/lib/permissions";
import { useEvents } from "@/contexts/EventsContext";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  permission?: Permission;
}

// Icons object
const icons: Record<string, React.ReactNode> = {
  overview: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  pageBuilder: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  forms: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  registrations: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  packages: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  eventSettings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  allEvents: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  activityLog: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  team: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

export default function DashboardNav() {
  const pathname = usePathname();
  const { events, selectedEventId, selectedEvent, loading, selectEvent } = useEvents();
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [userRole, setUserRole] = useState<OrganizerRole | null>(null);

  // Fetch user role
  useEffect(() => {
    async function fetchRole() {
      try {
        const profileRes = await fetch("/api/auth/profile", {
          credentials: "include",
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUserRole(profile.role);
        }
      } catch {
        // Ignore errors
      }
    }
    fetchRole();
  }, []);

  const handleEventSelect = (eventId: string) => {
    selectEvent(eventId);
    setShowEventDropdown(false);
  };

  // Permission checks
  const canViewTeam = userRole && hasPermission(userRole, "org:team:view");

  // Event-specific navigation items
  const eventNavItems: NavItem[] = [
    { name: "Overview", href: `/dashboard`, icon: "overview", permission: "event:view" },
    { name: "Page Builder", href: `/events/${selectedEventId}/page-builder`, icon: "pageBuilder", permission: "landing:edit" },
    { name: "Registration Forms", href: `/events/${selectedEventId}/form-builder`, icon: "forms", permission: "form:edit" },
    { name: "Registrations", href: `/registrations?eventId=${selectedEventId}`, icon: "registrations", permission: "registration:view" },
    { name: "Event Settings", href: `/events/${selectedEventId}`, icon: "eventSettings", permission: "event:edit" },
  ];

  // Organization navigation items
  const orgNavItems: NavItem[] = [
    { name: "All Events", href: "/events", icon: "allEvents", permission: "event:view" },
    { name: "Activity Log", href: "/settings/activity-log", icon: "activityLog", permission: "org:settings:view" },
    { name: "Settings", href: "/settings", icon: "settings", permission: "org:settings:view" },
  ];

  const isActivePath = (href: string) => {
    // Handle URLs with query parameters (e.g., /registrations?eventId=...)
    const hrefPath = href.split("?")[0];

    // Exact matches
    if (pathname === hrefPath) {
      return true;
    }

    // Special case: /events should only match /events exactly or /events/new
    if (hrefPath === "/events") {
      return pathname === "/events" || pathname === "/events/new";
    }

    // Special case: /settings should only match /settings or /settings/team (not /settings/activity-log)
    if (hrefPath === "/settings") {
      return pathname === "/settings" || pathname === "/settings/team";
    }

    // Special case: Event Settings (/events/[id]) should only match exactly
    if (hrefPath.match(/^\/events\/[^/]+$/) && !hrefPath.includes("page-builder") && !hrefPath.includes("form-builder")) {
      return pathname === hrefPath;
    }

    // For other paths, check if pathname starts with hrefPath + "/"
    return pathname.startsWith(hrefPath + "/");
  };

  return (
    <div className="flex flex-col h-[calc(100%-4rem)]">
      {/* Event Selector - Always visible at top */}
      <div className="px-4 py-3 border-b border-gray-100">
        {loading ? (
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ) : events.length === 0 ? (
          <Link
            href="/events/new"
            className="flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Event
          </Link>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowEventDropdown(!showEventDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {selectedEvent?.title || "Select event"}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${showEventDropdown ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {showEventDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventSelect(event.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition ${
                      event.id === selectedEventId ? "bg-rose-50" : ""
                    }`}
                  >
                    {event.id === selectedEventId && (
                      <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span
                      className={`text-sm truncate ${
                        event.id === selectedEventId ? "font-medium text-rose-600 ml-0" : "text-gray-700 ml-6"
                      }`}
                    >
                      {event.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Event Section */}
        {selectedEvent ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
              Event
            </p>
            {eventNavItems.map((item) => {
              if (item.permission && userRole && !hasPermission(userRole, item.permission)) {
                return null;
              }
              const isActive = isActivePath(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {icons[item.icon]}
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        ) : events.length > 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Select an event to get started</p>
          </div>
        ) : null}

        {/* Organization Section */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
            Organization
          </p>
          {orgNavItems.map((item) => {
            if (item.permission && userRole && !hasPermission(userRole, item.permission)) {
              return null;
            }
            const isActive = isActivePath(item.href);
            const isSettingsActive = item.href === "/settings" && pathname.startsWith("/settings");

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                    isActive && item.href !== "/settings"
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                      : isSettingsActive
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {icons[item.icon]}
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>

                {/* Settings sub-navigation - Team */}
                {item.href === "/settings" && isSettingsActive && canViewTeam && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link
                      href="/settings/team"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                        pathname === "/settings/team"
                          ? "bg-rose-100 text-rose-700"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {icons.team}
                      Team
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
