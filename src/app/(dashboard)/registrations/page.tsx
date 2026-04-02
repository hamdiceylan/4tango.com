"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import RegistrationTable from "@/components/registrations/RegistrationTable";

interface CustomFieldValue {
  id: string;
  fieldId: string;
  value: string;
}

interface FormField {
  id: string;
  name: string;
  label: string;
  fieldType: string;
  options?: { value: string; label: string }[] | null;
}

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
  customFieldValues?: CustomFieldValue[];
}

export default function RegistrationsPage() {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId");

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Always filter by event from URL
  const eventFilter = eventIdFromUrl || "all";

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

  // Fetch form fields for the selected event
  const fetchFormFields = useCallback(async () => {
    if (!eventIdFromUrl) {
      setFormFields([]);
      return;
    }
    try {
      const response = await fetch(`/api/events/${eventIdFromUrl}/form-fields`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFormFields(data);
      }
    } catch (error) {
      console.error("Error fetching form fields:", error);
    }
  }, [eventIdFromUrl]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  useEffect(() => {
    fetchFormFields();
  }, [fetchFormFields]);

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
      if (!matchesName && !matchesEmail) return false;
    }
    return true;
  });

  // Get current event name
  const currentEvent = registrations.find(r => r.event.id === eventIdFromUrl)?.event;

  // Use filtered registrations for stats
  const statsSource = filteredRegistrations;

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
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Registrations
        </h1>
        {currentEvent && (
          <p className="text-gray-500 text-sm">{currentEvent.title}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
          <p className="text-gray-400 text-xs">Total</p>
          <p className="text-lg font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
          <p className="text-gray-400 text-xs">Confirmed</p>
          <p className="text-lg font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
          <p className="text-gray-400 text-xs">Pending</p>
          <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
          <p className="text-gray-400 text-xs">Waitlist</p>
          <p className="text-lg font-bold text-orange-600">{stats.waitlist}</p>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
          <p className="text-gray-400 text-xs">Paid</p>
          <p className="text-lg font-bold text-green-600">{stats.paid}</p>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
          <p className="text-gray-400 text-xs">Unpaid</p>
          <p className="text-lg font-bold text-red-600">{stats.unpaid}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
            className="px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PARTIALLY_PAID">Partial</option>
            <option value="PENDING">Pending</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PAYMENT_FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Roles</option>
            <option value="LEADER">Leaders</option>
            <option value="FOLLOWER">Followers</option>
          </select>

          {(search || statusFilter !== "all" || paymentFilter !== "all" || roleFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPaymentFilter("all");
                setRoleFilter("all");
              }}
              className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <RegistrationTable
        registrations={filteredRegistrations}
        onRefresh={fetchRegistrations}
        hideEventColumn={true}
        formFields={formFields}
      />
    </div>
  );
}
