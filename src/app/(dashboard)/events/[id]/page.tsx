"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import CustomDomainCard from "@/components/events/CustomDomainCard";

interface Registration {
  id: string;
  fullName: string;
  email: string;
  role: string;
  city: string | null;
  country: string | null;
  experience: string | null;
  registrationStatus: string;
  paymentStatus: string;
  paymentAmount: number | null;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  city: string;
  country: string;
  venueName: string | null;
  address: string | null;
  startAt: string;
  endAt: string;
  currency: string;
  priceAmount: number;
  capacityLimit: number | null;
  status: string;
  djs: string[];
  registrations: Registration[];
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [copied, setCopied] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`, { credentials: "include" });
        if (!response.ok) {
          throw new Error("Event not found");
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">{error || "Event not found"}</p>
          <Link href="/events" className="text-rose-500 hover:underline mt-4 inline-block">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const registrations = event.registrations || [];
  const stats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.registrationStatus === "CONFIRMED").length,
    pending: registrations.filter(r => r.registrationStatus === "REGISTERED").length,
    waitlist: registrations.filter(r => r.registrationStatus === "WAITLIST").length,
    leaders: registrations.filter(r => r.role === "LEADER").length,
    followers: registrations.filter(r => r.role === "FOLLOWER").length,
    revenue: registrations.filter(r => r.paymentStatus === "PAID").reduce((sum, r) => sum + (r.paymentAmount || 0), 0) / 100,
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${event.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Role", "City", "Country", "Status", "Payment", "Registered", "Experience"];
    const rows = registrations.map(r => [
      r.fullName, r.email, r.role, r.city || "", r.country || "", r.registrationStatus, r.paymentStatus, r.createdAt, r.experience || ""
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}-registrations.csv`;
    a.click();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const updateStatus = async (newStatus: string) => {
    if (!event || updating) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/events/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      setEvent({ ...event, status: newStatus });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/events" className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </Link>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              event.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {event.status.toLowerCase()}
            </span>
          </div>
          <p className="text-gray-500">{event.city}, {event.country} · {formatDate(event.startAt)} to {formatDate(event.endAt)}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Total Registrations</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total} <span className="text-gray-400 text-sm font-normal">/ {event.capacityLimit || "∞"}</span></p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Balance</p>
          <p className="text-2xl font-bold text-gray-900">{stats.leaders}L / {stats.followers}F</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{stats.revenue.toLocaleString()} {event.currency}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-4 font-medium transition relative ${
                activeTab === tab.id
                  ? "text-rose-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Details */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-gray-500 text-sm">Description</dt>
                <dd className="text-gray-900">{event.shortDescription || "-"}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-gray-500 text-sm">Start</dt>
                  <dd className="text-gray-900">{formatDate(event.startAt)} at {formatTime(event.startAt)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-sm">End</dt>
                  <dd className="text-gray-900">{formatDate(event.endAt)} at {formatTime(event.endAt)}</dd>
                </div>
              </div>
              <div>
                <dt className="text-gray-500 text-sm">Venue</dt>
                <dd className="text-gray-900">{event.venueName || "-"}{event.address ? `, ${event.address}` : ""}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-gray-500 text-sm">Price</dt>
                  <dd className="text-gray-900">{(event.priceAmount / 100).toFixed(2)} {event.currency}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-sm">Capacity</dt>
                  <dd className="text-gray-900">{event.capacityLimit || "Unlimited"} dancers</dd>
                </div>
              </div>
              {event.djs && event.djs.length > 0 && (
                <div>
                  <dt className="text-gray-500 text-sm">DJs</dt>
                  <dd className="flex flex-wrap gap-2 mt-1">
                    {event.djs.map((dj, i) => (
                      <span key={i} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm">{dj}</span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email All Participants</p>
                  <p className="text-gray-500 text-sm">Send an update to all registered dancers</p>
                </div>
              </button>
              <button onClick={exportCSV} className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Export Registrations</p>
                  <p className="text-gray-500 text-sm">Download CSV with all participant data</p>
                </div>
              </button>
              <button onClick={copyLink} className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  {copied ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{copied ? "Link Copied!" : "Copy Registration Link"}</p>
                  <p className="text-gray-500 text-sm">Share the public event page</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add Manual Registration</p>
                  <p className="text-gray-500 text-sm">Register a dancer manually</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Custom Domain */}
          <CustomDomainCard eventId={event.id} eventSlug={event.slug} />

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Status</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => updateStatus("PUBLISHED")}
                disabled={updating}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  event.status === "PUBLISHED"
                    ? "bg-green-100 text-green-700 border-2 border-green-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } disabled:opacity-50`}
              >
                {updating && event.status !== "PUBLISHED" ? "..." : "Published"}
              </button>
              <button
                onClick={() => updateStatus("DRAFT")}
                disabled={updating}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  event.status === "DRAFT"
                    ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } disabled:opacity-50`}
              >
                Draft
              </button>
              <button
                onClick={() => updateStatus("CLOSED")}
                disabled={updating}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  event.status === "CLOSED"
                    ? "bg-red-100 text-red-700 border-2 border-red-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } disabled:opacity-50`}
              >
                Closed
              </button>
            </div>
            {event.status === "PUBLISHED" && (
              <p className="text-green-600 text-sm mt-3">
                Your event is live at: <a href={`/${event.slug}`} target="_blank" className="underline font-medium">{window.location.origin}/{event.slug}</a>
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Registration Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Balance Control</p>
                  <p className="text-gray-500 text-sm">Maintain leader/follower balance</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500" />
              </label>
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Waitlist</p>
                  <p className="text-gray-500 text-sm">Enable waitlist when full</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500" />
              </label>
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Manual Approval</p>
                  <p className="text-gray-500 text-sm">Require approval before confirmation</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500" />
              </label>
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-gray-600 text-sm mb-4">These actions cannot be undone.</p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium">
                Cancel Event
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
