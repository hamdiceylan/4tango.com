"use client";

import Link from "next/link";
import { useState } from "react";

// Mock data - all registrations across events
const mockRegistrations = [
  { id: "1", name: "Anna Schmidt", email: "anna@example.com", role: "Follower", event: "Spring Tango Marathon", eventSlug: "spring-tango-marathon-2026", status: "confirmed", paidAt: "2026-01-15", country: "Germany" },
  { id: "2", name: "Marco Rossi", email: "marco@example.com", role: "Leader", event: "Spring Tango Marathon", eventSlug: "spring-tango-marathon-2026", status: "confirmed", paidAt: "2026-01-16", country: "Italy" },
  { id: "3", name: "Sofia Martinez", email: "sofia@example.com", role: "Follower", event: "Spring Tango Marathon", eventSlug: "spring-tango-marathon-2026", status: "pending", paidAt: null, country: "Spain" },
  { id: "4", name: "Hans Weber", email: "hans@example.com", role: "Leader", event: "Spring Tango Marathon", eventSlug: "spring-tango-marathon-2026", status: "confirmed", paidAt: "2026-01-18", country: "Austria" },
  { id: "5", name: "Elena Popov", email: "elena@example.com", role: "Follower", event: "Autumn Tango Festival", eventSlug: "autumn-tango-festival-2026", status: "confirmed", paidAt: "2026-02-01", country: "Russia" },
  { id: "6", name: "Pierre Dubois", email: "pierre@example.com", role: "Leader", event: "Autumn Tango Festival", eventSlug: "autumn-tango-festival-2026", status: "confirmed", paidAt: "2026-02-02", country: "France" },
  { id: "7", name: "Yuki Tanaka", email: "yuki@example.com", role: "Follower", event: "Autumn Tango Festival", eventSlug: "autumn-tango-festival-2026", status: "pending", paidAt: null, country: "Japan" },
  { id: "8", name: "Carlos Garcia", email: "carlos@example.com", role: "Leader", event: "Spring Tango Marathon", eventSlug: "spring-tango-marathon-2026", status: "waitlist", paidAt: null, country: "Argentina" },
];

export default function RegistrationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredRegistrations = mockRegistrations.filter((reg) => {
    if (statusFilter !== "all" && reg.status !== statusFilter) return false;
    if (roleFilter !== "all" && reg.role.toLowerCase() !== roleFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      if (!reg.name.toLowerCase().includes(searchLower) &&
          !reg.email.toLowerCase().includes(searchLower) &&
          !reg.event.toLowerCase().includes(searchLower)) return false;
    }
    return true;
  });

  const stats = {
    total: mockRegistrations.length,
    confirmed: mockRegistrations.filter(r => r.status === "confirmed").length,
    pending: mockRegistrations.filter(r => r.status === "pending").length,
    waitlist: mockRegistrations.filter(r => r.status === "waitlist").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Registrations</h1>
        <p className="text-gray-500">Manage registrations across all your events</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
          <p className="text-2xl font-bold text-gray-600">{stats.waitlist}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="waitlist">Waitlist</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">All Roles</option>
              <option value="leader">Leaders</option>
              <option value="follower">Followers</option>
            </select>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium flex items-center gap-2">
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
              <th className="text-left text-gray-600 font-medium px-6 py-3">Dancer</th>
              <th className="text-left text-gray-600 font-medium px-6 py-3">Event</th>
              <th className="text-left text-gray-600 font-medium px-6 py-3">Role</th>
              <th className="text-left text-gray-600 font-medium px-6 py-3">Country</th>
              <th className="text-left text-gray-600 font-medium px-6 py-3">Status</th>
              <th className="text-left text-gray-600 font-medium px-6 py-3">Paid</th>
              <th className="text-right text-gray-600 font-medium px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.map((reg) => (
              <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-900 font-medium">{reg.name}</p>
                    <p className="text-gray-500 text-sm">{reg.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/events/1`} className="text-rose-500 hover:text-rose-600 hover:underline">
                    {reg.event}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    reg.role === "Leader" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                  }`}>
                    {reg.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{reg.country}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    reg.status === "confirmed" ? "bg-green-100 text-green-700" :
                    reg.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {reg.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{reg.paidAt || "-"}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition" title="Send email">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition" title="More options">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No registrations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
