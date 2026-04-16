"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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

interface EventPackage {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  capacity: number | null;
  order: number;
  isActive: boolean;
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
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "packages" | "notifications">("overview");
  const [copied, setCopied] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Package management state
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [editingPackage, setEditingPackage] = useState<EventPackage | null>(null);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [draggedPkgIndex, setDraggedPkgIndex] = useState<number | null>(null);
  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    price: "",
    currency: "EUR",
    capacity: "",
    isActive: true,
  });

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

  // Fetch packages when tab changes to packages
  useEffect(() => {
    if (activeTab === "packages" && event) {
      fetchPackages();
    }
  }, [activeTab, event?.id]);

  async function fetchPackages() {
    if (!event) return;
    setPackagesLoading(true);
    try {
      const response = await fetch(`/api/events/${event.id}/packages`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    } finally {
      setPackagesLoading(false);
    }
  }

  function resetPackageForm() {
    setPackageForm({
      name: "",
      description: "",
      price: "",
      currency: "EUR",
      capacity: "",
      isActive: true,
    });
    setEditingPackage(null);
    setShowPackageForm(false);
  }

  function openEditPackage(pkg: EventPackage) {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      description: pkg.description || "",
      price: (pkg.price / 100).toString(),
      currency: pkg.currency,
      capacity: pkg.capacity?.toString() || "",
      isActive: pkg.isActive,
    });
    setShowPackageForm(true);
  }

  async function savePackage() {
    if (!event || !packageForm.name || !packageForm.price) return;
    setUpdating(true);
    try {
      const priceInCents = Math.round(parseFloat(packageForm.price) * 100);
      const payload = {
        name: packageForm.name,
        description: packageForm.description || null,
        price: priceInCents,
        currency: packageForm.currency,
        capacity: packageForm.capacity ? parseInt(packageForm.capacity) : null,
        isActive: packageForm.isActive,
      };

      const url = editingPackage
        ? `/api/events/${event.id}/packages/${editingPackage.id}`
        : `/api/events/${event.id}/packages`;
      const method = editingPackage ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        await fetchPackages();
        resetPackageForm();
      }
    } catch (err) {
      console.error("Failed to save package:", err);
    } finally {
      setUpdating(false);
    }
  }

  async function deletePackage(pkgId: string) {
    if (!event || !confirm("Are you sure you want to delete this package?")) return;
    try {
      const response = await fetch(`/api/events/${event.id}/packages/${pkgId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        await fetchPackages();
      }
    } catch (err) {
      console.error("Failed to delete package:", err);
    }
  }

  async function togglePackageActive(pkg: EventPackage) {
    if (!event) return;
    try {
      const response = await fetch(`/api/events/${event.id}/packages/${pkg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pkg.isActive }),
        credentials: "include",
      });
      if (response.ok) {
        await fetchPackages();
      }
    } catch (err) {
      console.error("Failed to toggle package:", err);
    }
  }

  function handlePkgDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedPkgIndex === null || draggedPkgIndex === index) return;
    const newPkgs = [...packages];
    const dragged = newPkgs[draggedPkgIndex];
    newPkgs.splice(draggedPkgIndex, 1);
    newPkgs.splice(index, 0, dragged);
    setPackages(newPkgs);
    setDraggedPkgIndex(index);
  }

  async function savePkgOrder() {
    if (!event) return;
    try {
      await fetch(`/api/events/${event.id}/packages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageIds: packages.map(p => p.id) }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to save package order:", err);
    }
  }

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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              event.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {event.status.toLowerCase()}
            </span>
          </div>
          <Link
            href={`/events/${event.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Event
          </Link>
        </div>
        <p className="text-gray-500">{event.city}, {event.country} · {formatDate(event.startAt)} to {formatDate(event.endAt)}</p>
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
            { id: "packages", label: "Packages" },
            { id: "settings", label: "Settings" },
            { id: "notifications", label: "Notifications" },
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

      {activeTab === "packages" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pricing Packages</h2>
                <p className="text-gray-500 text-sm">Manage accommodation and pricing options for your event</p>
              </div>
              <button
                onClick={() => {
                  resetPackageForm();
                  setShowPackageForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Package
              </button>
            </div>

            {packagesLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500">No packages yet</p>
                <p className="text-gray-400 text-sm mt-1">Add your first package to enable package selection during registration</p>
              </div>
            ) : (
              <div className="space-y-3">
                {packages.map((pkg, index) => (
                  <div
                    key={pkg.id}
                    draggable
                    onDragStart={() => setDraggedPkgIndex(index)}
                    onDragOver={(e) => handlePkgDragOver(e, index)}
                    onDragEnd={() => { setDraggedPkgIndex(null); savePkgOrder(); }}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      pkg.isActive ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"
                    } ${draggedPkgIndex === index ? "ring-2 ring-rose-500/20" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="cursor-grab text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      <div className={`w-2 h-12 rounded-full ${pkg.isActive ? "bg-green-500" : "bg-gray-300"}`}></div>
                      <div>
                        <p className={`font-medium ${pkg.isActive ? "text-gray-900" : "text-gray-500"}`}>
                          {pkg.name}
                        </p>
                        {pkg.description && (
                          <p className="text-gray-500 text-sm line-clamp-1">{pkg.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {(pkg.price / 100).toFixed(0)} {pkg.currency}
                        </p>
                        {pkg.capacity && (
                          <p className="text-gray-500 text-xs">Max {pkg.capacity}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePackageActive(pkg)}
                          className={`p-2 rounded-lg transition ${
                            pkg.isActive
                              ? "text-green-600 hover:bg-green-50"
                              : "text-gray-400 hover:bg-gray-100"
                          }`}
                          title={pkg.isActive ? "Disable" : "Enable"}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {pkg.isActive ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditPackage(pkg)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deletePackage(pkg.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Package Form Modal */}
          {showPackageForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingPackage ? "Edit Package" : "Add Package"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                      placeholder="e.g., 3 Days Double Room"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={packageForm.description}
                      onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                      placeholder="Describe what's included in this package"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input
                        type="number"
                        value={packageForm.price}
                        onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                        placeholder="360"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select
                        value={packageForm.currency}
                        onChange={(e) => setPackageForm({ ...packageForm, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                        <option value="TRY">TRY</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (optional)</label>
                    <input
                      type="number"
                      value={packageForm.capacity}
                      onChange={(e) => setPackageForm({ ...packageForm, capacity: e.target.value })}
                      placeholder="Maximum number of spots"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={packageForm.isActive}
                      onChange={(e) => setPackageForm({ ...packageForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible on registration form)</label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={resetPackageForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePackage}
                    disabled={updating || !packageForm.name || !packageForm.price}
                    className="px-6 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-lg transition font-medium"
                  >
                    {updating ? "Saving..." : editingPackage ? "Save Changes" : "Add Package"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h2>
            <div className="space-y-4">
              {[
                { label: "New registration notifications", description: "Get notified when someone registers for this event" },
                { label: "Payment notifications", description: "Get notified when a payment is received" },
                { label: "Waitlist notifications", description: "Get notified when someone joins the waitlist" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-gray-900 font-medium">{item.label}</p>
                    <p className="text-gray-500 text-sm">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-rose-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
