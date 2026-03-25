"use client";

import Link from "next/link";
import { useState } from "react";

// Mock event data
const mockEvent = {
  id: "1",
  title: "Spring Tango Marathon",
  slug: "spring-tango-marathon-2026",
  shortDescription: "Three days of non-stop tango in the heart of Barcelona",
  description: "Join us for an unforgettable tango experience in beautiful Barcelona!",
  startDate: "2026-04-15",
  endDate: "2026-04-17",
  startTime: "18:00",
  endTime: "06:00",
  city: "Barcelona",
  country: "Spain",
  venueName: "Sala Apolo",
  address: "Carrer Nou de la Rambla, 113",
  price: 95,
  currency: "EUR",
  capacity: 150,
  status: "published",
  djs: ["DJ Pablo", "DJ Maria", "DJ Carlos"],
};

const mockRegistrations = [
  { id: "1", name: "Anna Schmidt", email: "anna@example.com", role: "Follower", city: "Berlin", country: "Germany", status: "confirmed", paidAt: "2026-01-15", registeredAt: "2026-01-14", notes: "", experience: "Advanced" },
  { id: "2", name: "Marco Rossi", email: "marco@example.com", role: "Leader", city: "Rome", country: "Italy", status: "confirmed", paidAt: "2026-01-16", registeredAt: "2026-01-15", notes: "First marathon", experience: "Intermediate" },
  { id: "3", name: "Sofia Martinez", email: "sofia@example.com", role: "Follower", city: "Madrid", country: "Spain", status: "pending", paidAt: null, registeredAt: "2026-01-20", notes: "", experience: "Advanced" },
  { id: "4", name: "Hans Weber", email: "hans@example.com", role: "Leader", city: "Vienna", country: "Austria", status: "confirmed", paidAt: "2026-01-18", registeredAt: "2026-01-17", notes: "Vegetarian", experience: "Advanced" },
  { id: "5", name: "Elena Popov", email: "elena@example.com", role: "Follower", city: "Moscow", country: "Russia", status: "waitlist", paidAt: null, registeredAt: "2026-01-25", notes: "", experience: "Intermediate" },
];

