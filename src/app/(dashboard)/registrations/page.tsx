"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import RegistrationTable from "@/components/registrations/RegistrationTable";

interface Registration {
  id: string;
  fullName: string;
  email: string;
  role: string;
  city: string | null;
  country: string | null;
  registrationStatus: string;
  paymentStatus: string;
  paymentAmount: number | null;
  event: {
    id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
}

export default function RegistrationsPage() {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId");

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState(eventIdFromUrl || "all");

  // Check if we're in single-event mode (filtered by URL param)
  const isSingleEventMode = !!eventIdFromUrl;

  // Update eventFilter when URL param changes
  useEffect(() => {
    if (eventIdFromUrl) {
      setEventFilter(eventIdFromUrl);
    } else {
      setEventFilter("all");
    }
  }, [eventIdFromUrl]);

  const fetchRegistrations = useCallback(async () => {
    try {
      const response = await fetch("/api/registrations", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const filteredRegistrations = registrations.filter((reg) => {
    if (statusFilter !== "all" && reg.registrationStatus !== statusFilter)
      return false;
    if (paymentFilter !== "all" && reg.paymentStatus !== paymentFilter)
      return false;
    if (roleFilter !== "all" && reg.role !== roleFilter) return false;
    if (eventFilter !== "all" && reg.event.id !== eventFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesName = reg.fullName.toLowerCase().includes(searchLower);
      const matchesEmail = reg.email.toLowerCase().includes(searchLower);
      // Only search by event name when not in single-event mode
      const matchesEvent = !isSingleEventMode && reg.event.title.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesEmail && !matchesEvent) return false;
    }
    return true;
  });

  // Get unique events for filter
  const events = Array.from(
    new Map(registrations.map((r) => [r.event.id, r.event])).values()
  );

  // Get current event name when in single-event mode
  const currentEventName = isSingleEventMode
    ? events.find(e => e.id === eventIdFromUrl)?.title
    : null;

  // Use filtered registrations for stats when in single-event mode
  const statsSource = isSingleEventMode ? filteredRegistrations : registrations;

  const stats = {
    total: statsSource.length,
    confirmed: statsSource.filter((r) => r.registrationStatus === "CONFIRMED")
      .length,
    pending: statsSource.filter(
      (r) =>
        r.registrationStatus === "REGISTERED" ||
        r.registrationStatus === "PENDING_REVIEW"
    ).length,
    waitlist: statsSource.filter((r) => r.registrationStatus === "WAITLIST")
      .length,
    paid: statsSource.filter((r) => r.paymentStatus === "PAID").length,
    unpaid: statsSource.filter(
      (r) =>
        r.paymentStatus === "UNPAID" ||
        r.paymentStatus === "PENDING" ||
        r.paymentStatus === "PAYMENT_FAILED"
    ).length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isSingleEventMode ? "Registrations" : "All Registrations"}
        </h1>
        <p className="text-gray-500">
          {isSingleEventMode && currentEventName
            ? `Manage registrations for ${currentEventName}`
            : "Manage registrations across all your events"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Waitlist</p>
          <p className="text-2xl font-bold text-orange-600">{stats.waitlist}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Paid</p>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Unpaid</p>
          <p className="text-2xl font-bold text-red-600">{stats.unpaid}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder={isSingleEventMode ? "Search by name or email..." : "Search by name, email, or event..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />

          {/* Only show event filter when not in single-event mode */}
          {!isSingleEventMode && (
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="APPROVED">Approved</option>
            <option value="REGISTERED">Registered</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="WAITLIST">Waitlist</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="CHECKED_IN">Checked In</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PENDING">Pending</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PAYMENT_FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="REFUND_PENDING">Refund Pending</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Roles</option>
            <option value="LEADER">Leaders</option>
            <option value="FOLLOWER">Followers</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setPaymentFilter("all");
              setRoleFilter("all");
              // Don't reset eventFilter when in single-event mode
              if (!isSingleEventMode) {
                setEventFilter("all");
              }
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            Clear filters
          </button>

          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <RegistrationTable
        registrations={filteredRegistrations}
        onRefresh={fetchRegistrations}
      />
    </div>
  );
}
