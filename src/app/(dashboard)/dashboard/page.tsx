"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ACTION_LABELS, CATEGORY_COLORS } from "@/lib/activity-log";
import { useEvents } from "@/contexts/EventsContext";
import type { ActivityCategory } from "@prisma/client";
import PieChart from "@/components/charts/PieChart";

interface EventStats {
  event: {
    id: string;
    title: string;
    slug: string;
    city: string;
    country: string;
    startAt: string;
    endAt: string;
    currency: string;
    capacityLimit: number | null;
  };
  stats: {
    total: number;
    role: {
      leader: number;
      follower: number;
      switch: number;
    };
    status: {
      registered: number;
      pendingReview: number;
      approved: number;
      confirmed: number;
      waitlist: number;
      rejected: number;
      cancelled: number;
      checkedIn: number;
    };
    payment: {
      paid: number;
      unpaid: number;
      pending: number;
      partiallyPaid: number;
      refunded: number;
      revenue: number;
    };
    countryDistribution: {
      country: string;
      count: number;
    }[];
  };
}

interface Registration {
  id: string;
  fullName: string;
  email: string;
  role: string;
  registrationStatus: string;
  paymentStatus: string;
  createdAt: string;
}

interface ActivityLogEntry {
  id: string;
  actorName: string;
  action: string;
  category: ActivityCategory;
  entityLabel: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  // Use shared events context - single source of truth for events and selected event
  const { events, selectedEventId, loading: eventsLoading } = useEvents();

  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<{ id: string; fullName: string; email: string; status: string; createdAt: string }[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [userName, setUserName] = useState<string>("");

  // Fetch user profile on mount
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const profileRes = await fetch("/api/auth/profile", {
          credentials: "include",
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUserName(profile.fullName);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
    fetchUserProfile();
  }, []);

  // Fetch event stats, registrations, and activity when event changes
  const fetchEventData = useCallback(async () => {
    if (!selectedEventId) return;

    setStatsLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch(`/api/events/${selectedEventId}/stats`, {
        credentials: "include",
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setEventStats(data);
      }

      // Fetch recent registrations
      const eventRes = await fetch(`/api/events/${selectedEventId}`, {
        credentials: "include",
      });
      if (eventRes.ok) {
        const data = await eventRes.json();
        // Get last 5 registrations
        setRecentRegistrations(
          data.registrations
            ?.slice(0, 5)
            .map((r: Registration) => ({
              id: r.id,
              fullName: r.fullName,
              email: r.email,
              role: r.role,
              registrationStatus: r.registrationStatus,
              paymentStatus: r.paymentStatus,
              createdAt: r.createdAt,
            })) || []
        );
      }

      // Fetch recent transfers
      const transfersRes = await fetch(`/api/transfers?eventId=${selectedEventId}`, {
        credentials: "include",
      });
      if (transfersRes.ok) {
        const data = await transfersRes.json();
        setRecentTransfers(data.slice(0, 5));
      }

      // Fetch recent activity for this event
      const activityRes = await fetch(`/api/activity-log?eventId=${selectedEventId}&limit=5`, {
        credentials: "include",
      });
      if (activityRes.ok) {
        const data = await activityRes.json();
        setRecentActivity(data.logs || []);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventData();
    }
  }, [selectedEventId, fetchEventData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
    const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const year = startDate.getFullYear();

    if (startMonth === endMonth) {
      if (startDay === endDay) {
        return `${startMonth} ${startDay}, ${year}`;
      }
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }

    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  };

  const formatCurrency = (cents: number, currency: string = "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "LEADER":
        return (
          <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            L
          </span>
        );
      case "FOLLOWER":
        return (
          <span className="inline-flex items-center justify-center w-5 h-5 bg-pink-100 text-pink-700 rounded text-xs font-medium">
            F
          </span>
        );
      case "SWITCH":
        return (
          <span className="inline-flex items-center justify-center w-5 h-5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
            S
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: ActivityCategory) => {
    const icons: Record<ActivityCategory, JSX.Element> = {
      REGISTRATION: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      PAYMENT: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      COMMUNICATION: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      TEAM: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      EVENT: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      SETTINGS: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };
    return icons[category];
  };

  // Loading state
  if (eventsLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No events state
  if (events.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-500">Welcome{userName ? `, ${userName}` : ""}!</p>
        </div>

        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-500 mb-6">Create your first event to start accepting registrations.</p>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-medium transition shadow-lg shadow-rose-500/25"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Event
          </Link>
        </div>
      </div>
    );
  }

  // Loading stats for selected event
  if (selectedEventId && statsLoading && !eventStats) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No event selected state
  if (!selectedEventId || !eventStats) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-500">Welcome back{userName ? `, ${userName}` : ""}!</p>
        </div>

        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an event</h3>
          <p className="text-gray-500">Choose an event from the sidebar to view its dashboard.</p>
        </div>
      </div>
    );
  }

  const { event, stats } = eventStats;

  return (
    <div className="p-8">
      {/* Event Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <div className="flex items-center gap-4 text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDateRange(event.startAt, event.endAt)}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {event.city}, {event.country}
              </span>
            </div>
          </div>
          <Link
            href={`/events/${event.id}`}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Edit
          </Link>
        </div>
      </div>

      {/* Registration Progress Bar */}
      {event.capacityLimit && (
        <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm mb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.total > event.capacityLimit
                      ? "bg-red-500"
                      : stats.total >= event.capacityLimit * 0.9
                      ? "bg-amber-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min((stats.total / event.capacityLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <span className={`text-sm font-medium whitespace-nowrap ${
              stats.total > event.capacityLimit ? "text-red-600" : "text-gray-600"
            }`}>
              {stats.total}/{event.capacityLimit}
              <span className="text-gray-400 ml-1">
                ({Math.round((stats.total / event.capacityLimit) * 100)}%)
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Stats Row 1: Registrations by role */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          {event.capacityLimit && (
            <p className="text-xs text-gray-400 mt-1">of {event.capacityLimit}</p>
          )}
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Leaders</p>
          <p className="text-3xl font-bold text-blue-600">{stats.role.leader}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Followers</p>
          <p className="text-3xl font-bold text-pink-600">{stats.role.follower}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Confirmed</p>
          <p className="text-3xl font-bold text-green-600">{stats.status.confirmed}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-amber-600">
            {stats.status.registered + stats.status.pendingReview + stats.status.approved}
          </p>
        </div>
      </div>

      {/* Stats Row 2: Status and payment */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Waitlist</p>
          <p className="text-3xl font-bold text-orange-600">{stats.status.waitlist}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Cancelled</p>
          <p className="text-3xl font-bold text-gray-400">{stats.status.cancelled}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Paid</p>
          <p className="text-3xl font-bold text-green-600">{stats.payment.paid}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Unpaid</p>
          <p className="text-3xl font-bold text-red-600">{stats.payment.unpaid}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Revenue</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.payment.revenue, event.currency)}
          </p>
        </div>
      </div>

      {/* Recent Registrations and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Registrations</h2>
            <Link
              href={`/registrations?eventId=${event.id}`}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              View All
            </Link>
          </div>
          {recentRegistrations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No registrations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentRegistrations.map((reg) => (
                <Link
                  key={reg.id}
                  href={`/registrations?eventId=${event.id}&highlight=${reg.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition"
                >
                  {getRoleIcon(reg.role)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{reg.fullName}</p>
                    <p className="text-xs text-gray-500">{formatRelativeTime(reg.createdAt)}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      reg.registrationStatus === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : reg.registrationStatus === "CANCELLED"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {reg.registrationStatus.replace("_", " ").toLowerCase()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <Link
              href={`/settings/activity-log?eventId=${event.id}`}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              View All
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No activity yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 px-5 py-3">
                  <div className={`p-1.5 rounded ${CATEGORY_COLORS[activity.category]}`}>
                    {getCategoryIcon(activity.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{ACTION_LABELS[activity.action] || activity.action}</span>
                      {activity.entityLabel && (
                        <span className="text-gray-500"> - {activity.entityLabel}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {activity.actorName} - {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transfers */}
      {recentTransfers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Transfers</h2>
            <Link
              href={`/transfers?eventId=${event.id}`}
              className="text-rose-500 hover:text-rose-600 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransfers.map((tr) => (
              <div key={tr.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 text-xs font-bold">
                      {tr.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{tr.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{tr.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    tr.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                    tr.status === "CANCELLED" ? "bg-gray-100 text-gray-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {tr.status === "PENDING" ? "Pending" : tr.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(tr.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/events/${event.id}/page-builder`}
            className="bg-white rounded-xl p-5 border border-gray-200 hover:border-rose-300 transition group shadow-sm"
          >
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-rose-200 transition">
              <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">Page Builder</h3>
            <p className="text-gray-500 text-sm">Customize your event page</p>
          </Link>

          <Link
            href={`/registrations?eventId=${event.id}`}
            className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 transition group shadow-sm"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">Registrations</h3>
            <p className="text-gray-500 text-sm">Manage attendees</p>
          </Link>

          <Link
            href={`/events/${event.id}/form-builder`}
            className="bg-white rounded-xl p-5 border border-gray-200 hover:border-purple-300 transition group shadow-sm"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">Registration Forms</h3>
            <p className="text-gray-500 text-sm">Customize form fields</p>
          </Link>
        </div>
      </div>

      {/* Country Distribution - Full Width */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Country Distribution</h2>
        <PieChart
          data={stats.countryDistribution.map((c) => ({
            label: c.country,
            value: c.count,
          }))}
          size={280}
          maxItems={10}
        />
      </div>
    </div>
  );
}