type Registration = typeof mockRegistrations[0];

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "settings">("overview");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [copied, setCopied] = useState(false);
  const event = mockEvent;
  void params;

  const stats = {
    total: mockRegistrations.length,
    confirmed: mockRegistrations.filter(r => r.status === "confirmed").length,
    pending: mockRegistrations.filter(r => r.status === "pending").length,
    waitlist: mockRegistrations.filter(r => r.status === "waitlist").length,
    leaders: mockRegistrations.filter(r => r.role === "Leader").length,
    followers: mockRegistrations.filter(r => r.role === "Follower").length,
    revenue: mockRegistrations.filter(r => r.status === "confirmed").length * event.price,
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${event.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Role", "City", "Country", "Status", "Paid At", "Registered At", "Experience", "Notes"];
    const rows = mockRegistrations.map(r => [
      r.name, r.email, r.role, r.city, r.country, r.status, r.paidAt || "", r.registeredAt, r.experience, r.notes
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}-registrations.csv`;
    a.click();
  };

  return (
    <div className="p-8">
      {/* Registration Detail Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRegistration(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Registration Details</h2>
              <button onClick={() => setSelectedRegistration(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                  <span className="text-rose-600 font-bold text-xl">
                    {selectedRegistration.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedRegistration.name}</h3>
                  <p className="text-gray-500">{selectedRegistration.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Role</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                    selectedRegistration.role === "Leader" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                  }`}>
                    {selectedRegistration.role}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Experience</p>
                  <p className="text-gray-900 font-medium">{selectedRegistration.experience}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Location</p>
                  <p className="text-gray-900 font-medium">{selectedRegistration.city}, {selectedRegistration.country}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                    selectedRegistration.status === "confirmed" ? "bg-green-100 text-green-700" :
                    selectedRegistration.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {selectedRegistration.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Registered</p>
                  <p className="text-gray-900 font-medium">{selectedRegistration.registeredAt}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Paid</p>
                  <p className="text-gray-900 font-medium">{selectedRegistration.paidAt || "Not paid"}</p>
                </div>
              </div>

              {selectedRegistration.notes && (
                <div>
                  <p className="text-gray-500 text-sm">Notes</p>
                  <p className="text-gray-900">{selectedRegistration.notes}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-500 text-sm mb-3">Actions</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRegistration.status === "pending" && (
                    <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">
                      Mark as Paid
                    </button>
                  )}
                  <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200">
                    Resend Email
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                    Add Note
                  </button>
                  {selectedRegistration.status !== "cancelled" && (
                    <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link href="/events" className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                event.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {event.status}
              </span>
            </div>
            <p className="text-gray-500">{event.city}, {event.country} · {event.startDate} to {event.endDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/events/${event.id}/page-builder`}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Page Builder
            </Link>
            <Link
              href={`/events/${event.id}/form-builder`}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Form Builder
            </Link>
            <Link
              href={`/${event.slug}`}
              target="_blank"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Preview
            </Link>
            <Link
              href={`/events/${event.id}/edit`}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition font-medium shadow-lg shadow-rose-500/25"
            >
              Edit Event
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Total Registrations</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total} <span className="text-gray-400 text-sm font-normal">/ {event.capacity}</span></p>
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
            { id: "registrations", label: "Registrations" },
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
                <dd className="text-gray-900">{event.shortDescription}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-gray-500 text-sm">Start</dt>
                  <dd className="text-gray-900">{event.startDate} at {event.startTime}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-sm">End</dt>
                  <dd className="text-gray-900">{event.endDate} at {event.endTime}</dd>
                </div>
              </div>
              <div>
                <dt className="text-gray-500 text-sm">Venue</dt>
                <dd className="text-gray-900">{event.venueName}, {event.address}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-gray-500 text-sm">Price</dt>
                  <dd className="text-gray-900">{event.price} {event.currency}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-sm">Capacity</dt>
                  <dd className="text-gray-900">{event.capacity} dancers</dd>
                </div>
              </div>
              <div>
                <dt className="text-gray-500 text-sm">DJs</dt>
                <dd className="flex flex-wrap gap-2 mt-1">
                  {event.djs.map((dj, i) => (
                    <span key={i} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm">{dj}</span>
                  ))}
                </dd>
              </div>
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

      {activeTab === "registrations" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <input
              type="text"
              placeholder="Search registrations..."
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent w-64"
            />
            <div className="flex gap-2">
              <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500">
                <option>All Status</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Waitlist</option>
              </select>
              <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500">
                <option>All Roles</option>
                <option>Leaders</option>
                <option>Followers</option>
              </select>
              <button onClick={exportCSV} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-gray-600 font-medium px-6 py-3">Name</th>
                <th className="text-left text-gray-600 font-medium px-6 py-3">Email</th>
                <th className="text-left text-gray-600 font-medium px-6 py-3">Role</th>
                <th className="text-left text-gray-600 font-medium px-6 py-3">Location</th>
                <th className="text-left text-gray-600 font-medium px-6 py-3">Status</th>
                <th className="text-left text-gray-600 font-medium px-6 py-3">Registered</th>
                <th className="text-right text-gray-600 font-medium px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockRegistrations.map((reg) => (
                <tr
                  key={reg.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelectedRegistration(reg)}
                >
                  <td className="px-6 py-4 text-gray-900 font-medium">{reg.name}</td>
                  <td className="px-6 py-4 text-gray-600">{reg.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      reg.role === "Leader" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                    }`}>
                      {reg.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{reg.city}, {reg.country}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      reg.status === "confirmed" ? "bg-green-100 text-green-700" :
                      reg.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{reg.registeredAt}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-gray-400 hover:text-gray-600 transition"
                      onClick={(e) => { e.stopPropagation(); setSelectedRegistration(reg); }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Status</h2>
            <div className="flex items-center gap-4">
              <button className={`px-4 py-2 rounded-lg font-medium transition ${
                event.status === "published"
                  ? "bg-green-100 text-green-700 border-2 border-green-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
                Published
              </button>
              <button className={`px-4 py-2 rounded-lg font-medium transition ${
                event.status === "draft"
                  ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
                Draft
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition bg-gray-100 text-gray-600 hover:bg-gray-200">
                Closed
              </button>
            </div>
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
